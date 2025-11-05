-- Add foreign key relationship for watch_progress table
ALTER TABLE public.watch_progress 
ADD CONSTRAINT fk_watch_progress_episode_id 
FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;

-- Add foreign key relationship for user_id 
ALTER TABLE public.watch_progress 
ADD CONSTRAINT fk_watch_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;