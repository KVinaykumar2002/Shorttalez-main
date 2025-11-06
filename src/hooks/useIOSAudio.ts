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
    if (!videoElement) return;
    
    // Set playsInline and webkit-playsinline attributes for iOS
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');
    
    // Ensure volume is set to 1 (all platforms)
    videoElement.volume = 1;
    
    if (isIOS) {
      initAudioContext();
      
      // Resume audio context if suspended - CRITICAL for iOS audio
      if (audioContext) {
        if (audioContext.state === 'suspended') {
          // For iOS, we MUST resume AudioContext before unmuting
          audioContext.resume().then(() => {
            console.log('[iOS Audio] AudioContext resumed successfully');
            // After resuming, ensure video audio is enabled
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
              videoElement.muted = false;
              // Double-check after a microtask to ensure it stuck
              Promise.resolve().then(() => {
                if (videoElement.muted) {
                  console.warn('[iOS Audio] Video still muted after unmute attempt, retrying...');
                  videoElement.muted = false;
                }
                console.log('[iOS Audio] Video unmuted after AudioContext resume', {
                  videoMuted: videoElement.muted,
                  audioContextState: audioContext.state
                });
              });
            });
          }).catch((err) => {
            console.warn('[iOS Audio] Failed to resume audio context:', err);
            // Even if resume fails, try to unmute (might work in some cases)
            videoElement.muted = false;
          });
        } else {
          // AudioContext is already running, unmute immediately
          videoElement.muted = false;
          console.log('[iOS Audio] AudioContext already running, video unmuted', {
            videoMuted: videoElement.muted,
            audioContextState: audioContext.state
          });
        }
      } else {
        // No AudioContext yet, but still ensure video is unmuted
        // The AudioContext will be created on next interaction
        videoElement.muted = false;
        console.log('[iOS Audio] No AudioContext yet, video unmuted', {
          videoMuted: videoElement.muted
        });
      }
      
      setAudioEnabled(true);
    } else {
      // For non-iOS (Android, Desktop), just ensure audio is enabled
      videoElement.muted = false;
      console.log('[Audio] Audio enabled for video (non-iOS)', { 
        videoMuted: videoElement.muted,
        videoVolume: videoElement.volume
      });
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
