import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VideoMetrics {
  videoId: string;
  firstFrameTime?: number;
  timeToPlay?: number;
  rebufferCount: number;
  rebufferDuration: number;
  watchDuration: number;
  completionRate: number;
  fromCache: boolean;
  networkType: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Track video playback metrics for optimization analysis
 */
export const useVideoAnalytics = (
  videoId: string,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  const metricsRef = useRef<Partial<VideoMetrics>>({
    videoId,
    rebufferCount: 0,
    rebufferDuration: 0,
    watchDuration: 0,
    completionRate: 0,
    fromCache: false,
  });
  const startTimeRef = useRef<number>(Date.now());
  const rebufferStartRef = useRef<number | null>(null);
  const watchStartRef = useRef<number | null>(null);

  const trackEvent = async (eventName: string, data: any) => {
    try {
      // Log to console for debugging
      console.log(`[Analytics] ${eventName}:`, data);
      
      // Send to Supabase (optional - create table if needed)
      // await supabase.from('video_analytics').insert({
      //   event: eventName,
      //   video_id: videoId,
      //   data,
      //   timestamp: new Date().toISOString(),
      // });
    } catch (error) {
      console.error('[Analytics] Failed to track:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset metrics for new video
    startTimeRef.current = Date.now();
    metricsRef.current = {
      videoId,
      rebufferCount: 0,
      rebufferDuration: 0,
      watchDuration: 0,
      completionRate: 0,
      fromCache: false,
    };

    // Track first frame
    const handleLoadedData = () => {
      const firstFrameTime = Date.now() - startTimeRef.current;
      metricsRef.current.firstFrameTime = firstFrameTime;
      
      trackEvent('first_frame', {
        videoId,
        firstFrameTime,
        src: video.src.substring(0, 50),
      });
    };

    // Track playback start
    const handlePlaying = () => {
      if (!metricsRef.current.timeToPlay) {
        const timeToPlay = Date.now() - startTimeRef.current;
        metricsRef.current.timeToPlay = timeToPlay;
        
        trackEvent('playback_start', {
          videoId,
          timeToPlay,
          readyState: video.readyState,
        });
      }

      // Resume watch timer
      watchStartRef.current = Date.now();

      // End rebuffer if any
      if (rebufferStartRef.current) {
        const rebufferDuration = Date.now() - rebufferStartRef.current;
        metricsRef.current.rebufferDuration += rebufferDuration;
        rebufferStartRef.current = null;

        trackEvent('rebuffer_end', {
          videoId,
          duration: rebufferDuration,
          totalRebufferTime: metricsRef.current.rebufferDuration,
        });
      }
    };

    // Track buffering/stalling
    const handleWaiting = () => {
      metricsRef.current.rebufferCount++;
      rebufferStartRef.current = Date.now();

      // Pause watch timer
      if (watchStartRef.current) {
        metricsRef.current.watchDuration += Date.now() - watchStartRef.current;
        watchStartRef.current = null;
      }

      trackEvent('rebuffer_start', {
        videoId,
        rebufferCount: metricsRef.current.rebufferCount,
        currentTime: video.currentTime,
      });
    };

    // Track pause
    const handlePause = () => {
      if (watchStartRef.current) {
        metricsRef.current.watchDuration += Date.now() - watchStartRef.current;
        watchStartRef.current = null;
      }
    };

    // Track completion
    const handleEnded = () => {
      if (watchStartRef.current) {
        metricsRef.current.watchDuration += Date.now() - watchStartRef.current;
      }

      const completionRate = video.duration 
        ? (metricsRef.current.watchDuration / 1000) / video.duration
        : 0;
      metricsRef.current.completionRate = Math.min(completionRate, 1);

      trackEvent('video_completed', {
        videoId,
        ...metricsRef.current,
      });
    };

    // Track errors
    const handleError = (e: Event) => {
      const error = video.error;
      trackEvent('playback_error', {
        videoId,
        code: error?.code,
        message: error?.message,
      });
    };

    // Attach listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [videoId, videoRef]);

  return {
    metrics: metricsRef.current,
    trackEvent,
  };
};
