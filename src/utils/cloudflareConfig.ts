// Cloudflare configuration for optimized asset delivery
export const CLOUDFLARE_CONFIG = {
  // Replace with your Cloudflare zone info
  zoneName: 'your-domain.com',
  
  // Image optimization settings
  imageOptimization: {
    defaultQuality: 85,
    defaultFormat: 'webp',
    fallbackFormat: 'jpeg',
    sizes: {
      thumbnail: { width: 400, height: 600 },
      card: { width: 800, height: 1200 },
      hero: { width: 1920, height: 1080 },
    },
  },
  
  // CDN settings
  cdn: {
    baseUrl: 'https://your-domain.com',
    cacheTTL: {
      images: 86400, // 24 hours
      videos: 604800, // 7 days
      static: 31536000, // 1 year
    },
  },
  
  // Performance optimizations
  performance: {
    // Enable Cloudflare features
    minify: true,
    compression: true,
    http2: true,
    earlyHints: true,
    
    // Cache strategies
    cacheEverything: true,
    browserCacheTTL: 86400,
    edgeCacheTTL: 604800,
  },
};

// Helper function to construct optimized URLs
export const getOptimizedAssetUrl = (path: string, type: 'image' | 'video' | 'static' = 'static'): string => {
  if (!path || path.startsWith('http')) return path;
  
  const baseUrl = CLOUDFLARE_CONFIG.cdn.baseUrl;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};