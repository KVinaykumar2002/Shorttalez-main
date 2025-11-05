import React, { useState, useRef, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useIOSAudio } from '@/hooks/useIOSAudio';

interface FastVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onEnded?: () => void;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  episodeId?: string;
  controls?: boolean;
}

const FastVideoPlayer = memo<FastVideoPlayerProps>(({
  videoUrl,
  thumbnailUrl,
  onEnded,
  className = "",
  autoPlay = false,
  muted: initialMuted = false,
  controls = true
}) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(initialMuted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isIOS, enableAudioForVideo } = useIOSAudio();
  
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isVimeoUrl = (url: string): boolean => {
    return url.includes('vimeo.com');
  };

  const isDirectVideo = (url: string): boolean => {
    return url.match(/\.(mp4|webm|ogg|m3u8)$/i) !== null;
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    
    if (videoId) {
      // Use static parameters to prevent iframe reloading/flashing
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&controls=${controls ? 1 : 0}&playsinline=1&rel=0&modestbranding=1&fs=1&disablekb=0&enablejsapi=1`;
    }
    
    return url;
  };

  const getVimeoEmbedUrl = (url: string): string => {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=${playing ? 1 : 0}&muted=0&controls=${controls ? 1 : 0}&playsinline=1`;
    }
    return url;
  };

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    setError(false);
    setHasInteracted(true);
    
    try {
      if (playing) {
        video.pause();
        setPlaying(false);
      } else {
        setLoading(true);
        // Enable audio on iOS on user interaction
        if (isIOS && !muted) {
          enableAudioForVideo(video);
        }
        await video.play();
        setPlaying(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.warn('Playback error:', err);
      
      // For iOS, don't force mute - wait for user interaction
      if (err.name === 'NotAllowedError') {
        if (isIOS && !hasInteracted) {
          // On iOS, wait for user interaction
          setError(true);
          setLoading(false);
          return;
        }
        // For non-iOS, try muted fallback
        try {
          video.muted = true;
          setMuted(true);
          await video.play();
          setPlaying(true);
          setLoading(false);
        } catch {
          setError(true);
          setLoading(false);
        }
      } else {
        setError(true);
        setLoading(false);
      }
    }
  }, [playing, isIOS, muted, hasInteracted, enableAudioForVideo]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
      // Enable audio for iOS on unmute
      if (!newMuted && isIOS) {
        enableAudioForVideo(videoRef.current);
      }
    }
  }, [muted, isIOS, enableAudioForVideo]);

  const handleVideoEnd = useCallback(() => {
    setPlaying(false);
    onEnded?.();
  }, [onEnded]);

  // Handle different video types
  if (isYouTubeUrl(videoUrl)) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (isVimeoUrl(videoUrl)) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={getVimeoEmbedUrl(videoUrl)}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video file
  if (isDirectVideo(videoUrl)) {
    return (
      <div 
        className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer ${className}`}
        onClick={() => setShowControls(!showControls)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          onLoadStart={() => {
            console.log('[iOS Video] onLoadStart', { url: videoUrl });
            if (!isIOS) setLoading(true);
          }}
          onCanPlay={() => {
            console.log('[iOS Video] onCanPlay');
            setLoading(false);
          }}
          onLoadedData={(e) => {
            console.log('[iOS Video] onLoadedData', { readyState: (e.target as HTMLVideoElement)?.readyState });
          }}
          onPlay={() => console.log('[iOS Video] onPlay')}
          onError={(e: any) => {
            const v = videoRef.current;
            console.error('[iOS Video] onError', { error: e?.message, networkState: v?.networkState, readyState: v?.readyState, src: videoUrl });
            setError(true);
          }}
          onTouchStart={(e) => {
            // iOS requires user interaction for audio
            if (isIOS && !hasInteracted && videoRef.current) {
              setHasInteracted(true);
              enableAudioForVideo(videoRef.current);
            }
          }}
          preload={isIOS ? "auto" : "metadata"}
          playsInline
          webkit-playsinline="true"
          controls={true}
          disablePictureInPicture
          crossOrigin="anonymous"
          muted={muted}
        >
          {/\.m3u8($|\?)/i.test(videoUrl) ? (
            <source src={videoUrl} type="application/vnd.apple.mpegurl" />
          ) : (
            <source src={videoUrl} type="video/mp4" />
          )}
        </video>
        
        {/* Thumbnail overlay when not playing */}
        {!playing && thumbnailUrl && (
          <div className="absolute inset-0 bg-black">
            <OptimizedImage
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-background/90 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </div>
            </div>
          </div>
        )}
        
        {/* Controls */}
        {controls && showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  disabled={loading}
                  className="text-white hover:bg-white/20"
                >
                  {loading && !isIOS ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : playing ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="text-white hover:bg-white/20"
                >
                  {muted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Video failed to load</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: treat as iframe-compatible URL
  return (
    <div className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={videoUrl}
        className="w-full h-full"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
});

FastVideoPlayer.displayName = 'FastVideoPlayer';

export default FastVideoPlayer;