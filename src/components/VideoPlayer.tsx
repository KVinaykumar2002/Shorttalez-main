import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';
import { useViewTracking } from '@/hooks/useViewTracking';
import { sanitizeVideoUrl } from '@/utils/securityUtils';
import { useIOSAudio } from '@/hooks/useIOSAudio';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onEnded?: () => void;
  className?: string;
  style?: React.CSSProperties;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  isMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
  autoPlay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  episodeId?: string; // Add episodeId for view tracking
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  onEnded,
  className = "",
  style,
  isPlaying = false,
  onPlayStateChange,
  isMuted = false,
  onMuteChange,
  autoPlay = false,
  preload = 'metadata',
  episodeId // Add episodeId prop
}) => {
  // Sanitize video URL for security
  const sanitizedVideoUrl = sanitizeVideoUrl(videoUrl);
  
  if (!sanitizedVideoUrl) {
    console.warn('Invalid or unsafe video URL:', videoUrl);
    return (
      <div className="flex items-center justify-center w-full h-full bg-muted text-foreground">
        <p>Invalid video URL</p>
      </div>
    );
  }
  const [internalPlaying, setInternalPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // Track user interaction
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const playerIdRef = useRef<string>(`player-${Date.now()}-${Math.random()}`);

  const { isIOS, audioEnabled, enableAudioForVideo, unmuteYouTubePlayer } = useIOSAudio();
  const [internalMuted, setInternalMuted] = useState<boolean>(false); // Start unmuted - audio enabled on first interaction

  const playing = isPlaying !== undefined ? isPlaying : internalPlaying;
  const muted = isMuted !== undefined ? isMuted : internalMuted;

  // Initialize view tracking
  const { startViewTracking, stopViewTracking, resetViewTracking } = useViewTracking({
    episodeId,
    onViewCounted: () => console.log('View counted for episode:', episodeId)
  });

  // Load YouTube API
  useEffect(() => {
    if (isYouTubeUrl(sanitizedVideoUrl) && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => console.warn('Failed to load YouTube API');
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(tag, firstScript);
    }
  }, [sanitizedVideoUrl]);

  // Initialize YouTube player when API is ready
  const initYouTubePlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player || youtubePlayerRef.current) return;

    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) return;

    youtubePlayerRef.current = new window.YT.Player(playerIdRef.current, {
      videoId,
            playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 1, // Show controls for iOS compatibility
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            mute: 0, // Start unmuted - will work after user interaction
            quality: 'hd1080',
            hd: 1,
          },
      events: {
        onReady: (event: any) => {
          console.log('YouTube player ready');
          // Unmute if not manually muted
          try {
            if (!muted) {
              event.target.unMute?.();
              event.target.setVolume?.(100);
            }
          } catch (err) {
            console.warn('Error setting YouTube audio:', err);
          }
          // Auto-play when ready if playing prop is true
          if (playing) {
            try { 
              // On iOS, ensure audio is enabled
              if (isIOS && hasInteracted) {
                unmuteYouTubePlayer(event.target);
              }
              event.target.playVideo(); 
            } catch {}
          }
        },
        onStateChange: (event: any) => {
          const playerState = event.data;
          if (playerState === window.YT.PlayerState.PLAYING) {
            setInternalPlaying(true);
            onPlayStateChange?.(true);
            startViewTracking(); // Start tracking when video starts playing
          } else if (playerState === window.YT.PlayerState.PAUSED || playerState === window.YT.PlayerState.ENDED) {
            setInternalPlaying(false);
            onPlayStateChange?.(false);
            stopViewTracking(); // Stop tracking when video pauses or ends
          }
        },
      },
    });
  }, [videoUrl, muted, onPlayStateChange]);

  // Control YouTube player based on isPlaying prop
  useEffect(() => {
    if (youtubePlayerRef.current && isYouTubeUrl(videoUrl)) {
      try {
        if (muted) {
          youtubePlayerRef.current.mute?.();
        } else {
          youtubePlayerRef.current.unMute?.();
        }
        if (playing) {
          youtubePlayerRef.current.playVideo();
        } else {
          youtubePlayerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error('Error controlling YouTube player:', error);
      }
    }
  }, [playing, muted, videoUrl]);

  // Initialize player when YouTube API is ready
  useEffect(() => {
    if (isYouTubeUrl(videoUrl)) {
      if (window.YT && window.YT.Player) {
        initYouTubePlayer();
      } else {
        window.onYouTubeIframeAPIReady = initYouTubePlayer;
      }
    }

    return () => {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
        youtubePlayerRef.current = null;
      }
      stopViewTracking(); // Clean up view tracking
    };
  }, [initYouTubePlayer, videoUrl]);

  // Handle controls visibility
  const showControlsTemporarily = () => {
    if (!playing) return; // Don't hide controls when paused
    
    setShowControls(true);
    
    // Clear existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    // Hide controls after 3 seconds
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleVideoClick = () => {
    if (playing) {
      showControlsTemporarily();
    } else {
      togglePlayPause();
    }
  };

  // Auto-hide controls after video starts playing
  useEffect(() => {
    if (playing) {
      // Hide controls after 3 seconds when video starts
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      // Show controls when paused
      setShowControls(true);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    }
  }, [playing]);

  // Clean up on unmount: timers and force-stop any playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        try {
          setInternalPlaying(false);
          onPlayStateChange?.(false);
        } catch {}
        if (videoRef.current) {
          try { videoRef.current.pause(); } catch {}
        }
        if (youtubePlayerRef.current) {
          try { youtubePlayerRef.current.pauseVideo?.(); } catch {}
        }
        if (iframeRef.current) {
          try {
            const win = iframeRef.current.contentWindow;
            const src = iframeRef.current.src || '';
            if (src.includes('vimeo.com')) {
              win?.postMessage({ method: 'pause' }, '*');
            } else if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('youtube-nocookie.com')) {
              win?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
            }
          } catch {}
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      try {
        setInternalPlaying(false);
        onPlayStateChange?.(false);
      } catch {}
      stopViewTracking();
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch {}
      }
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.pauseVideo?.();
          youtubePlayerRef.current.destroy?.();
        } catch {}
        youtubePlayerRef.current = null;
      }
      if (iframeRef.current) {
        try {
          const win = iframeRef.current.contentWindow;
          const src = iframeRef.current.src || '';
          if (src.includes('vimeo.com')) {
            win?.postMessage({ method: 'pause' }, '*');
          } else if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('youtube-nocookie.com')) {
            win?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
          }
        } catch {}
        try {
          iframeRef.current.src = 'about:blank';
        } catch {}
      }
    };
  }, [onPlayStateChange, stopViewTracking]);

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      return url; // Already in embed format
    }
    
    if (videoId) {
      const controlsParam = showControls ? 1 : 0;
      const autoplayParam = playing ? 1 : 0;
      return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=${controlsParam}&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&color=white&theme=dark&autoplay=${autoplayParam}&mute=0&playsinline=1&enablejsapi=1`;
    }
    
    return url;
  };

  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string): string => {
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    }
    
    return videoId;
  };

  // Convert Vimeo URL to embed format
  const getVimeoEmbedUrl = (url: string): string => {
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      if (videoId) {
        const autoplayParam = playing ? 1 : 0;
        return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplayParam}&muted=0&quality=auto&controls=1&playsinline=1&dnt=1`;
      }
    }
    return url;
  };

  // Convert Google Drive URL to embed format
  const getGoogleDriveEmbedUrl = (url: string): string => {
    let fileId = '';
    
    // Extract file ID from various Google Drive URL formats
    if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1]?.split('/')[0] || '';
    } else if (url.includes('id=')) {
      fileId = url.split('id=')[1]?.split('&')[0] || '';
    } else if (url.includes('/open?id=')) {
      fileId = url.split('/open?id=')[1]?.split('&')[0] || '';
    }
    
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    return url;
  };

  // Check if URL is a YouTube video
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if URL is a Vimeo video (but not a folder)
  const isVimeoUrl = (url: string): boolean => {
    return url.includes('vimeo.com') && !url.includes('/folder/') && !url.includes('/user/');
  };

  // Check if URL is a Vimeo folder (invalid for video playback)
  const isVimeoFolderUrl = (url: string): boolean => {
    return url.includes('vimeo.com') && (url.includes('/folder/') || url.includes('/user/'));
  };

  // Check if URL is a Google Drive video
  const isGoogleDriveUrl = (url: string): boolean => {
    return url.includes('drive.google.com');
  };

  // Check if URL is a Cloudflare Stream video
  const isCloudflareStreamUrl = (url: string): boolean => {
    return url.includes('iframe.videodelivery.net') || url.includes('videodelivery.net');
  };

  // Check if URL is a pCloud link
  const isPCloudUrl = (url: string): boolean => {
    return url.includes('pcloud.link') || url.includes('u.pcloud.link');
  };

  // Build proxy URL for pCloud to stream via our Edge Function (no iframe UI)
  const getPCloudProxyUrl = (url: string): string => {
    const codeMatch = url.match(/code=([^&]+)/);
    if (codeMatch) {
      const code = codeMatch[1];
      return `https://nxsogkmnimaihoxbpnpd.functions.supabase.co/proxy-pcloud?code=${encodeURIComponent(code)}`;
    }
    return url;
  };

  // Check if URL is a direct video file
  const isDirectVideoUrl = (url: string): boolean => {
    return url.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i) !== null ||
           url.includes('.supabase.co/storage/'); // Supabase storage URLs
  };

  const togglePlayPause = async () => {
    const newPlaying = !playing;
    
    try {
      setInternalPlaying(newPlaying);
      onPlayStateChange?.(newPlaying);
      setHasError(false);

      // Handle view tracking
      if (newPlaying) {
        startViewTracking();
        setHasInteracted(true); // Mark user interaction
        
        // Enable audio on iOS on first interaction
        if (isIOS && !hasInteracted) {
          if (videoRef.current) {
            enableAudioForVideo(videoRef.current);
          }
          if (youtubePlayerRef.current) {
            unmuteYouTubePlayer(youtubePlayerRef.current);
          }
        }
      } else {
        stopViewTracking();
      }

      // Handle iframe-based players
      if (iframeRef.current) {
        const src = iframeRef.current.src || '';
        // Cloudflare Stream: toggle autoplay via URL params
        if (isCloudflareStreamUrl(videoUrl)) {
          try {
            const url = new URL(src || videoUrl);
            if (newPlaying) {
              url.searchParams.set('autoplay', '1');
              url.searchParams.set('muted', '1'); // ensure autoplay works on mobile
              url.searchParams.set('playsinline', '1');
            } else {
              url.searchParams.delete('autoplay');
            }
            if (iframeRef.current.src !== url.toString()) {
              iframeRef.current.src = url.toString();
            }
          } catch {}
        }
      }

      if (videoRef.current) {
        if (newPlaying) {
          setIsLoading(true);
          
          // Ensure audio is enabled on iOS on user interaction
          if (isIOS && hasInteracted) {
            videoRef.current.muted = muted;
            videoRef.current.volume = muted ? 0 : 1;
            // Enable audio session
            enableAudioForVideo(videoRef.current);
          }
          
          try {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
            setIsLoading(false);
          } catch (err: any) {
            // Autoplay policy: for iOS, user must interact first
            if (err?.name === 'NotAllowedError' || /NotAllowed/i.test(err?.message || '')) {
              if (isIOS && !hasInteracted) {
                // On iOS, wait for user interaction - don't force mute
                setInternalPlaying(false);
                onPlayStateChange?.(false);
                setIsLoading(false);
                setHasError(false);
                return;
              }
              // For non-iOS, try muted fallback
              try {
                videoRef.current.muted = true;
                setInternalMuted(true);
                const retry = videoRef.current.play();
                if (retry !== undefined) {
                  await retry;
                }
                setIsLoading(false);
                setHasError(false);
                return;
              } catch {}
            }
            throw err;
          }
        } else {
          videoRef.current.pause();
        }
      }
    } catch (error) {
      console.error('Error playing video:', error);
      setHasError(true);
      setIsLoading(false);
      setInternalPlaying(false);
      onPlayStateChange?.(false);
      stopViewTracking();
    }
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setInternalMuted(newMuted);
    onMuteChange?.(newMuted);

    // YouTube player
    if (youtubePlayerRef.current) {
      try {
        if (newMuted) {
          youtubePlayerRef.current.mute?.();
        } else {
          // Enable audio for iOS on unmute
          if (isIOS) {
            unmuteYouTubePlayer(youtubePlayerRef.current);
          } else {
            youtubePlayerRef.current.unMute?.();
          }
        }
      } catch {}
    }

    // HTML5 video
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      // Enable audio for iOS on unmute
      if (!newMuted && isIOS) {
        enableAudioForVideo(videoRef.current);
      }
    }
  };

  // Update video controls when external state changes
  useEffect(() => {
    // Native <video>
    if (videoRef.current) {
      const video = videoRef.current;
      if (playing) {
        setIsLoading(true);
        startViewTracking(); // Start tracking when playing
        // Enable audio on iOS if user has interacted
        if (isIOS && hasInteracted) {
          enableAudioForVideo(video);
        }
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsLoading(false);
          }).catch(async (error) => {
            console.error('Error playing video:', error);
            // For iOS, don't force mute - wait for user interaction
            if (error?.name === 'NotAllowedError' || /NotAllowed/i.test(error?.message || '')) {
              if (isIOS && !hasInteracted) {
                // On iOS, wait for user interaction
                setInternalPlaying(false);
                onPlayStateChange?.(false);
                setIsLoading(false);
                setHasError(false);
                stopViewTracking();
                return;
              }
              // For non-iOS, try muted fallback
              try {
                video.muted = true;
                setInternalMuted(true);
                const retry = video.play();
                if (retry !== undefined) await retry;
                setIsLoading(false);
                setHasError(false);
                return;
              } catch (e) {
                console.error('Retry after mute failed:', e);
              }
            }
            setHasError(true);
            setIsLoading(false);
            stopViewTracking();
          });
        }
      } else {
        video.pause();
        setIsLoading(false);
        stopViewTracking(); // Stop tracking when paused
      }
    }

    // YouTube API player
    if (!playing && youtubePlayerRef.current) {
      try { youtubePlayerRef.current.pauseVideo?.(); } catch {}
    }

    // Iframe-based players (Vimeo, YouTube embed, Google Drive)
    if (!playing && iframeRef.current) {
      try {
        const win = iframeRef.current.contentWindow;
        const src = iframeRef.current.src || '';
        if (src.includes('vimeo.com')) {
          win?.postMessage({ method: 'pause' }, '*');
        } else if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('youtube-nocookie.com')) {
          win?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
        }
      } catch {}
    }
  }, [playing, startViewTracking, stopViewTracking]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Enhanced video event handlers
  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = (error: any) => {
    console.warn('Video error:', error);
    setHasError(true);
    setIsLoading(false);
    setIsBuffering(false);
    stopViewTracking();
  };

  const handleVideoWaiting = () => {
    setIsBuffering(true);
  };

  const handleVideoCanPlay = () => {
    setIsBuffering(false);
    setIsLoading(false);
  };

  const handleVideoPlay = () => {
    startViewTracking();
  };

  const handleVideoPause = () => {
    stopViewTracking();
  };

  // Cloudflare Stream player
  if (isCloudflareStreamUrl(videoUrl)) {
    return (
      <div className={`relative w-full h-full ${className}`} style={style} onClick={handleVideoClick}>
        {/* Thumbnail overlay for Cloudflare Stream */}
        {thumbnailUrl && !playing && (
          <div className="absolute inset-0 z-10">
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                console.error('Cloudflare thumbnail failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Cloudflare Stream Player"
        />
        
        {/* Custom controls overlay for Cloudflare Stream */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <Button
              size="lg"
              onClick={togglePlayPause}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background/20 hover:bg-background/30 backdrop-blur-sm pointer-events-auto touch-manipulation"
            >
              <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Handle Vimeo folder URLs (show error)
  if (isVimeoFolderUrl(videoUrl)) {
    return (
      <div className={`relative ${className} bg-gray-900 flex items-center justify-center`} style={style}>
        <div className="text-center text-white p-8">
          <div className="mb-4">
            <Play className="w-16 h-16 mx-auto text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Video Not Available</h3>
          <p className="text-gray-400 text-sm mb-4">
            This episode uses a Vimeo folder URL instead of an individual video URL.
          </p>
          <p className="text-gray-500 text-xs">
            Please update the video URL to a specific Vimeo video link.
          </p>
        </div>
      </div>
    );
  }

  // YouTube/Vimeo/Google Drive embedded player
  if (isYouTubeUrl(videoUrl) || isVimeoUrl(videoUrl) || isGoogleDriveUrl(videoUrl)) {
    let embedUrl = '';
    
    if (isYouTubeUrl(videoUrl)) {
      // For YouTube, use a div that will be replaced by the YouTube API
      return (
        <div className={`relative w-full h-full ${className}`} style={style} onClick={handleVideoClick}>
          <div
            id={playerIdRef.current}
            className="w-full h-full"
          />
          
          {/* Custom controls overlay for YouTube videos */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <Button
                size="lg"
                onClick={() => {
                  setInternalPlaying(true);
                  onPlayStateChange?.(true);
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background/20 hover:bg-background/30 backdrop-blur-sm pointer-events-auto touch-manipulation"
              >
                <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
              </Button>
            </div>
          )}
        </div>
      );
    } else if (isVimeoUrl(videoUrl)) {
      embedUrl = getVimeoEmbedUrl(videoUrl);
    } else if (isGoogleDriveUrl(videoUrl)) {
      embedUrl = getGoogleDriveEmbedUrl(videoUrl);
    }

    // For Vimeo and Google Drive, use iframe
    if (embedUrl) {
      return (
        <div className={`relative w-full h-full ${className}`} style={style} onClick={handleVideoClick}>
          {/* Thumbnail overlay for embedded videos */}
          {thumbnailUrl && !playing && (
            <div className="absolute inset-0 z-10">
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  console.error('Embedded video thumbnail failed to load:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="Video Player"
          />
          
          {/* Custom controls overlay for embedded videos */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <Button
              size="lg"
              onClick={togglePlayPause}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background/20 hover:bg-background/30 backdrop-blur-sm pointer-events-auto touch-manipulation"
            >
              <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
            </Button>
            </div>
          )}
        </div>
      );
    }
  }

  // pCloud video player - stream via our proxy with native <video>
  if (isPCloudUrl(videoUrl)) {
    const proxiedUrl = getPCloudProxyUrl(videoUrl);

    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-black"
          src={proxiedUrl}
          poster={thumbnailUrl || undefined}
          muted={muted}
          autoPlay={autoPlay}
          controls={true}
          onEnded={onEnded}
          onClick={handleVideoClick}
          onTouchStart={(e) => {
            // iOS requires user interaction for audio
            if (isIOS && !hasInteracted && videoRef.current) {
              setHasInteracted(true);
              enableAudioForVideo(videoRef.current);
            }
          }}
          preload={preload}
          playsInline
          webkit-playsinline="true"
          disablePictureInPicture
          crossOrigin="anonymous"
          onPlay={() => {
            setInternalPlaying(true);
            onPlayStateChange?.(true);
            setIsLoading(false);
          }}
          onPause={() => {
            setInternalPlaying(false);
            onPlayStateChange?.(false);
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoCanPlay}
          onWaiting={handleVideoWaiting}
          onError={handleVideoError}
          onProgress={() => setIsBuffering(false)}
        />

        {/* Fallback thumbnail */}
        {thumbnailUrl && !playing && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                console.error('pCloud thumbnail failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

         {/* Enhanced play button overlay with loading states */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <Button
              size="lg"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 touch-manipulation"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 sm:w-10 sm:h-10 text-white animate-spin" />
              ) : hasError ? (
                <AlertCircle className="w-6 h-6 sm:w-10 sm:h-10 text-red-400" />
              ) : (
                <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
              )}
            </Button>
          </div>
        )}

        {/* Buffering indicator */}
        {playing && isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20">
            <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
            <div className="text-center text-white p-6">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <p className="text-sm text-gray-300">Failed to load video</p>
              <Button
                onClick={() => {
                  setHasError(false);
                  togglePlayPause();
                }}
                className="mt-3 bg-white/20 hover:bg-white/30"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Direct video player for uploaded files
  if (isDirectVideoUrl(videoUrl)) {
    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-black"
          src={videoUrl}
          poster={thumbnailUrl || undefined}
          muted={muted}
          autoPlay={autoPlay}
          controls={true}
          onEnded={onEnded}
          onClick={handleVideoClick}
          onTouchStart={(e) => {
            // iOS requires user interaction for audio
            if (isIOS && !hasInteracted && videoRef.current) {
              setHasInteracted(true);
              enableAudioForVideo(videoRef.current);
            }
          }}
          preload={preload}
          playsInline
          webkit-playsinline="true"
          disablePictureInPicture
          crossOrigin="anonymous"
          onPlay={() => {
            setInternalPlaying(true);
            onPlayStateChange?.(true);
            setIsLoading(false);
          }}
          onPause={() => {
            setInternalPlaying(false);
            onPlayStateChange?.(false);
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoCanPlay}
          onWaiting={handleVideoWaiting}
          onError={handleVideoError}
          onProgress={() => setIsBuffering(false)}
        />

        {/* Fallback thumbnail */}
        {thumbnailUrl && !playing && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                console.error('Thumbnail failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Enhanced play button overlay with loading states */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
             <Button
              size="lg"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 touch-manipulation"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 sm:w-10 sm:h-10 text-white animate-spin" />
              ) : hasError ? (
                <AlertCircle className="w-6 h-6 sm:w-10 sm:h-10 text-red-400" />
              ) : (
                <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
              )}
            </Button>
          </div>
        )}

        {/* Buffering indicator */}
        {playing && isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20">
            <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
            <div className="text-center text-white p-6">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <p className="text-sm text-gray-300">Failed to load video</p>
              <Button
                onClick={() => {
                  setHasError(false);
                  togglePlayPause();
                }}
                className="mt-3 bg-white/20 hover:bg-white/30"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: try to render as iframe for other URLs
  return (
    <div className={`relative w-full h-full ${className}`} style={style} onClick={handleVideoClick}>
      {/* Thumbnail overlay for fallback iframe */}
      {thumbnailUrl && !playing && (
        <div className="absolute inset-0 z-10">
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              console.error('Fallback thumbnail failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="Video Player"
      />
      
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Button
            size="lg"
            onClick={togglePlayPause}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background/20 hover:bg-background/30 backdrop-blur-sm pointer-events-auto touch-manipulation"
          >
            <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;