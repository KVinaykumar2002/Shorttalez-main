import { useEffect, useRef } from 'react';

export const useVideoPlayback = (
  isPlaying: boolean,
  videoRef: React.RefObject<HTMLVideoElement>,
  onPlayStateChange?: (playing: boolean) => void,
  onProgressUpdate?: (currentTime: number, duration: number) => void
) => {
  const previousPlayingRef = useRef(isPlaying);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlayStateChange = async () => {
      try {
        if (isPlaying && video.paused) {
          console.log('Starting video playback');
          const playPromise = video.play();
          if (playPromise) {
            await playPromise;
          }
        } else if (!isPlaying && !video.paused) {
          console.log('Pausing video playback');
          video.pause();
        }
      } catch (error) {
        console.error('Error controlling video playback:', error);
        // Only call the callback if it exists to prevent errors
        if (onPlayStateChange) {
          onPlayStateChange(false);
        }
      }
    };

    // Only trigger if play state actually changed
    if (previousPlayingRef.current !== isPlaying) {
      previousPlayingRef.current = isPlaying;
      handlePlayStateChange();
    }
  }, [isPlaying, videoRef, onPlayStateChange]);

  // Add event listeners to sync state and track progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      console.log('Video play event fired');
      if (onPlayStateChange) {
        onPlayStateChange(true);
      }
    };

    const handlePause = () => {
      console.log('Video pause event fired');
      if (onPlayStateChange) {
        onPlayStateChange(false);
      }
    };

    const handleTimeUpdate = () => {
      if (onProgressUpdate && video.duration && !isNaN(video.duration)) {
        onProgressUpdate(video.currentTime, video.duration);
      }
    };

    const handleError = (e: Event) => {
      console.error('Video playback error:', e);
      if (onPlayStateChange) {
        onPlayStateChange(false);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
    };
  }, [videoRef, onPlayStateChange, onProgressUpdate]);
};