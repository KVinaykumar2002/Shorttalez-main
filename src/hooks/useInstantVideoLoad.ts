import { useState, useEffect, useRef, useCallback } from 'react';
import { videoCache } from '@/utils/videoCache';

interface InstantVideoLoadOptions {
  videoId: string;
  videoUrl: string;
  autoLoad?: boolean;
  priority?: 'high' | 'low';
}

/**
 * Hook for instant video loading with progressive enhancement
 * - Loads partial video for instant startup
 * - Shows loading skeleton during fetch
 * - Seamlessly switches to full video when ready
 */
export const useInstantVideoLoad = ({ 
  videoId, 
  videoUrl, 
  autoLoad = true,
  priority = 'high' 
}: InstantVideoLoadOptions) => {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPartial, setIsPartial] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadVideo = useCallback(async () => {
    setIsLoading(true);
    setLoadProgress(0);

    try {
      // Step 1: Check cache (partial or full)
      const partialBlob = await videoCache.get(`${videoId}-partial`);
      if (partialBlob) {
        const url = URL.createObjectURL(partialBlob);
        setVideoSrc(url);
        setIsPartial(true);
        setIsLoading(false);
        setLoadProgress(30);
        console.log(`[InstantLoad] ⚡ Using cached partial: ${videoId}`);
        
        // Background: load full video
        loadFullVideo();
        return;
      }

      const fullBlob = await videoCache.get(videoId);
      if (fullBlob) {
        const url = URL.createObjectURL(fullBlob);
        setVideoSrc(url);
        setIsPartial(false);
        setIsLoading(false);
        setLoadProgress(100);
        console.log(`[InstantLoad] ✅ Using cached full: ${videoId}`);
        return;
      }

      // Step 2: Not cached - fetch with progress
      await fetchWithProgress();

    } catch (error) {
      console.error(`[InstantLoad] Failed to load: ${videoId}`, error);
      // Fallback to direct URL
      setVideoSrc(videoUrl);
      setIsLoading(false);
      setIsPartial(false);
    }
  }, [videoId, videoUrl]);

  const fetchWithProgress = async () => {
    abortControllerRef.current = new AbortController();

    try {
      // Try partial download first (3MB for instant startup)
      const partialResponse = await fetch(videoUrl, {
        headers: { 'Range': 'bytes=0-3145728' },
        signal: abortControllerRef.current.signal,
        priority: priority === 'high' ? 'high' : 'low',
      } as any);

      if (partialResponse.status === 206 || partialResponse.ok) {
        const reader = partialResponse.body?.getReader();
        if (!reader) throw new Error('No reader');

        const chunks: Uint8Array[] = [];
        let receivedLength = 0;
        const contentLength = parseInt(partialResponse.headers.get('Content-Length') || '3145728');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          receivedLength += value.length;
          setLoadProgress(Math.min(30, (receivedLength / contentLength) * 30));
        }

        const partialBlob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
        await videoCache.store(`${videoId}-partial`, partialBlob, 'high');

        const url = URL.createObjectURL(partialBlob);
        setVideoSrc(url);
        setIsPartial(true);
        setIsLoading(false);
        
        console.log(`[InstantLoad] ⚡ Fetched partial: ${videoId}`);

        // Background: fetch rest
        loadFullVideo();
      } else {
        // Server doesn't support range, fetch full
        await fetchFull();
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('[InstantLoad] Partial fetch failed:', error);
      await fetchFull();
    }
  };

  const fetchFull = async () => {
    try {
      const response = await fetch(videoUrl, {
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      await videoCache.store(videoId, blob, priority);

      const url = URL.createObjectURL(blob);
      setVideoSrc(url);
      setIsPartial(false);
      setIsLoading(false);
      setLoadProgress(100);
      
      console.log(`[InstantLoad] ✅ Fetched full: ${videoId}`);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      throw error;
    }
  };

  const loadFullVideo = async () => {
    try {
      const cachedFull = await videoCache.get(videoId);
      if (cachedFull) {
        const url = URL.createObjectURL(cachedFull);
        setVideoSrc(url);
        setIsPartial(false);
        setLoadProgress(100);
        return;
      }

      // Fetch full video in background
      const response = await fetch(videoUrl, { priority: 'low' } as any);
      const blob = await response.blob();
      await videoCache.store(videoId, blob, 'high');
      
      // Update to full video
      const url = URL.createObjectURL(blob);
      setVideoSrc(url);
      setIsPartial(false);
      setLoadProgress(100);
      
      // Clean up partial
      await videoCache.remove(`${videoId}-partial`);
      
      console.log(`[InstantLoad] 🎬 Upgraded to full: ${videoId}`);
    } catch (error) {
      console.error('[InstantLoad] Full load failed:', error);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadVideo();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clean up blob URLs
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoId, autoLoad]);

  return {
    videoSrc,
    isLoading,
    isPartial,
    loadProgress,
    reload: loadVideo,
  };
};
