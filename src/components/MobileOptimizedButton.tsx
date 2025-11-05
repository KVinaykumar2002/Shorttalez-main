import React, { useRef, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { ImpactStyle } from '@capacitor/haptics';

interface MobileOptimizedButtonProps extends ButtonProps {
  hapticStyle?: ImpactStyle;
  touchScale?: number;
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({
  children,
  hapticStyle = ImpactStyle.Light,
  touchScale = 0.95,
  onClick,
  className = '',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isMobile, triggerHaptic } = useMobileOptimization();

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || !isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      triggerHaptic(hapticStyle);
      button.style.transform = `scale(${touchScale})`;
      button.style.transition = 'transform 0.1s ease-out';
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      button.style.transform = 'scale(1)';
      // Trigger click after animation
      setTimeout(() => onClick?.(e as any), 50);
    };

    const handleTouchCancel = () => {
      button.style.transform = 'scale(1)';
    };

    button.addEventListener('touchstart', handleTouchStart, { passive: false });
    button.addEventListener('touchend', handleTouchEnd, { passive: false });
    button.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      button.removeEventListener('touchstart', handleTouchStart);
      button.removeEventListener('touchend', handleTouchEnd);
      button.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isMobile, triggerHaptic, hapticStyle, touchScale, onClick]);

  return (
    <Button
      ref={buttonRef}
      className={`touch-manipulation select-none ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''} ${className}`}
      onClick={isMobile ? undefined : onClick}
      {...props}
    >
      {children}
    </Button>
  );
};