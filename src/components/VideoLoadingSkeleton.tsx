import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoLoadingSkeletonProps {
  thumbnailUrl?: string;
  blur?: boolean;
  showSpinner?: boolean;
}

/**
 * Progressive loading placeholder for videos
 * Shows blurred thumbnail while video loads for perceived instant playback
 */
export const VideoLoadingSkeleton: React.FC<VideoLoadingSkeletonProps> = ({ 
  thumbnailUrl, 
  blur = true,
  showSpinner = true 
}) => {
  return (
    <div className="absolute inset-0 bg-black">
      {/* Blurred thumbnail for instant visual feedback */}
      {thumbnailUrl && (
        <img 
          src={thumbnailUrl} 
          alt="Loading preview"
          className={`w-full h-full object-cover transition-all duration-300 ${
            blur ? 'blur-md scale-110' : ''
          }`}
          loading="eager"
        />
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      
      {/* Loading indicator */}
      {showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white text-sm font-medium drop-shadow-lg">
              Loading...
            </p>
          </div>
        </div>
      )}
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite'
        }}
      />
    </div>
  );
};
