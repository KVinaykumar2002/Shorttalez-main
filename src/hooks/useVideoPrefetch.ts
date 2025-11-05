import { useEffect, useRef, useState } from 'react';
import { useNetworkInfo } from './useNetworkInfo';
import { useBatteryInfo } from './useBatteryInfo';
import { videoCache } from '@/utils/videoCache';

export interface PrefetchConfig {
  enabled: boolean;
  maxConcurrent: number; // Max simultaneous prefetches
  aheadCount: number; // How many videos to prefetch ahead
  behindCount: number; // How many videos to prefetch behind
  minBattery: number; // Min battery % to prefetch
  wifiOnly: boolean; // Only prefetch on WiFi
}

interface PrefetchStats {
  totalPrefetched: number;
  cacheHits: number;
  cacheMisses: number;
  bytesTransferred: number;
  hitRate: number;
}

/**
 * Intelligent video prefetching hook
 * Prefetches upcoming videos based on scroll position, network, and battery
 */
export const useVideoPrefetch = (
  videos: Array<{ id: string; url: string }>,
  currentIndex: number,
  config?: Partial<PrefetchConfig>
) => {
  const networkInfo = useNetworkInfo();
  const batteryInfo = useBatteryInfo();
  const prefetchingRef = useRef(new Set<string>());
  const [stats, setStats] = useState<PrefetchStats>({
    totalPrefetched: 0,
    cacheHits: 0,
    cacheMisses: 0,
    bytesTransferred: 0,
    hitRate: 0,
  });

  // Default config
  const prefetchConfig: PrefetchConfig = {
    enabled: true,
    maxConcurrent: 2,
    aheadCount: networkInfo.isWiFi ? 3 : 1,
    behindCount: 1,
    minBattery: 20,
    wifiOnly: false,
    ...config,
  };

  /**
   * Prefetch a single video with partial download for instant startup
   */
  const prefetchVideo = async (videoId: string, url: string, priority: 'high' | 'low' = 'low') => {
    // Skip if already prefetching
    if (prefetchingRef.current.has(videoId)) {
      return;
    }

    // Check if already in cache
    const cached = await videoCache.has(videoId);
    if (cached) {
      console.log(`[Prefetch] Already cached: ${videoId}`);
      setStats(prev => ({
        ...prev,
        cacheHits: prev.cacheHits + 1,
        hitRate: (prev.cacheHits + 1) / (prev.cacheHits + prev.cacheMisses + 1),
      }));
      return;
    }

    prefetchingRef.current.add(videoId);
    console.log(`[Prefetch] Starting: ${videoId} (priority: ${priority})`);

    try {
      // OPTIMIZATION: For high-priority (next video), fetch first 3MB for instant startup
      if (priority === 'high') {
        try {
          // First, try partial download for instant playback
          const partialResponse = await fetch(url, {
            headers: { 'Range': 'bytes=0-3145728' }, // First 3MB
            priority: 'high',
          } as any);

          if (partialResponse.status === 206 || partialResponse.ok) {
            const partialBlob = await partialResponse.blob();
            
            // Store partial video with special key for instant startup
            await videoCache.store(`${videoId}-partial`, partialBlob, 'high');
            
            console.log(`[Prefetch] ⚡ Partial cached: ${videoId} (${(partialBlob.size / 1024 / 1024).toFixed(2)} MB)`);
            
            // Background: fetch full video
            fetchFullVideoInBackground(videoId, url, partialBlob.size);
          } else {
            // Server doesn't support range requests, fall back to full download
            throw new Error('Range not supported');
          }
        } catch (rangeError) {
          console.log(`[Prefetch] Range request failed, fetching full video: ${videoId}`);
          // Fall through to full download
        }
      }

      // Full video download (for low priority or if partial failed)
      if (priority === 'low' || !(await videoCache.has(`${videoId}-partial`))) {
        const response = await fetch(url, {
          priority: priority === 'high' ? 'high' : 'low',
        } as any);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        await videoCache.store(videoId, blob, priority);

        console.log(`[Prefetch] ✅ Full cached: ${videoId} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
      }

      setStats(prev => ({
        ...prev,
        totalPrefetched: prev.totalPrefetched + 1,
        cacheMisses: prev.cacheMisses + 1,
        bytesTransferred: prev.bytesTransferred + 3145728, // Approximate
        hitRate: prev.cacheHits / (prev.cacheHits + prev.cacheMisses + 1),
      }));

    } catch (error) {
      console.error(`[Prefetch] ❌ Failed: ${videoId}`, error);
    } finally {
      prefetchingRef.current.delete(videoId);
    }
  };

  /**
   * Fetch full video in background after partial is cached
   */
  const fetchFullVideoInBackground = async (videoId: string, url: string, alreadyFetched: number) => {
    try {
      // Fetch rest of video starting after partial
      const response = await fetch(url, {
        headers: { 'Range': `bytes=${alreadyFetched}-` },
        priority: 'low',
      } as any);

      if (response.status === 206 || response.ok) {
        const restBlob = await response.blob();
        
        // Get partial blob and combine
        const partialBlob = await videoCache.get(`${videoId}-partial`);
        if (partialBlob) {
          const fullBlob = new Blob([partialBlob, restBlob], { type: 'video/mp4' });
          await videoCache.store(videoId, fullBlob, 'high');
          
          // Clean up partial
          await videoCache.remove(`${videoId}-partial`);
          
          console.log(`[Prefetch] 🎬 Full video ready: ${videoId}`);
        }
      }
    } catch (error) {
      console.log(`[Prefetch] Background fetch failed: ${videoId}`, error);
    }
  };

  /**
   * Main prefetch logic
   */
  useEffect(() => {
    // Check if prefetching should be enabled
    const shouldPrefetch = 
      prefetchConfig.enabled &&
      networkInfo.isOnline &&
      (!prefetchConfig.wifiOnly || networkInfo.isWiFi) &&
      (!networkInfo.saveData) &&
      (batteryInfo.level > prefetchConfig.minBattery || batteryInfo.charging);

    if (!shouldPrefetch) {
      console.log('[Prefetch] Disabled:', {
        online: networkInfo.isOnline,
        wifi: networkInfo.isWiFi,
        battery: batteryInfo.level,
        dataSaver: networkInfo.saveData,
      });
      return;
    }

    // Calculate which videos to prefetch
    const toPrefetch: Array<{ index: number; priority: 'high' | 'low' }> = [];

    // Prefetch ahead (higher priority)
    for (let i = 1; i <= prefetchConfig.aheadCount; i++) {
      const index = currentIndex + i;
      if (index < videos.length) {
        toPrefetch.push({ 
          index, 
          priority: i === 1 ? 'high' : 'low' // Next video is high priority
        });
      }
    }

    // Prefetch behind (lower priority)
    for (let i = 1; i <= prefetchConfig.behindCount; i++) {
      const index = currentIndex - i;
      if (index >= 0) {
        toPrefetch.push({ index, priority: 'low' });
      }
    }

    // Limit concurrent prefetches
    const currentPrefetching = prefetchingRef.current.size;
    const available = prefetchConfig.maxConcurrent - currentPrefetching;

    if (available > 0) {
      const batch = toPrefetch.slice(0, available);
      batch.forEach(({ index, priority }) => {
        const video = videos[index];
        if (video) {
          prefetchVideo(video.id, video.url, priority);
        }
      });
    }

    // Log prefetch decision
    if (toPrefetch.length > 0) {
      console.log(`[Prefetch] Queue:`, {
        current: currentIndex,
        toPrefetch: toPrefetch.map(t => t.index),
        network: networkInfo.effectiveType,
        battery: `${batteryInfo.level}%`,
      });
    }
  }, [currentIndex, networkInfo, batteryInfo, videos]);

  /**
   * Get cached video blob URL for immediate playback (tries partial first for instant start)
   */
  const getCachedVideoUrl = async (videoId: string): Promise<{ url: string; isPartial: boolean } | null> => {
    // Try partial first for instant startup
    const partialBlob = await videoCache.get(`${videoId}-partial`);
    if (partialBlob) {
      console.log(`[Prefetch] Using partial cache for instant start: ${videoId}`);
      return { 
        url: URL.createObjectURL(partialBlob),
        isPartial: true 
      };
    }

    // Fall back to full video
    const blob = await videoCache.get(videoId);
    if (blob) {
      return { 
        url: URL.createObjectURL(blob),
        isPartial: false 
      };
    }
    
    return null;
  };

  /**
   * Clear all cached videos
   */
  const clearCache = async () => {
    await videoCache.clear();
    setStats({
      totalPrefetched: 0,
      cacheHits: 0,
      cacheMisses: 0,
      bytesTransferred: 0,
      hitRate: 0,
    });
  };

  /**
   * Get detailed cache statistics
   */
  const getCacheStats = async () => {
    return await videoCache.getStats();
  };

  return {
    stats,
    getCachedVideoUrl,
    clearCache,
    getCacheStats,
    isPrefetching: prefetchingRef.current.size > 0,
  };
};
