import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WatchProgress {
  id: string;
  user_id: string;
  episode_id: string;
  progress_seconds: number;
  duration_seconds: number;
  last_watched_at: string;
}

export interface ContinueWatchingEpisode {
  id: string;
  title: string;
  thumbnail_url: string;
  progress_seconds: number;
  duration_seconds: number;
  series_id: string;
  series_title: string;
  episode_number: number;
}

export const useWatchProgress = () => {
  const { user } = useAuth();
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingEpisode[]>([]);
  const [loading, setLoading] = useState(false);

  const updateWatchProgress = useCallback(async (
    episodeId: string,
    progressSeconds: number,
    durationSeconds: number
  ) => {
    if (!user || progressSeconds < 5) return;

    try {
      const { error } = await supabase
        .from('watch_progress')
        .upsert({
          user_id: user.id,
          episode_id: episodeId,
          progress_seconds: Math.floor(progressSeconds),
          duration_seconds: Math.floor(durationSeconds),
          last_watched_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating watch progress:', error);
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  }, [user]);

  const fetchContinueWatching = useCallback(async () => {
    if (!user) {
      setContinueWatching([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watch_progress')
        .select(`
          id,
          episode_id,
          progress_seconds,
          duration_seconds,
          last_watched_at,
          episodes!inner (
            id,
            title,
            thumbnail_url,
            episode_number,
            series_id,
            series!inner (
              id,
              title
            )
          )
        `)
        .eq('user_id', user.id)
        .gt('progress_seconds', 5)
        .gte('duration_seconds', 30) // Episodes must be at least 30 seconds long and user watched at least 5 seconds
        .order('last_watched_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching continue watching:', error);
        return;
      }

      const formattedData: ContinueWatchingEpisode[] = data?.map((item: any) => ({
        id: item.episodes.id,
        title: item.episodes.title,
        thumbnail_url: item.episodes.thumbnail_url,
        progress_seconds: item.progress_seconds,
        duration_seconds: item.duration_seconds,
        series_id: item.episodes.series_id,
        series_title: item.episodes.series.title,
        episode_number: item.episodes.episode_number
      })) || [];

      setContinueWatching(formattedData);
    } catch (error) {
      console.error('Error fetching continue watching:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeFromContinueWatching = useCallback(async (episodeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watch_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('episode_id', episodeId);

      if (error) {
        console.error('Error removing from continue watching:', error);
      } else {
        setContinueWatching(prev => prev.filter(item => item.id !== episodeId));
      }
    } catch (error) {
      console.error('Error removing from continue watching:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchContinueWatching();
  }, [fetchContinueWatching]);

  return {
    continueWatching,
    loading,
    updateWatchProgress,
    fetchContinueWatching,
    removeFromContinueWatching
  };
};