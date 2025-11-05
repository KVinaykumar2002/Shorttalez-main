-- Clean up demo data and keep only Toxic Boy friend series
-- Update the creator profile to "Tall Talez Productions"
UPDATE public.profiles 
SET 
    username = 'tall_talez_productions',
    display_name = 'Tall Talez Productions',
    bio = 'Creator of compelling drama series exploring complex human relationships and social dynamics.',
    updated_at = now()
WHERE id = '140242e4-b30c-412d-8753-53532e00d601';

UPDATE public.creators 
SET 
    bio = 'Tall Talez Productions - Creating thought-provoking drama series that explore the complexities of modern relationships.',
    verified = true,
    updated_at = now()
WHERE user_id = '140242e4-b30c-412d-8753-53532e00d601';

-- Delete all other series and their episodes (keeping only Toxic Boy friend)
DO $$
DECLARE
    toxic_series_id uuid;
BEGIN
    -- Get the Toxic Boy friend series ID
    SELECT id INTO toxic_series_id 
    FROM public.series 
    WHERE title = 'Toxic Boy friend' 
    LIMIT 1;
    
    -- Delete episodes from other series
    DELETE FROM public.episodes 
    WHERE series_id != toxic_series_id OR series_id IS NULL;
    
    -- Delete other series
    DELETE FROM public.series 
    WHERE id != toxic_series_id OR id IS NULL;
    
    -- Clean up any orphaned data
    DELETE FROM public.comments WHERE episode_id NOT IN (SELECT id FROM public.episodes);
    DELETE FROM public.interactions WHERE target_type = 'episode' AND target_id NOT IN (SELECT id FROM public.episodes);
    DELETE FROM public.interactions WHERE target_type = 'series' AND target_id NOT IN (SELECT id FROM public.series);
    DELETE FROM public.subscriptions WHERE creator_id NOT IN (SELECT id FROM public.creators);
    DELETE FROM public.notifications WHERE user_id != '140242e4-b30c-412d-8753-53532e00d601';
    
    -- Reset any betting/gaming demo data if it exists
    DELETE FROM public.bets;
    DELETE FROM public.game_rounds;
    DELETE FROM public.transactions;
    DELETE FROM public.betting_users WHERE id != '140242e4-b30c-412d-8753-53532e00d601';
    
    -- Clean up other user profiles except the main one
    DELETE FROM public.profiles WHERE id != '140242e4-b30c-412d-8753-53532e00d601';
    DELETE FROM public.creators WHERE user_id != '140242e4-b30c-412d-8753-53532e00d601';
    
    RAISE NOTICE 'Demo data cleanup completed. Kept Toxic Boy friend series under Tall Talez Productions.';
END $$;