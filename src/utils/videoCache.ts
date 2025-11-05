/**
 * Video Cache Manager
 * Implements 2-tier caching: Memory (fast) + Disk (persistent)
 * Uses LRU eviction policy with size limits
 */

interface CacheEntry {
  videoId: string;
  data: Blob;
  timestamp: number;
  size: number;
  priority: 'high' | 'low';
}

export class VideoCache {
  private memoryCache = new Map<string, CacheEntry>();
  private diskCacheName = 'video-cache-v1';
  
  // Cache limits
  private readonly MAX_MEMORY_ENTRIES = 5; // ~100-200MB depending on video size
  private readonly MAX_DISK_ENTRIES = 50; // ~1-2GB depending on video size
  private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Store video in cache (memory for high priority, disk for all)
   */
  async store(
    videoId: string, 
    data: Blob, 
    priority: 'high' | 'low' = 'low'
  ): Promise<void> {
    const entry: CacheEntry = {
      videoId,
      data,
      timestamp: Date.now(),
      size: data.size,
      priority,
    };

    // High priority → Memory cache (currently playing + next 2)
    if (priority === 'high' && this.memoryCache.size < this.MAX_MEMORY_ENTRIES) {
      this.memoryCache.set(videoId, entry);
      console.log(`[VideoCache] Stored in memory: ${videoId}`);
    }

    // All videos → Disk cache via Cache API
    try {
      const cache = await caches.open(this.diskCacheName);
      const response = new Response(data, {
        headers: {
          'Content-Type': 'video/mp4',
          'X-Cached-At': entry.timestamp.toString(),
          'X-Video-ID': videoId,
        },
      });
      
      await cache.put(this.getCacheKey(videoId), response);
      console.log(`[VideoCache] Stored in disk: ${videoId} (${(data.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Evict old entries if needed
      await this.evictIfNeeded();
    } catch (error) {
      console.error('[VideoCache] Failed to store in disk:', error);
    }
  }

  /**
   * Retrieve video from cache (checks memory first, then disk)
   */
  async get(videoId: string): Promise<Blob | null> {
    // Check memory cache first (fastest)
    const memoryEntry = this.memoryCache.get(videoId);
    if (memoryEntry) {
      // Update access time (for LRU)
      memoryEntry.timestamp = Date.now();
      console.log(`[VideoCache] HIT (memory): ${videoId}`);
      return memoryEntry.data;
    }

    // Check disk cache
    try {
      const cache = await caches.open(this.diskCacheName);
      const response = await cache.match(this.getCacheKey(videoId));
      
      if (response) {
        const cachedAt = parseInt(response.headers.get('X-Cached-At') || '0');
        const age = Date.now() - cachedAt;

        // Check if expired
        if (age > this.MAX_AGE_MS) {
          console.log(`[VideoCache] EXPIRED: ${videoId}`);
          await cache.delete(this.getCacheKey(videoId));
          return null;
        }

        const blob = await response.blob();
        
        // Promote to memory cache if accessed
        if (this.memoryCache.size < this.MAX_MEMORY_ENTRIES) {
          this.memoryCache.set(videoId, {
            videoId,
            data: blob,
            timestamp: Date.now(),
            size: blob.size,
            priority: 'high',
          });
        }

        console.log(`[VideoCache] HIT (disk): ${videoId}`);
        return blob;
      }
    } catch (error) {
      console.error('[VideoCache] Failed to retrieve from disk:', error);
    }

    console.log(`[VideoCache] MISS: ${videoId}`);
    return null;
  }

  /**
   * Check if video exists in cache
   */
  async has(videoId: string): Promise<boolean> {
    if (this.memoryCache.has(videoId)) {
      return true;
    }

    try {
      const cache = await caches.open(this.diskCacheName);
      const response = await cache.match(this.getCacheKey(videoId));
      return !!response;
    } catch {
      return false;
    }
  }

  /**
   * Remove specific video from cache
   */
  async remove(videoId: string): Promise<void> {
    this.memoryCache.delete(videoId);
    
    try {
      const cache = await caches.open(this.diskCacheName);
      await cache.delete(this.getCacheKey(videoId));
      console.log(`[VideoCache] Removed: ${videoId}`);
    } catch (error) {
      console.error('[VideoCache] Failed to remove:', error);
    }
  }

  /**
   * Clear all cached videos
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      await caches.delete(this.diskCacheName);
      console.log('[VideoCache] Cleared all cache');
    } catch (error) {
      console.error('[VideoCache] Failed to clear:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memoryEntries: number;
    diskEntries: number;
    totalSizeMB: number;
  }> {
    const memorySize = Array.from(this.memoryCache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    let diskEntries = 0;
    let diskSize = 0;

    try {
      const cache = await caches.open(this.diskCacheName);
      const keys = await cache.keys();
      diskEntries = keys.length;

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          diskSize += blob.size;
        }
      }
    } catch (error) {
      console.error('[VideoCache] Failed to get stats:', error);
    }

    return {
      memoryEntries: this.memoryCache.size,
      diskEntries,
      totalSizeMB: (memorySize + diskSize) / 1024 / 1024,
    };
  }

  /**
   * Evict old entries using LRU policy
   */
  private async evictIfNeeded(): Promise<void> {
    try {
      const cache = await caches.open(this.diskCacheName);
      const keys = await cache.keys();

      // If over limit, remove oldest entries
      if (keys.length > this.MAX_DISK_ENTRIES) {
        // Sort by timestamp (oldest first)
        const entries = await Promise.all(
          keys.map(async (key) => {
            const response = await cache.match(key);
            const timestamp = parseInt(response?.headers.get('X-Cached-At') || '0');
            return { key, timestamp };
          })
        );

        entries.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 20%
        const toRemove = Math.ceil(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
          await cache.delete(entries[i].key);
        }

        console.log(`[VideoCache] Evicted ${toRemove} old entries`);
      }
    } catch (error) {
      console.error('[VideoCache] Failed to evict:', error);
    }
  }

  private getCacheKey(videoId: string): string {
    return `video-${videoId}`;
  }
}

// Singleton instance
export const videoCache = new VideoCache();
