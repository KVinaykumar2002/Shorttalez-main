-- Remove betting-related tables and functions
DROP TABLE IF EXISTS public.bets CASCADE;
DROP TABLE IF EXISTS public.betting_users CASCADE; 
DROP TABLE IF EXISTS public.game_rounds CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Remove betting-related functions
DROP FUNCTION IF EXISTS public.get_betting_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_betting_stats(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_active_round() CASCADE;
DROP FUNCTION IF EXISTS public.get_public_betting_leaderboard() CASCADE;
DROP FUNCTION IF EXISTS public.get_public_betting_users() CASCADE;
DROP FUNCTION IF EXISTS public.finalize_due_rounds() CASCADE;