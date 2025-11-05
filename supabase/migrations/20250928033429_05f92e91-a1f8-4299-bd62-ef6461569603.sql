-- Create watch_progress table to track user's viewing progress
CREATE TABLE public.watch_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  episode_id UUID NOT NULL,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, episode_id)
);

-- Enable Row Level Security
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for watch_progress
CREATE POLICY "Users can view their own watch progress" 
ON public.watch_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch progress" 
ON public.watch_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch progress" 
ON public.watch_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch progress" 
ON public.watch_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_watch_progress_updated_at
BEFORE UPDATE ON public.watch_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();