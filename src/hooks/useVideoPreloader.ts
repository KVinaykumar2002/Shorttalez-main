import { useEffect, useRef } from 'react';

/**
 * Preloads the next video for instant playback like Instagram Reels
 * Significantly improves perceived loading speed
 */
export const useVideoPreloader = (
  currentVideoUrl: string,
  nextVideoUrl?: string,
  enabled: boolean = true
) => {
  const preloadedVideos = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    if (!enabled || !nextVideoUrl) return;

    // Don't preload if it's already loaded
    if (preloadedVideos.current.has(nextVideoUrl)) return;

    // Create hidden video element for preloading
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.style.display = 'none';
    
    // Set source
    video.src = nextVideoUrl;
    
    // Load the video
    video.load();
    
    // Store reference
    preloadedVideos.current.set(nextVideoUrl, video);
    
    // Append to body (hidden)
    document.body.appendChild(video);

    // Cleanup old preloaded videos (keep only last 2)
    if (preloadedVideos.current.size > 2) {
      const firstKey = Array.from(preloadedVideos.current.keys())[0];
      const oldVideo = preloadedVideos.current.get(firstKey);
      if (oldVideo && firstKey !== currentVideoUrl && firstKey !== nextVideoUrl) {
        oldVideo.remove();
        preloadedVideos.current.delete(firstKey);
      }
    }

    return () => {
      // Don't cleanup immediately - keep for navigation
    };
  }, [nextVideoUrl, currentVideoUrl, enabled]);

  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      preloadedVideos.current.forEach(video => video.remove());
      preloadedVideos.current.clear();
    };
  }, []);

  return {
    isPreloaded: (url: string) => preloadedVideos.current.has(url),
    getPreloadedVideo: (url: string) => preloadedVideos.current.get(url)
  };
};

