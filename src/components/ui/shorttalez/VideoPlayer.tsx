import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { VideoItem } from "./types";
import ActionColumn from "./ActionColumn";
import CaptionBar from "./CaptionBar";
import TopProgress from "./TopProgress";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { useVideoAnalytics } from "@/hooks/useVideoAnalytics";
import { videoCache } from "@/utils/videoCache";
import { ImpactStyle } from "@capacitor/haptics";
import { useIOSAudio } from "@/hooks/useIOSAudio";

interface VideoPlayerProps {
  video: VideoItem;
  onToggleLike: (id: string) => void;
  onOpenComments: (id: string) => void;
  onShare?: (id: string) => void;
  onFollow?: (id: string) => void;
}

export default function VideoPlayer({
  video,
  onToggleLike,
  onOpenComments,
  onShare,
  onFollow,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused - user must interact to play
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay policy compliance
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [videoSrc, setVideoSrc] = useState(video.url);
  const [isFromCache, setIsFromCache] = useState(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isMobile, triggerHaptic } = useMobileOptimization();
  const { isIOS, enableAudioForVideo } = useIOSAudio();
  
  // Analytics tracking
  useVideoAnalytics(video.id, videoRef);

  // Try to load from cache first, then fallback to network
  useEffect(() => {
    const loadVideo = async () => {
      const cached = await videoCache.get(video.id);
      if (cached) {
        const cachedUrl = URL.createObjectURL(cached);
        setVideoSrc(cachedUrl);
        setIsFromCache(true);
        console.log(`[VideoPlayer] ✅ Cache HIT: ${video.id}`);
      } else {
        setVideoSrc(video.url);
        setIsFromCache(false);
        console.log(`[VideoPlayer] 🌐 Cache MISS - loading from network: ${video.id}`);
      }
    };
    
    loadVideo();
    
    // Cleanup blob URL on unmount
    return () => {
      if (videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [video.id, video.url]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    
    // Reset interaction state when video changes
    setHasUserInteracted(false);
    
    // Set initial audio state
    // Start muted until user interaction (iOS and Android autoplay policy)
    // Use setIsMuted to update state, which will update the muted prop
    setIsMuted(true);
    v.volume = 1.0;
    
    // Log audio capabilities for debugging
    console.log('[Video Player] Initializing', {
      videoId: video.id,
      muted: isMuted,
      volume: v.volume,
      paused: v.paused,
      readyState: v.readyState,
      src: v.src ? v.src.substring(0, 50) : 'undefined',
      hasUserInteracted,
      isIOS
    });
    
    // Always call load() - iOS won't block it if we're not auto-playing
    // The key is that we don't call play() until user interaction
    try { 
      v.preload = 'auto';
      v.load();
    } catch (err) {
      console.warn('[Video Player] Error calling load():', err);
    }

    // Don't autoplay - wait for user interaction (iOS and Android autoplay policies)
    // This ensures videos play correctly on all devices
    setIsPlaying(false);

    // Hide overlay after 3 seconds
    const hideTimer = setTimeout(() => setShowOverlay(false), 3000);
    
    return () => clearTimeout(hideTimer);
  }, [video.id, isIOS]);

  // Sync muted state with video element (important for iOS timing)
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = isMuted;
      v.volume = 1.0;
    }
  }, [isMuted]);

  // Update progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const updateProgress = () => {
      if (v.duration) {
        setProgress((v.currentTime / v.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    v.addEventListener('timeupdate', updateProgress);
    v.addEventListener('ended', handleEnded);

    return () => {
      v.removeEventListener('timeupdate', updateProgress);
      v.removeEventListener('ended', handleEnded);
    };
  }, [video.id]);

  const handleVideoClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Haptic feedback for touch
    if (isMobile) {
      await triggerHaptic(ImpactStyle.Light);
    }
    
    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }

    // Check for double tap
    const now = Date.now();
    const lastTap = (e.target as any).lastTap || 0;
    
    if (now - lastTap < 300) {
      // Double tap - trigger like with haptic
      if (isMobile) {
        await triggerHaptic(ImpactStyle.Medium);
      }
      handleDoubleTap();
      (e.target as any).lastTap = 0;
    } else {
      // Single tap - set timeout to toggle overlay
      (e.target as any).lastTap = now;
      tapTimeoutRef.current = setTimeout(() => {
        setShowOverlay(prev => !prev);
      }, 300);
    }
  }, [isMobile, triggerHaptic]);

  const handleDoubleTap = useCallback(() => {
    onToggleLike(video.id);
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  }, [video.id, onToggleLike]);

  const togglePlayPause = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;

    if (isMobile) {
      await triggerHaptic(ImpactStyle.Light);
    }

    // On first interaction, enable audio (iOS and Android)
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      
      // Force unmute on first user interaction (all platforms)
      // Use setIsMuted to update state, which will update the muted prop
      setIsMuted(false);
      v.volume = 1;
      
      // Enable audio on iOS
      if (isIOS) {
        enableAudioForVideo(v);
      }
      
      console.log('[Video Player] Audio enabled on first user interaction', { isIOS });
    } else {
      // Ensure audio stays enabled on all platforms
      setIsMuted(false);
      v.volume = 1;
      if (isIOS) {
        enableAudioForVideo(v);
      }
    }

    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      try {
        // Wait for video to be ready if needed
        if (v.readyState < 3) {
          // Wait for canplay event or timeout
          await new Promise<void>((resolve) => {
            if (v.readyState >= 3) {
              resolve();
              return;
            }
            const onCanPlay = () => {
              v.removeEventListener('canplay', onCanPlay);
              resolve();
            };
            v.addEventListener('canplay', onCanPlay);
            setTimeout(() => {
              v.removeEventListener('canplay', onCanPlay);
              resolve();
            }, 2000);
          });
        }
        
        await v.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.warn('[Video Player] Play error:', err);
        setIsPlaying(false);
      }
    }
  }, [isPlaying, isMobile, triggerHaptic, hasUserInteracted, isIOS, enableAudioForVideo]);

  const toggleMute = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;

    if (isMobile) {
      await triggerHaptic(ImpactStyle.Light);
    }

    // Toggle mute state - use setIsMuted to update state, which will update the muted prop
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    // If unmuting on iOS, ensure audio is enabled
    if (!newMuted && isIOS) {
      enableAudioForVideo(v);
    }
  }, [isMobile, triggerHaptic, isMuted, isIOS, enableAudioForVideo]);

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      <TopProgress progress={progress} />
      
      {/* Ambient background glow */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(255,20,147,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(0,255,255,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(138,43,226,0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <video
        ref={videoRef}
        src={videoSrc}
        poster={video.poster}
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        preload="auto"
        controls={true}
        disablePictureInPicture
        crossOrigin="anonymous"
        muted={isMuted}
        className="w-full h-full object-cover cursor-pointer"
        loop={false}
        onClick={handleVideoClick}
        onLoadedMetadata={() => {
          const v = videoRef.current;
          console.log('[Video Player] onLoadedMetadata', { 
            videoId: video.id,
            readyState: v?.readyState,
            networkState: v?.networkState,
            hasUserInteracted,
            isIOS
          });
        }}
        onLoadedData={() => {
          const v = videoRef.current;
          console.log('[Video Player] onLoadedData', { 
            videoId: video.id,
            readyState: v?.readyState,
            networkState: v?.networkState,
            hasUserInteracted,
            isIOS
          });
        }}
        onCanPlay={() => {
          const v = videoRef.current;
          console.log('[Video Player] onCanPlay', { 
            videoId: video.id,
            readyState: v?.readyState,
            networkState: v?.networkState,
            isIOS
          });
        }}
        onError={(e: any) => {
          const v = videoRef.current;
          console.error('[Video Player] onError', { 
            videoId: video.id,
            error: e?.message, 
            code: v?.error?.code,
            networkState: v?.networkState, 
            readyState: v?.readyState,
            src: videoSrc,
            isIOS
          });
        }}
        onPlay={() => {
          setIsPlaying(true);
          // Ensure audio is enabled when video plays
          const v = videoRef.current;
          if (v && hasUserInteracted) {
            // Unmute on all platforms after user interaction
            // Use setIsMuted to update state, which will update the muted prop
            setIsMuted(false);
            v.volume = 1;
            // Enable audio on iOS
            if (isIOS) {
              enableAudioForVideo(v);
            }
          }
        }}
        onTouchStart={(e) => {
          // iOS and Android require user interaction for audio
          if (!hasUserInteracted && videoRef.current) {
            const v = videoRef.current;
            try {
              // Mark user interaction
              setHasUserInteracted(true);
              
              // Force unmute on touch (iOS and Android)
              // Use setIsMuted to update state, which will update the muted prop
              setIsMuted(false);
              v.volume = 1;
              
              // Enable audio on iOS
              if (isIOS) {
                enableAudioForVideo(v);
              }
              
              console.log('[Video Player] Audio enabled on touchstart', { isIOS });
            } catch (err) {
              console.warn('[Video Player] Error on touchstart:', err);
            }
          }
        }}
        onPause={() => setIsPlaying(false)}
      >
        {/* Explicit source tags for better MIME type handling */}
        {/\.m3u8($|\?)/i.test(videoSrc) ? (
          <source src={videoSrc} type="application/vnd.apple.mpegurl" />
        ) : (
          <source src={videoSrc} type="video/mp4" />
        )}
      </video>

      {/* Cache Status Badge */}
      {isFromCache && (
        <div className="absolute top-20 left-4 z-40 backdrop-blur-sm bg-green-500/20 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          ⚡ Cached
        </div>
      )}

      {/* Enhanced Like Animation Overlay */}
      <AnimatePresence>
        {showLikeAnimation && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Floating hearts */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute text-4xl"
                style={{
                  left: `${45 + Math.random() * 10}%`,
                  top: `${45 + Math.random() * 10}%`,
                }}
                initial={{
                  scale: 0,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{
                  scale: [0, 1.2, 0.8, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 1, 0],
                  y: [-50, -100, -150],
                  x: [(Math.random() - 0.5) * 100]
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                ❤️
              </motion.div>
            ))}
            
            {/* Sparkle effects */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
                initial={{
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  x: [(Math.random() - 0.5) * 200],
                  y: [(Math.random() - 0.5) * 200]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.06,
                  ease: "easeOut"
                }}
              />
            ))}
            
            {/* Central heart explosion */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 2, 1.5, 0] }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="text-8xl bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent animate-neon-pulse">
                💖
              </div>
            </motion.div>
            
            {/* Ripple effect */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-pink-500/50"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 3, 5], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Control Overlays */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Center Play/Pause Button with Modern Design */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.button
                className="relative w-20 h-20 glass-dark rounded-full flex items-center justify-center text-white pointer-events-auto border border-white/20 shadow-2xl touch-manipulation"
                onClick={togglePlayPause}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255,255,255,0.1)",
                    "0 0 30px rgba(255,255,255,0.2)",
                    "0 0 20px rgba(255,255,255,0.1)"
                  ]
                }}
                transition={{ 
                  scale: { duration: 0.15 },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                
                {/* Animated ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-pink-500 to-cyan-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
            </div>

            {/* Modern Volume Control */}
            <motion.div 
              className="absolute top-6 right-6 z-25"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                className="relative w-12 h-12 glass-dark rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg touch-manipulation"
                onClick={toggleMute}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={!isMuted ? {
                  boxShadow: [
                    "0 0 15px rgba(0,255,255,0.3)",
                    "0 0 25px rgba(0,255,255,0.5)",
                    "0 0 15px rgba(0,255,255,0.3)"
                  ]
                } : {}}
                transition={{ 
                  scale: { duration: 0.15 },
                  boxShadow: { duration: 1.5, repeat: Infinity }
                }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                
                {/* Sound waves animation when not muted */}
                {!isMuted && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ActionColumn
        video={video}
        onToggleLike={() => onToggleLike(video.id)}
        onOpenComments={() => onOpenComments(video.id)}
        onShare={() => onShare?.(video.id)}
        onFollow={() => onFollow?.(video.id)}
      />
      
      <CaptionBar 
        video={video} 
        show={showOverlay} 
      />
    </div>
  );
}