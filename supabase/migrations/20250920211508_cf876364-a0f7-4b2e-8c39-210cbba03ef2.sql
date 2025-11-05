-- SECURITY FIXES MIGRATION PART 2
-- Fix remaining security linter warnings

-- 1. Fix remaining functions missing explicit search_path
CREATE OR REPLACE FUNCTION public.increment_episode_views(episode_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    series_id_var UUID;
BEGIN
    -- Input validation
    IF episode_id_param IS NULL THEN
        RAISE EXCEPTION 'Episode ID cannot be null';
    END IF;
    
    -- Increment episode views
    UPDATE public.episodes 
    SET views = views + 1 
    WHERE id = episode_id_param;
    
    -- Get the series_id for this episode
    SELECT series_id INTO series_id_var 
    FROM public.episodes 
    WHERE id = episode_id_param;
    
    -- Increment series total views
    IF series_id_var IS NOT NULL THEN
        UPDATE public.series 
        SET total_views = total_views + 1 
        WHERE id = series_id_var;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_bet_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  r game_rounds;
  settings admin_settings;
  current_balance numeric;
BEGIN
  -- Enhanced input validation
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  IF NEW.round_id IS NULL THEN
    RAISE EXCEPTION 'Round ID cannot be null';
  END IF;
  
  -- Round validity
  SELECT * INTO r FROM public.game_rounds WHERE id = NEW.round_id FOR UPDATE;
  IF NOT FOUND OR r.status <> 'active' THEN
    RAISE EXCEPTION 'Invalid or inactive round';
  END IF;
  IF now() >= r.betting_end_time THEN
    RAISE EXCEPTION 'Betting period ended for this round';
  END IF;

  -- Load settings
  SELECT * INTO settings FROM public.admin_settings ORDER BY created_at DESC LIMIT 1;

  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF settings.min_bet_amount IS NOT NULL AND NEW.amount < settings.min_bet_amount THEN
    RAISE EXCEPTION 'Amount below minimum bet %', settings.min_bet_amount;
  END IF;
  IF settings.max_bet_amount IS NOT NULL AND NEW.amount > settings.max_bet_amount THEN
    RAISE EXCEPTION 'Amount above maximum bet %', settings.max_bet_amount;
  END IF;

  -- Validate type/value
  IF NEW.bet_type = 'number' THEN
    IF NEW.bet_value IS NULL OR NEW.bet_value < 0 OR NEW.bet_value > 9 THEN
      RAISE EXCEPTION 'Invalid number bet';
    END IF;
    NEW.payout_multiplier := COALESCE(settings.number_payout_multiplier, 3.0);
  ELSIF NEW.bet_type IN ('Big','Small') THEN
    NEW.bet_value := NULL;
    NEW.payout_multiplier := COALESCE(settings.group_payout_multiplier, 2.0);
  ELSE
    RAISE EXCEPTION 'Invalid bet_type';
  END IF;

  -- Deduct balance atomically
  SELECT wallet_balance INTO current_balance FROM public.betting_users WHERE id = NEW.user_id FOR UPDATE;
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  IF current_balance < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.betting_users SET
    wallet_balance = wallet_balance - NEW.amount,
    total_bets_placed = COALESCE(total_bets_placed,0) + 1,
    updated_at = now()
  WHERE id = NEW.user_id;

  -- Record transaction for bet
  INSERT INTO public.transactions (user_id, transaction_type, amount, description, created_at, status)
  VALUES (NEW.user_id, 'bet', NEW.amount, 'Bet placed', now(), 'completed');

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_active_round()
RETURNS game_rounds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  r public.game_rounds;
  dur_seconds int;
  bet_end_before int;
  start_ts timestamptz := now();
  end_ts timestamptz;
  bet_end_ts timestamptz;
  round_no text;
BEGIN
  SELECT * INTO r FROM public.game_rounds WHERE status='active' AND now() BETWEEN start_time AND end_time ORDER BY start_time DESC LIMIT 1;
  IF FOUND THEN
    RETURN r;
  END IF;

  SELECT COALESCE(round_duration_seconds,60), COALESCE(betting_end_before_seconds,30)
  INTO dur_seconds, bet_end_before
  FROM public.admin_settings
  ORDER BY created_at DESC
  LIMIT 1;

  -- Input validation
  IF dur_seconds <= 0 OR dur_seconds > 3600 THEN
    dur_seconds := 60; -- Default to 60 seconds
  END IF;
  
  IF bet_end_before <= 0 OR bet_end_before >= dur_seconds THEN
    bet_end_before := 30; -- Default to 30 seconds
  END IF;

  end_ts := start_ts + make_interval(secs => dur_seconds);
  bet_end_ts := end_ts - make_interval(secs => bet_end_before);
  round_no := to_char(start_ts, 'YYYYMMDDHH24MISS');

  INSERT INTO public.game_rounds (start_time,end_time,betting_end_time,status,round_number,created_at,updated_at)
  VALUES (start_ts, end_ts, bet_end_ts, 'active', round_no, now(), now())
  RETURNING * INTO r;

  RETURN r;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_game_result(round_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result json;
BEGIN
  -- Input validation
  IF round_uuid IS NULL THEN
    RAISE EXCEPTION 'Round UUID cannot be null';
  END IF;
  
  WITH number_totals AS (
    SELECT generate_series(0,9) AS val
  ), totals AS (
    SELECT ('number:'||val)::text AS key, COALESCE(SUM(b.amount),0)::numeric AS total,
           'number'::text AS result_type, val::text AS result_value
    FROM number_totals nt
    LEFT JOIN public.bets b
      ON b.round_id=round_uuid AND b.bet_type='number' AND b.bet_value = nt.val
    GROUP BY val
    UNION ALL
    SELECT 'group:Big', COALESCE(SUM(amount),0)::numeric, 'group','Big'
    FROM public.bets WHERE round_id=round_uuid AND bet_type='Big'
    UNION ALL
    SELECT 'group:Small', COALESCE(SUM(amount),0)::numeric, 'group','Small'
    FROM public.bets WHERE round_id=round_uuid AND bet_type='Small'
  ), min_tot AS (
    SELECT MIN(total) AS min_total FROM totals
  ), candidates AS (
    SELECT t.* FROM totals t, min_tot m WHERE t.total = m.min_total
  )
  SELECT json_build_object('result_type', result_type, 'result_value', result_value)
  INTO result
  FROM candidates
  ORDER BY random()
  LIMIT 1;

  RETURN result;
END;
$function$;

-- 2. Move extensions out of public schema where possible
-- Note: Some extensions like uuid-ossp might need to stay in public for compatibility
-- This is more of a warning than a critical issue, but we'll document it

-- 3. Add additional security constraints
ALTER TABLE public.episodes 
ADD CONSTRAINT valid_episode_number CHECK (episode_number > 0 AND episode_number <= 10000);

ALTER TABLE public.series 
ADD CONSTRAINT valid_episode_count CHECK (episode_count >= 0 AND episode_count <= 10000);

ALTER TABLE public.bets
ADD CONSTRAINT valid_bet_amount CHECK (amount > 0 AND amount <= 1000000);

-- 4. Create function to audit admin actions
CREATE OR REPLACE FUNCTION public.audit_admin_action(
  action_type_param varchar,
  target_table_param varchar DEFAULT NULL,
  target_id_param uuid DEFAULT NULL,
  old_values_param jsonb DEFAULT NULL,
  new_values_param jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only allow admins to call this function
  IF NOT public.has_current_role('admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Input validation
  IF action_type_param IS NULL OR LENGTH(TRIM(action_type_param)) = 0 THEN
    RAISE EXCEPTION 'Action type cannot be empty';
  END IF;
  
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action_type,
    target_table,
    target_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    action_type_param,
    target_table_param,
    target_id_param,
    old_values_param,
    new_values_param,
    now()
  );
END;
$function$;

-- 5. Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action_type_param varchar,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_attempts integer;
  user_id_param uuid := auth.uid();
BEGIN
  -- Input validation
  IF action_type_param IS NULL OR LENGTH(TRIM(action_type_param)) = 0 THEN
    RAISE EXCEPTION 'Action type cannot be empty';
  END IF;
  
  IF max_attempts <= 0 OR window_minutes <= 0 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;
  
  -- Count recent attempts
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM public.rate_limits
  WHERE user_id = user_id_param
    AND action_type = action_type_param
    AND window_start > now() - INTERVAL '1 minute' * window_minutes;
  
  -- If under limit, record this attempt
  IF current_attempts < max_attempts THEN
    INSERT INTO public.rate_limits (user_id, action_type, attempts, window_start)
    VALUES (user_id_param, action_type_param, 1, now())
    ON CONFLICT (user_id, action_type) 
    DO UPDATE SET 
      attempts = rate_limits.attempts + 1,
      window_start = CASE 
        WHEN rate_limits.window_start < now() - INTERVAL '1 minute' * window_minutes 
        THEN now() 
        ELSE rate_limits.window_start 
      END;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Create unique index for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON public.rate_limits (user_id, action_type);

-- 6. Enhanced XSS protection for posts
CREATE OR REPLACE FUNCTION public.validate_post_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Validate content if present
  IF NEW.content IS NOT NULL THEN
    IF LENGTH(NEW.content) > 5000 THEN
      RAISE EXCEPTION 'Post content exceeds maximum length';
    END IF;
    
    -- Remove potential XSS patterns
    NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
    NEW.content := regexp_replace(NEW.content, 'javascript:', '', 'gi');
    NEW.content := regexp_replace(NEW.content, 'vbscript:', '', 'gi');
    NEW.content := regexp_replace(NEW.content, 'on\w+\s*=', '', 'gi');
  END IF;
  
  -- Validate media URL if present
  IF NEW.media_url IS NOT NULL THEN
    -- Basic URL validation
    IF NOT (NEW.media_url ~ '^https?://') THEN
      RAISE EXCEPTION 'Invalid media URL format';
    END IF;
    
    IF LENGTH(NEW.media_url) > 2000 THEN
      RAISE EXCEPTION 'Media URL too long';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add trigger for post validation
DROP TRIGGER IF EXISTS validate_post_content_trigger ON public.posts;
CREATE TRIGGER validate_post_content_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_post_content();