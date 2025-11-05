-- SECURITY FIXES MIGRATION PART 3
-- Fix remaining function security issues

-- Update remaining functions to have explicit search_path
CREATE OR REPLACE FUNCTION public.finalize_due_rounds()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  r game_rounds;
  result json;
  next_round game_rounds;
BEGIN
  SELECT * INTO r FROM public.game_rounds WHERE status='active' AND now() >= end_time ORDER BY end_time ASC LIMIT 1;
  IF NOT FOUND THEN
    RETURN json_build_object('success', true, 'finalized', false);
  END IF;

  result := public.process_round_payouts(r.id);

  -- Immediately create next round
  next_round := public.get_or_create_active_round();

  -- Audit admin action
  PERFORM public.audit_admin_action('finalize_round', 'game_rounds', r.id, 
    to_jsonb(r), json_build_object('status', 'completed')::jsonb);

  RETURN json_build_object('success', true, 'finalized', true, 'result', result, 'next_round_id', next_round.id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_round_payouts(round_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  game_result json;
  res_type text;
  res_value text;
  final_result_number integer;
  final_result_group text;
  settings admin_settings;
  total_payouts numeric := 0;
  total_bets numeric := 0;
  admin_profit numeric := 0;
BEGIN
  -- Input validation
  IF round_uuid IS NULL THEN
    RAISE EXCEPTION 'Round UUID cannot be null';
  END IF;
  
  -- Calculate result
  game_result := public.calculate_game_result(round_uuid);
  res_type := game_result->>'result_type';
  res_value := game_result->>'result_value';

  IF res_type = 'number' THEN
    final_result_number := (res_value)::int;
    final_result_group := CASE WHEN final_result_number >= 5 THEN 'Big' ELSE 'Small' END;
  ELSE
    final_result_number := NULL;
    final_result_group := res_value;
  END IF;

  SELECT * INTO settings FROM public.admin_settings ORDER BY created_at DESC LIMIT 1;

  -- Update bets payouts
  UPDATE public.bets b
  SET payout_amount = CASE
        WHEN res_type='number' AND b.bet_type='number' AND b.bet_value = final_result_number THEN b.amount * COALESCE(settings.number_payout_multiplier,3.0)
        WHEN res_type='group' AND b.bet_type = final_result_group THEN b.amount * COALESCE(settings.group_payout_multiplier,2.0)
        ELSE 0
      end,
      status = CASE
        WHEN (res_type='number' AND b.bet_type='number' AND b.bet_value = final_result_number)
          OR (res_type='group' AND b.bet_type = final_result_group)
        THEN 'won' ELSE 'lost' END
  WHERE b.round_id = round_uuid;

  SELECT COALESCE(SUM(b.amount),0), COALESCE(SUM(b.payout_amount),0)
  INTO total_bets, total_payouts
  FROM public.bets b
  WHERE b.round_id = round_uuid;

  admin_profit := total_bets - total_payouts;

  -- Update round with explicit column names
  UPDATE public.game_rounds
  SET status = 'completed',
      result_number = final_result_number,
      result_group = final_result_group,
      total_bet_pool = total_bets,
      total_payout = total_payouts,
      admin_profit = admin_profit,
      updated_at = now()
  WHERE id = round_uuid;

  -- Credit winners and record transactions
  UPDATE public.betting_users u
  SET wallet_balance = wallet_balance + COALESCE(w.total_payout,0),
      total_winnings = COALESCE(total_winnings,0) + COALESCE(w.total_payout,0),
      updated_at = now()
  FROM (
    SELECT user_id, SUM(payout_amount) AS total_payout
    FROM public.bets
    WHERE round_id = round_uuid AND payout_amount > 0
    GROUP BY user_id
  ) w
  WHERE u.id = w.user_id;

  INSERT INTO public.transactions (user_id, transaction_type, amount, description, created_at, status)
  SELECT user_id, 'win', payout_amount, 'Round payout', now(), 'completed'
  FROM public.bets
  WHERE round_id = round_uuid AND payout_amount > 0;

  RETURN json_build_object(
    'success', true,
    'result_type', res_type,
    'result_value', res_value,
    'total_bets', total_bets,
    'total_payouts', total_payouts,
    'admin_profit', admin_profit
  );
END;
$function$;