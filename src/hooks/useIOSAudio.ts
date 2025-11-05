import { useEffect, useState, useCallback } from 'react';

/**
 * Detects iOS and handles iOS-specific audio restrictions
 * iOS requires user interaction to enable audio playback
 */
export const useIOSAudio = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Detect iOS
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
  }, []);

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
