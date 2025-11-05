// Cloudflare Image Resizing utility
export const optimizeImage = (
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  } = {}
): string => {
  // If it's already a Cloudflare image, placeholder, or imported asset (starts with data: or blob:), return as is
  if (!url || url.includes('/placeholder.svg') || url.includes('cloudflare') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/assets/')) {
    return url;
  }

  const { 
    width = 800, 
    height = 600, 
    quality = 85, 
    format = 'webp',
    fit = 'cover'
  } = options;

  // Use Cloudflare Image Resizing (replace with your Cloudflare zone)
  // For now, return optimized parameters that can be implemented
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    q: quality.toString(),
    f: format,
    fit
  });

  // Return original URL with optimization hint for future Cloudflare implementation
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${params.toString()}`;
};

// Generate multiple image sizes for responsive images
export const generateSrcSet = (url: string, sizes: number[] = [320, 640, 960, 1280]): string => {
  return sizes
    .map(size => `${optimizeImage(url, { width: size })} ${size}w`)
    .join(', ');
};

// Preload critical images
export const preloadImage = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
};