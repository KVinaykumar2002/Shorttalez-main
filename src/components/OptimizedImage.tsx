import React, { useState, useEffect } from 'react';
import { optimizeImage } from '@/utils/imageOptimization';

// Import all thumbnail assets
import imNotVirginThumbnail from '@/assets/im-not-virgin-new-thumbnail.jpg';
import autoJohnyThumbnail from '@/assets/auto-johny-s2-thumbnail.png';
import dilPatangThumbnail from '@/assets/dil-patang-thumbnail.jpg';
import prostituteThumbnail from '@/assets/prostitute-premakatha-thumbnail.png';
import softwareThumbnail from '@/assets/software-sankranthi-kastalu-thumbnail.jpg';
import seethamahalakshmiThumbnail from '@/assets/itlu-seethaamahalakshmi-thumbnail.jpg';
import trioSeriesThumbnail from '@/assets/trio-series-thumbnail.jpg';

// Asset mapping for database paths
const assetMapping: Record<string, string> = {
  '/src/assets/im-not-virgin-new-thumbnail.jpg': imNotVirginThumbnail,
  '/src/assets/auto-johny-s2-thumbnail.png': autoJohnyThumbnail,
  '/src/assets/dil-patang-thumbnail.jpg': dilPatangThumbnail,
  '/src/assets/prostitute-premakatha-thumbnail.png': prostituteThumbnail,
  '/src/assets/software-sankranthi-kastalu-thumbnail.jpg': softwareThumbnail,
  '/src/assets/itlu-seethaamahalakshmi-thumbnail.jpg': seethamahalakshmiThumbnail,
  '/src/assets/trio-series-thumbnail.jpg': trioSeriesThumbnail,
};

// Series-specific thumbnail mapping for Auto Johny
const seriesThumbnailMapping: Record<string, string> = {
  'Auto Johny S1': autoJohnyThumbnail,
  'Auto Johny S2': autoJohnyThumbnail,
};

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  seriesTitle?: string; // For series-specific thumbnail mapping
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  quality = 85,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  seriesTitle,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Check for series-specific thumbnail first, then asset mapping
  let actualSrc = src;
  if (seriesTitle && seriesThumbnailMapping[seriesTitle]) {
    actualSrc = seriesThumbnailMapping[seriesTitle];
  } else {
    actualSrc = assetMapping[src] || src;
  }
  
  const webpSrc = optimizeImage(actualSrc, { width, height, quality, format: 'webp' });
  const jpegSrc = optimizeImage(actualSrc, { width, height, quality, format: 'jpeg' });
  const [currentSrc, setCurrentSrc] = useState<string>(webpSrc);

  // Reset when input src changes
  useEffect(() => {
    setImageError(false);
    setRetryCount(0);
    setCurrentSrc(webpSrc);
    // Do not reset isLoaded to avoid post-load fade-out
  }, [webpSrc]);

  const handleError = () => {
    if (retryCount < maxRetries) {
      const cacheBuster = `cb=${Date.now()}`;
      if (currentSrc === webpSrc) {
        setCurrentSrc(`${jpegSrc}${jpegSrc.includes('?') ? '&' : '?'}${cacheBuster}`);
      } else if (currentSrc.startsWith(jpegSrc)) {
        setCurrentSrc(`${actualSrc}${actualSrc.includes('?') ? '&' : '?'}${cacheBuster}`);
      } else {
        setCurrentSrc(`${actualSrc}${actualSrc.includes('?') ? '&' : '?'}${cacheBuster}-${retryCount + 1}`);
      }
      setRetryCount((c) => c + 1);
    } else {
      setImageError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };
  if (imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-xl">🎬</span>
          </div>
          <span className="text-muted-foreground text-xs">Thumbnail Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <picture>
      <source srcSet={webpSrc} sizes={sizes} type="image/webp" />
      <source srcSet={jpegSrc} sizes={sizes} type="image/jpeg" />
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        width={width}
        height={height}
        {...props}
      />
    </picture>
  );
};