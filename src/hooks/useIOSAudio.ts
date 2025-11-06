import { useEffect, useState, useCallback } from 'react';

/**
 * Detects iOS and handles iOS-specific audio restrictions
 * iOS requires user interaction to enable audio playback
 */
export const useIOSAudio = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Detect iOS and initialize AudioContext early (not wait for user interaction)
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
    
    // Initialize AudioContext early on mount for first video
    // This ensures AudioContext is ready before user interaction
    if (iOS && !audioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        setAudioEnabled(true);
        console.log('[iOS Audio] AudioContext initialized early:', ctx.state);
      } catch (err) {
        console.warn('[iOS Audio] Failed to initialize AudioContext early:', err);
      }
    }
  }, [audioContext]);

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContext && isIOS) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      
      // Resume audio context
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      setAudioEnabled(true);
    }
  }, [audioContext, isIOS]);

  // Ensure WebKit resumes audio context on any touch gesture
  useEffect(() => {
    if (!isIOS) return;
    const resumeAudio = () => {
      try {
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }
      } catch {}
    };
    document.addEventListener('touchstart', resumeAudio, { passive: true });
    document.addEventListener('click', resumeAudio, { passive: true });
    return () => {
      document.removeEventListener('touchstart', resumeAudio as any);
      document.removeEventListener('click', resumeAudio as any);
    };
  }, [isIOS, audioContext]);

  // Enable audio for video element (must be called from user interaction)
  const enableAudioForVideo = useCallback((videoElement: HTMLVideoElement) => {
    if (isIOS && videoElement) {
      initAudioContext();
      
      // Must set muted to false synchronously in user gesture
      videoElement.muted = false;
      videoElement.volume = 1;
      
      // Set playsInline and webkit-playsinline attributes for iOS
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('webkit-playsinline', 'true');
      
      // Resume audio context if suspended
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch((err) => {
          console.warn('Failed to resume audio context:', err);
        });
      }
      
      // If video is paused, play it
      if (videoElement.paused) {
        const playPromise = videoElement.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.log('iOS audio playback error:', error);
            // Don't force mute on iOS - wait for user interaction
            if (error?.name !== 'NotAllowedError') {
              // Fallback: try one more time only for non-autoplay errors
              setTimeout(() => {
                videoElement.muted = false;
                videoElement.play().catch(() => {});
              }, 100);
            }
          });
        }
      }
      
      setAudioEnabled(true);
    }
  }, [isIOS, initAudioContext, audioContext]);

  // Unmute YouTube player
  const unmuteYouTubePlayer = useCallback((ytPlayer: any) => {
    if (isIOS && ytPlayer) {
      initAudioContext();
      try {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
      } catch (error) {
        console.log('Error unmuting YouTube player:', error);
      }
    }
  }, [isIOS, initAudioContext]);

  return {
    isIOS,
    audioEnabled,
    initAudioContext,
    enableAudioForVideo,
    unmuteYouTubePlayer,
  };
};
