import { useEffect, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const checkPlatform = () => {
      const platform = Capacitor.getPlatform();
      setIsMobile(platform === 'ios' || platform === 'android');
      setIsIOS(platform === 'ios');
      setIsAndroid(platform === 'android');
    };

    checkPlatform();
  }, []);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (isMobile) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
  };

  const handleTouchFeedback = (element: HTMLElement, callback?: () => void) => {
    if (!isMobile) return;

    element.addEventListener('touchstart', () => {
      triggerHaptic(ImpactStyle.Light);
      element.style.transform = 'scale(0.95)';
      element.style.transition = 'transform 0.1s ease';
    });

    element.addEventListener('touchend', () => {
      element.style.transform = 'scale(1)';
      callback?.();
    });

    element.addEventListener('touchcancel', () => {
      element.style.transform = 'scale(1)';
    });
  };

  return {
    isMobile,
    isIOS,
    isAndroid,
    triggerHaptic,
    handleTouchFeedback
  };
};