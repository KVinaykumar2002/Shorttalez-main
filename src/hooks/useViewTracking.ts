import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseViewTrackingProps {
  episodeId?: string;
  onViewCounted?: () => void;
}

export const useViewTracking = ({ episodeId, onViewCounted }: UseViewTrackingProps) => {
  const { user } = useAuth();
  const hasTrackedView = useRef(false);
  const viewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset tracking state whenever episodeId changes (new video loaded)
  useEffect(() => {
    hasTrackedView.current = false;
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
      viewTimeoutRef.current = null;
    }
  }, [episodeId]);

  const trackView = useCallback(async () => {
    if (!episodeId || hasTrackedView.current) return;

    try {
      console.log('Tracking view for episode:', episodeId);
      
      // Call the database function to increment views for both episode and series
      const { error } = await supabase.rpc('increment_episode_views', {
        episode_id_param: episodeId
      });

      if (error) {
        console.error('Error tracking view:', error);
        return;
      }

      hasTrackedView.current = true;
      onViewCounted?.();
      console.log('View tracked successfully for episode:', episodeId);
      
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw error - view tracking failure shouldn't break the app
    }
  }, [episodeId, onViewCounted]);

  const startViewTracking = useCallback(() => {
    if (!episodeId || hasTrackedView.current) return;

    // Clear any existing timeout
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
    }

    // Track view immediately when video is opened/loaded (not after waiting)
    // This ensures every page load/refresh counts as a view
    trackView();
  }, [trackView, episodeId]);

  const stopViewTracking = useCallback(() => {
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
      viewTimeoutRef.current = null;
    }
  }, []);

  const resetViewTracking = useCallback(() => {
    hasTrackedView.current = false;
    stopViewTracking();
  }, [stopViewTracking]);

  return {
    startViewTracking,
    stopViewTracking,
    resetViewTracking,
    trackView
  };
};