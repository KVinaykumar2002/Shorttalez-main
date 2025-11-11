/*  OptimizedVideoPlayer.tsx  */
import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Loader2, AlertCircle, Maximize, ArrowLeft } from "lucide-react";
import { useViewTracking } from "@/hooks/useViewTracking";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import { sanitizeVideoUrl } from "@/utils/securityUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useIOSAudio } from "@/hooks/useIOSAudio";
import { useVideoPreloader } from "@/hooks/useVideoPreloader";
import { useInstantVideoLoad } from "@/hooks/useInstantVideoLoad";
import { VideoLoadingSkeleton } from "@/components/VideoLoadingSkeleton";

/* -------------------------------------------------------------------------- */
/*  YouTube Iframe API – global declaration                                   */
/* -------------------------------------------------------------------------- */
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */
/* Force TypeScript to re-evaluate props interface */
export interface OptimizedVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onEnded?: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** Controlled play state – if omitted the component is uncontrolled */
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  isMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
  autoPlay?: boolean;
  preload?: "none" | "metadata" | "auto";
  episodeId?: string;
  controls?: boolean;
  showBackButton?: boolean;
  /** Progress callback – receives seconds */
  onProgressUpdate?: (current: number, duration: number) => void;
  /** Zoom-crop to remove baked-in black bars (mobile default) */
  smartFill?: boolean;
  /** 1.05 – 1.15 works well */
  smartFillIntensity?: number;
  /** Additional className for the video element */
  videoClassName?: string;
  /** Next video URL for preloading (Reels-style) */
  nextVideoUrl?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = memo(
  ({
    videoUrl,
    thumbnailUrl,
    onEnded,
    className = "",
    style,
    isPlaying: externalPlaying,
    onPlayStateChange,
    isMuted: externalMuted,
    onMuteChange,
    autoPlay = false,
    preload = "metadata",
    episodeId,
    controls = true,
    showBackButton = false,
    onProgressUpdate,
    smartFill,
    smartFillIntensity,
    videoClassName = "",
    nextVideoUrl,
  }) => {
    /* ------------------------------------------------------------------ */
    /*  Helpers & constants                                                */
    /* ------------------------------------------------------------------ */
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { setVideoPlayerActive } = useVideoPlayer();
    const { isIOS, audioEnabled, enableAudioForVideo, unmuteYouTubePlayer } = useIOSAudio();
    
    const sanitizedUrl = useMemo(() => sanitizeVideoUrl(videoUrl), [videoUrl]);
    const sanitizedNextUrl = useMemo(() => nextVideoUrl ? sanitizeVideoUrl(nextVideoUrl) : undefined, [nextVideoUrl]);

    const effectiveSmartFill = smartFill ?? isMobile;
    const defaultSmartScale = smartFillIntensity ?? 1.08; // 8 % baseline zoom

    /* ------------------------------------------------------------------ */
    /*  State                                                             */
    /* ------------------------------------------------------------------ */
    const [internalPlaying, setInternalPlaying] = useState(false);
    const [internalMuted, setInternalMuted] = useState(false); // Start unmuted - audio will be enabled on first interaction
    const [showControls, setShowControls] = useState(!externalPlaying);
    const [hasInteracted, setHasInteracted] = useState(false); // Track if user has interacted
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [canPlay, setCanPlay] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [viewportSize, setViewportSize] = useState(() => ({
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
    }));

    const playing = externalPlaying ?? internalPlaying;
    const muted = externalMuted ?? internalMuted;

    /* ------------------------------------------------------------------ */
    /*  Refs                                                               */
    /* ------------------------------------------------------------------ */
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const ytPlayerRef = useRef<any>(null);
    const playerIdRef = useRef(`yt-${Date.now()}-${Math.random()}`);
    const controlsTimer = useRef<NodeJS.Timeout | null>(null);
    const stallTimer = useRef<NodeJS.Timeout | null>(null);
    const retryCount = useRef(0);
    const MAX_RETRIES = 3;

    /* ------------------------------------------------------------------ */
    /*  View tracking (counts a view on first load)                        */
    /* ------------------------------------------------------------------ */
    const { startViewTracking, stopViewTracking } = useViewTracking({
      episodeId,
      onViewCounted: () => console.log("View counted →", episodeId),
    });

    useEffect(() => {
      if (episodeId) startViewTracking();
    }, [episodeId, startViewTracking]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const handleResize = () => {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener("resize", handleResize, { passive: true });
      window.addEventListener("orientationchange", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }, []);

    /* ------------------------------------------------------------------ */
    /*  Back-button → global player flag                                   */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
      if (showBackButton) {
        setVideoPlayerActive(true);
        return () => setVideoPlayerActive(false);
      }
    }, [showBackButton, setVideoPlayerActive]);

    const goBack = () => navigate("/home");

    /* ------------------------------------------------------------------ */
    /*  URL validation & early return                                      */
    /* ------------------------------------------------------------------ */
    if (!sanitizedUrl) {
      return (
        <div
          className={`flex items-center justify-center w-full h-full bg-muted text-foreground rounded-lg ${className}`}
          style={style}
        >
          <div className="text-center p-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
            <p className="text-sm">Invalid video URL</p>
          </div>
        </div>
      );
    }

    /* ------------------------------------------------------------------ */
    /*  Detect video type                                                  */
    /* ------------------------------------------------------------------ */
    const videoType = useMemo(() => {
      const u = sanitizedUrl.toLowerCase();
      if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
      if (u.includes("vimeo.com")) return "vimeo";
      if (u.includes("drive.google.com")) return "gdrive";
      if (u.includes("videodelivery.net") || u.includes("iframe.videodelivery.net")) return "cloudflare";
      if (u.includes("pcloud.link") || u.includes("u.pcloud.link")) return "pcloud";
      // Treat HLS as direct for iOS native playback
      if (/\.(m3u8)$/i.test(u)) return "direct";
      if (/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(u) || u.includes(".supabase.co/storage/")) return "direct";
      return "iframe";
    }, [sanitizedUrl]);

    const isIframeBased = useMemo(
      () =>
        videoType === "youtube" ||
        videoType === "vimeo" ||
        videoType === "gdrive" ||
        videoType === "cloudflare" ||
        videoType === "iframe",
      [videoType],
    );

    const computedSmartScale = useMemo(() => {
      if (!effectiveSmartFill) return 1;
      if (!isIframeBased) return Math.max(defaultSmartScale, 1);
      const { width, height } = viewportSize;
      if (!width || !height) return Math.max(defaultSmartScale, 1);

      const viewportAspect = height / width;
      const horizontalVideoAspect = 9 / 16; // 16:9 sources

      if (viewportAspect <= horizontalVideoAspect) {
        return Math.max(defaultSmartScale, 1);
      }

      const scaleNeeded = viewportAspect / horizontalVideoAspect;
      const safeScale = Math.min(Math.max(scaleNeeded, defaultSmartScale, 1), 3.2);
      return Number.isFinite(safeScale) ? safeScale : Math.max(defaultSmartScale, 1);
    }, [defaultSmartScale, effectiveSmartFill, isIframeBased, viewportSize]);
    
    // Instant video loading for direct/pCloud videos
    const isDirectVideo = videoType === "direct" || videoType === "pcloud";
    const instantLoad = useInstantVideoLoad({
      videoId: episodeId || sanitizedUrl,
      videoUrl: sanitizedUrl,
      autoLoad: isDirectVideo && autoPlay,
      priority: autoPlay ? 'high' : 'low',
    });
    
    // Preload next video for instant playback like Instagram Reels
    useVideoPreloader(sanitizedUrl, sanitizedNextUrl, videoType === "direct" || videoType === "pcloud");

    /* ------------------------------------------------------------------ */
    /*  Controlled playback (parent → child)                               */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
      if (externalPlaying === undefined) return;

      const shouldPlay = externalPlaying;

      // YouTube
      if (videoType === "youtube" && ytPlayerRef.current) {
        try {
          shouldPlay ? ytPlayerRef.current.playVideo() : ytPlayerRef.current.pauseVideo();
        } catch (e) {
          console.warn("YT control error", e);
        }
        return;
      }

      // Direct / pCloud
      if ((videoType === "direct" || videoType === "pcloud") && videoRef.current) {
        const v = videoRef.current;
        if (shouldPlay && v.paused) {
          v.play().catch(() => {
            // autoplay blocked → just stay paused
            setInternalPlaying(false);
            onPlayStateChange?.(false);
          });
        } else if (!shouldPlay && !v.paused) {
          v.pause();
        }
      }
    }, [externalPlaying, videoType, onPlayStateChange]);

    /* ------------------------------------------------------------------ */
    /*  URL → embed helpers                                                */
    /* ------------------------------------------------------------------ */
    const getYouTubeId = useCallback((url: string) => {
      const m = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/.exec(url);
      return m?.[1] ?? "";
    }, []);

    const getEmbedUrl = useCallback(() => {
      switch (videoType) {
        case "youtube": {
          const id = getYouTubeId(sanitizedUrl);
          if (!id) return sanitizedUrl;
          const p = new URLSearchParams({
            modestbranding: "1",
            rel: "0",
            controls: controls ? "1" : "0",
            autohide: "1",
            iv_load_policy: "3",
            cc_load_policy: "0",
            disablekb: "0",
            fs: "1",
            playsinline: "1",
            enablejsapi: "1",
            origin: window.location.origin,
            autoplay: "0",
            mute: "0",
          });
          return `https://www.youtube.com/embed/${id}?${p.toString()}`;
        }
        case "vimeo": {
          const id = sanitizedUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (!id) return sanitizedUrl;
          const p = new URLSearchParams({
            autoplay: playing ? "1" : "0",
            muted: "0",
            quality: "auto",
            controls: controls ? "1" : "0",
            playsinline: "1",
            dnt: "1",
          });
          return `https://player.vimeo.com/video/${id}?${p.toString()}`;
        }
        case "gdrive": {
          const id =
            sanitizedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ?? sanitizedUrl.match(/id=([a-zA-Z0-9-_]+)/)?.[1] ?? "";
          return id ? `https://drive.google.com/file/d/${id}/preview` : sanitizedUrl;
        }
        case "pcloud":
          return sanitizedUrl.replace(
            /code=([^&]+)/,
            (_, c) => `https://nxsogkmnimaihoxbpnpd.functions.supabase.co/proxy-pcloud?code=${encodeURIComponent(c)}`,
          );
        case "direct":
          return sanitizedUrl;
        default:
          return sanitizedUrl;
      }
    }, [videoType, sanitizedUrl, playing, controls, getYouTubeId]);

    /* ------------------------------------------------------------------ */
    /*  YouTube API loader & player init                                   */
    /* ------------------------------------------------------------------ */
    const loadYTApi = useCallback(() => {
      if (window.YT?.Player) return Promise.resolve();

      return new Promise<void>((res, rej) => {
        const timeout = setTimeout(() => rej(new Error("YT timeout")), 15000);
        const ready = () => {
          clearTimeout(timeout);
          res();
        };
        if (window.onYouTubeIframeAPIReady) {
          const prev = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = () => {
            prev();
            ready();
          };
          return;
        }
        window.onYouTubeIframeAPIReady = ready;

        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const s = document.createElement("script");
          s.src = "https://www.youtube.com/iframe_api";
          s.async = true;
          s.onerror = () => rej(new Error("YT script load error"));
          document.head.appendChild(s);
        }
      });
    }, []);

    const initYTPlayer = useCallback(async () => {
      if (!window.YT?.Player || ytPlayerRef.current) return;
      const id = getYouTubeId(sanitizedUrl);
      if (!id) return setError(true);

      ytPlayerRef.current = new window.YT.Player(playerIdRef.current, {
        videoId: id,
          playerVars: {
            autoplay: 0,
            controls: 1, // Show controls for iOS compatibility
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            mute: 0, // Start unmuted - will work after user interaction
            origin: window.location.origin,
          },
          events: {
            onReady: (e: any) => {
              setCanPlay(true);
              setLoading(false);
              setError(false);
              // Unmute if user hasn't muted manually
              if (!muted) {
                e.target.unMute();
                e.target.setVolume(100);
              }
              if (playing) e.target.playVideo();
            },
          onStateChange: (e: any) => {
            const s = e.data;
            if (s === window.YT.PlayerState.PLAYING) {
              setInternalPlaying(true);
              onPlayStateChange?.(true);
              startViewTracking();
              setBuffering(false);
            } else if (s === window.YT.PlayerState.PAUSED) {
              setInternalPlaying(false);
              onPlayStateChange?.(false);
              stopViewTracking();
            } else if (s === window.YT.PlayerState.ENDED) {
              setInternalPlaying(false);
              onPlayStateChange?.(false);
              stopViewTracking();
              onEnded?.();
            } else if (s === window.YT.PlayerState.BUFFERING) {
              setBuffering(true);
            }
          },
          onError: () => {
            setError(true);
            setLoading(false);
            stopViewTracking();
          },
        },
      });
    }, [
      sanitizedUrl,
      controls,
      playing,
      onPlayStateChange,
      startViewTracking,
      stopViewTracking,
      onEnded,
      getYouTubeId,
    ]);

    useEffect(() => {
      if (videoType === "youtube") {
        loadYTApi()
          .then(initYTPlayer)
          .catch((e) => {
            console.error(e);
            setError(true);
          });
      }
      return () => {
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch {}
          ytPlayerRef.current = null;
        }
      };
    }, [videoType, loadYTApi, initYTPlayer]);

    /* ------------------------------------------------------------------ */
    /*  Play / Pause / Mute / Fullscreen                                   */
    /* ------------------------------------------------------------------ */
    const togglePlayPause = useCallback(async () => {
      const willPlay = !playing;
      setInternalPlaying(willPlay);
      onPlayStateChange?.(willPlay);
      setError(false);
      retryCount.current = 0;

      if (willPlay) {
        startViewTracking();
        const wasFirstInteraction = !hasInteracted;
        setHasInteracted(true); // Mark user interaction
        
        // Enable audio on iOS on first interaction - ALWAYS unmute on user interaction
        if (isIOS) {
          if (videoRef.current) {
            // Force unmute on iOS for user interaction
            videoRef.current.muted = false;
            videoRef.current.volume = 1;
            enableAudioForVideo(videoRef.current);
          }
          if (ytPlayerRef.current) {
            unmuteYouTubePlayer(ytPlayerRef.current);
          }
        }
      } else {
        stopViewTracking();
      }

      // ---- YouTube ----------------------------------------------------
      if (videoType === "youtube" && ytPlayerRef.current) {
        if (willPlay && isIOS) {
          // Always unmute YouTube on iOS when user interacts
          unmuteYouTubePlayer(ytPlayerRef.current);
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(100);
        }
        willPlay ? ytPlayerRef.current.playVideo() : ytPlayerRef.current.pauseVideo();
        return;
      }

      // ---- Direct / pCloud --------------------------------------------
      if ((videoType === "direct" || videoType === "pcloud") && videoRef.current) {
        const v = videoRef.current;
        if (willPlay) {
          setLoading(true);
          
          // Ensure audio is enabled on iOS on user interaction - FORCE UNMUTE
          if (isIOS) {
            // Always unmute on iOS when user interacts, regardless of muted prop
            v.muted = false;
            v.volume = 1;
            // Enable audio session
            enableAudioForVideo(v);
          } else {
            // For non-iOS, respect the muted prop
            v.muted = muted;
            v.volume = muted ? 0 : 1;
          }
          
          try {
            await v.play();
            setLoading(false);
          } catch (e: any) {
            if (e.name === "NotAllowedError") {
              // For iOS, don't force mute - wait for user interaction
              if (isIOS && !hasInteracted) {
                // On iOS, wait for user interaction
                setInternalPlaying(false);
                onPlayStateChange?.(false);
                setLoading(false);
              } else {
                // autoplay blocked → stay paused
                setInternalPlaying(false);
                onPlayStateChange?.(false);
                setLoading(false);
              }
            } else throw e;
          }
        } else {
          v.pause();
        }
      }
    }, [playing, videoType, onPlayStateChange, startViewTracking, stopViewTracking, isIOS, hasInteracted, enableAudioForVideo, unmuteYouTubePlayer, muted]);

    const toggleMute = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation(); // Prevent triggering play/pause
      
      const willMute = !muted;
      setInternalMuted(willMute);
      onMuteChange?.(willMute);
      
      if (videoType === "youtube" && ytPlayerRef.current) {
        if (willMute) {
          ytPlayerRef.current.mute();
        } else {
          // Enable audio for iOS on unmute
          if (isIOS) {
            unmuteYouTubePlayer(ytPlayerRef.current);
          } else {
            ytPlayerRef.current.unMute();
          }
        }
      } else if (videoRef.current) {
        videoRef.current.muted = willMute;
        // Enable audio for iOS on unmute - must happen in user gesture
        if (!willMute && isIOS) {
          enableAudioForVideo(videoRef.current);
        }
      }
    }, [muted, videoType, onMuteChange, isIOS, enableAudioForVideo, unmuteYouTubePlayer]);

    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return;
      if (!fullscreen) {
        containerRef.current.requestFullscreen?.() ??
          (containerRef.current as any).webkitRequestFullscreen?.() ??
          (containerRef.current as any).msRequestFullscreen?.();
      } else {
        document.exitFullscreen?.() ??
          (document as any).webkitExitFullscreen?.() ??
          (document as any).msExitFullscreen?.();
      }
    }, [fullscreen]);

    /* ------------------------------------------------------------------ */
    /*  Controls visibility (tap / hover)                                   */
    /* ------------------------------------------------------------------ */
    const showControlsTemporarily = useCallback(() => {
      setShowControls(true);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      if (playing) {
        controlsTimer.current = setTimeout(() => setShowControls(false), 2000);
      }
    }, [playing]);

    const handleContainerClick = useCallback(() => {
      isMobile ? showControlsTemporarily() : togglePlayPause();
    }, [isMobile, showControlsTemporarily, togglePlayPause]);

    useEffect(() => {
      if (!playing) {
        setShowControls(true);
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
      }
    }, [playing]);

    useEffect(() => {
      const handler = () => setFullscreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", handler);
      document.addEventListener("webkitfullscreenchange", handler);
      document.addEventListener("msfullscreenchange", handler);
      return () => {
        document.removeEventListener("fullscreenchange", handler);
        document.removeEventListener("webkitfullscreenchange", handler);
        document.removeEventListener("msfullscreenchange", handler);
      };
    }, []);

    /* ------------------------------------------------------------------ */
    /*  Global pause (navigation, tab hide, etc.)                           */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
      const pauseAll = () => {
        if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo?.();
        if (videoRef.current) videoRef.current.pause();
        if (iframeRef.current) iframeRef.current.src = "about:blank";
        setInternalPlaying(false);
        onPlayStateChange?.(false);
        stopViewTracking();
      };
      window.addEventListener("pause-all-videos", pauseAll as EventListener);
      return () => window.removeEventListener("pause-all-videos", pauseAll as EventListener);
    }, [onPlayStateChange, stopViewTracking]);

    /* ------------------------------------------------------------------ */
    /*  Cleanup on unmount                                                 */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
      return () => {
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
        stopViewTracking();
        try {
          ytPlayerRef.current?.pauseVideo?.();
          ytPlayerRef.current?.stopVideo?.();
          ytPlayerRef.current?.destroy?.();
          videoRef.current?.pause();
          if (videoRef.current) videoRef.current.src = "";
          if (iframeRef.current) iframeRef.current.src = "about:blank";
        } catch {}
      };
    }, [stopViewTracking]);

    /* ------------------------------------------------------------------ */
    /*  Direct-video event handlers                                        */
    /* ------------------------------------------------------------------ */
    const onDirectLoad = () => {
      setLoading(false);
      setError(false);
      setCanPlay(true);
    };
    const onDirectError = () => {
      setError(true);
      setLoading(false);
      setBuffering(false);
      setInternalPlaying(false);
      onPlayStateChange?.(false);
      stopViewTracking();
    };
    const onDirectPlay = () => {
      setInternalPlaying(true);
      onPlayStateChange?.(true);
      startViewTracking();
      setLoading(false);
    };
    const onDirectPause = () => {
      setInternalPlaying(false);
      onPlayStateChange?.(false);
      stopViewTracking();
    };
    const onDirectTimeUpdate = () => {
      if (!videoRef.current) return;
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      if (!isNaN(cur) && !isNaN(dur)) {
        setCurrentTime(cur);
        setDuration(dur);
        onProgressUpdate?.(cur, dur);
      }
    };

    /* ------------------------------------------------------------------ */
    /*  Render helpers                                                     */
    /* ------------------------------------------------------------------ */
    const renderYouTube = () => {
      const scaleValue = effectiveSmartFill ? computedSmartScale : 1;
      return (
        <div className="absolute inset-0 overflow-hidden bg-black">
          <div
            id={playerIdRef.current}
            className="absolute w-full h-full"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${scaleValue})`,
              transformOrigin: "center center",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      );
    };

    const renderIframe = () => {
      const src = getEmbedUrl();
      return (
        <iframe
          ref={iframeRef}
          src={src}
          className={`absolute w-full h-full ${videoClassName}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${effectiveSmartFill ? computedSmartScale : 1})`,
            transformOrigin: "center center",
            width: "100%",
            height: "100%",
            backgroundColor: "black",
          }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          title="Embedded video"
        />
      );
    };

    const renderDirect = () => {
      // Use instant load source if available, otherwise fallback to original URL
      const videoSrc = (isDirectVideo && instantLoad.videoSrc) ? instantLoad.videoSrc : getEmbedUrl();
      // Disable skeleton on iOS to avoid visual delays
      const showSkeleton = !isIOS && isDirectVideo && instantLoad.isLoading && !canPlay;
      const effectiveAutoPlay = isIOS ? false : autoPlay;

      // Eager buffer on iOS when source changes
      useEffect(() => {
        if (isIOS && videoRef.current) {
          try { videoRef.current.preload = 'auto'; videoRef.current.load(); } catch {}
        }
      }, [isIOS, videoSrc]);

      return (
        <>
          {/* Loading skeleton with blurred thumbnail */}
          {showSkeleton && thumbnailUrl && (
            <VideoLoadingSkeleton 
              thumbnailUrl={thumbnailUrl}
              blur={true}
              showSpinner={true}
            />
          )}
          
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full bg-black ${videoClassName}`}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            src={isIOS && !hasInteracted ? undefined : videoSrc}
            poster={thumbnailUrl}
            muted={muted}
            autoPlay={effectiveAutoPlay}
            preload={isIOS ? "auto" : "metadata"}
            playsInline
            webkit-playsinline="true"
            x-webkit-airplay="allow"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            controls={controls}
            disablePictureInPicture
            crossOrigin="anonymous"
            onTouchStart={(e) => {
              // iOS requires user interaction for audio
              if (isIOS && !hasInteracted && videoRef.current) {
                setHasInteracted(true);
                const v = videoRef.current as HTMLVideoElement;
                try { 
                  // Assign src only after interaction to avoid stall bugs
                  if (!v.src) { v.src = videoSrc; v.load(); }
                  // Force unmute on iOS touch
                  v.muted = false;
                  v.volume = 1;
                  enableAudioForVideo(v);
                } catch {}
              }
            }}
            onLoadedData={(e) => {
              console.log('[iOS Video] onLoadedData', { url: videoSrc, readyState: (e.target as HTMLVideoElement)?.readyState });
              onDirectLoad();
            }}
            onError={(e: any) => {
              const v = videoRef.current;
              console.error('[iOS Video] onError', { error: e?.message, code: v?.error?.code, networkState: v?.networkState, readyState: v?.readyState, src: videoSrc });
              onDirectError();
            }}
            onPlay={() => {
              console.log('[iOS Video] onPlay');
              // Ensure audio is enabled on iOS when video plays
              if (isIOS && videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.volume = 1;
                enableAudioForVideo(videoRef.current);
              }
              onDirectPlay();
            }}
            onPause={onDirectPause}
            onEnded={onEnded}
            onTimeUpdate={onDirectTimeUpdate}
            onWaiting={() => {
              console.log('[iOS Video] onWaiting');
              // Reduce perceived loading on iOS
              if (!isIOS) setBuffering(true);
            }}
            onCanPlay={() => {
              console.log('[iOS Video] onCanPlay');
              setBuffering(false);
              setLoading(false);
              setError(false);
            }}
            onCanPlayThrough={() => {
              console.log('[iOS Video] onCanPlayThrough');
              setBuffering(false);
              setLoading(false);
            }}
            onLoadStart={() => {
              console.log('[iOS Video] onLoadStart', { url: videoSrc });
              setLoading(true);
            }}
            onSeeking={() => setBuffering(true)}
            onSeeked={() => setBuffering(false)}
            onLoadedMetadata={() => {
              console.log('[iOS Video] onLoadedMetadata');
              const v = videoRef.current;
              // Stall fallback: if not enough data to play within 2s, retry
              if (stallTimer.current) clearTimeout(stallTimer.current);
              stallTimer.current = setTimeout(() => {
                if (!v) return;
                const rs = v.readyState; // 0-4
                if (rs < 3) {
                  console.warn('[iOS Video] Stall detected, reloading source');
                  try { v.load(); } catch {}
                }
              }, 2000);
              setLoading(false);
            }}
          >
            {/* Provide explicit source type for better iOS handling */}
            {/\.m3u8($|\?)/i.test(videoSrc) ? (
              <source src={videoSrc} type="application/vnd.apple.mpegurl" />
            ) : (
              <source src={videoSrc} type="video/mp4" />
            )}
          </video>
          
          {/* Cached indicator badge */}
          {isDirectVideo && instantLoad.videoSrc && !instantLoad.isLoading && (
            <div className="absolute top-4 right-4 z-30 bg-green-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg flex items-center gap-1.5">
              <span className="text-sm">⚡</span>
              <span>Instant</span>
            </div>
          )}
        </>
      );
    };

    const renderCenterPlay = () =>
      !playing && canPlay && !loading ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Button
            onClick={togglePlayPause}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 transition-all hover:scale-105 pointer-events-auto"
            size="lg"
          >
            <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
          </Button>
        </div>
      ) : null;

    const renderError = () => (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="text-center text-white p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-sm text-gray-300 mb-4">Failed to load video</p>
          <Button
            onClick={() => {
              setError(false);
              setLoading(true);
              retryCount.current = 0;
              if (videoType === "youtube") initYTPlayer();
              else togglePlayPause();
            }}
            className="bg-white/20 hover:bg-white/30"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );

    const renderBuffering = () =>
      playing && buffering && !isIOS ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-40">
          <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
      ) : null;

    /* ------------------------------------------------------------------ */
    /*  Final JSX                                                          */
    /* ------------------------------------------------------------------ */
    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full bg-black overflow-hidden ${className}`}
        style={style}
        onClick={handleContainerClick}
        onMouseMove={!isMobile ? showControlsTemporarily : undefined}
      >
        {/* Back button */}
        {showBackButton && (
          <div className="absolute top-4 left-4 z-50">
            <Button
              onClick={goBack}
              size="sm"
              className="bg-muted/50 hover:bg-muted/70 text-foreground border border-border/20 backdrop-blur-md rounded-full p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Video layer */}
        {videoType === "youtube" && renderYouTube()}
        {(videoType === "vimeo" || videoType === "gdrive" || videoType === "cloudflare" || videoType === "iframe") &&
          renderIframe()}
        {(videoType === "direct" || videoType === "pcloud") && renderDirect()}

        {/* Thumbnail (only when not playing & not ready) */}
        {thumbnailUrl && !playing && !canPlay && (
          <div className="absolute inset-0 z-20">
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        )}

        {/* Center play button */}
        {renderCenterPlay()}

        {/* States */}
        {error && renderError()}
        {renderBuffering()}
      </div>
    );
  },
);

OptimizedVideoPlayer.displayName = "OptimizedVideoPlayer";
export default OptimizedVideoPlayer;
