import React, { useRef, useEffect, ReactNode } from 'react';
import { useGesture } from '@use-gesture/react';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { ImpactStyle } from '@capacitor/haptics';

interface MobileGestureWrapperProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  className?: string;
  enableHaptics?: boolean;
}

export const MobileGestureWrapper: React.FC<MobileGestureWrapperProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onTap,
  onDoubleTap,
  className = '',
  enableHaptics = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile, triggerHaptic } = useMobileOptimization();
  const lastTap = useRef(0);

  const bind = useGesture({
    onDrag: ({ direction: [dx, dy], velocity: [vx, vy], distance, cancel }) => {
      if (!isMobile) return;
      
      // Convert distance to number if it's a Vector2
      const dist = Array.isArray(distance) ? Math.sqrt(distance[0] ** 2 + distance[1] ** 2) : distance;
      
      // Swipe detection
      if (dist > 50 && (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5)) {
        if (enableHaptics) triggerHaptic(ImpactStyle.Medium);
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (dx > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (dx < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (dy > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (dy < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
        cancel();
      }
    },
    onPinch: ({ offset: [scale] }) => {
      if (!isMobile) return;
      if (enableHaptics && Math.abs(scale - 1) > 0.1) {
        triggerHaptic(ImpactStyle.Light);
      }
      onPinch?.(scale);
    },
    onClick: () => {
      if (!isMobile) return;
      
      const now = Date.now();
      const timeSinceLastTap = now - lastTap.current;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap
        if (enableHaptics) triggerHaptic(ImpactStyle.Heavy);
        onDoubleTap?.();
      } else {
        // Single tap
        if (enableHaptics) triggerHaptic(ImpactStyle.Light);
        setTimeout(() => {
          if (Date.now() - lastTap.current >= 300) {
            onTap?.();
          }
        }, 300);
      }
      
      lastTap.current = now;
    }
  }, {
    drag: {
      threshold: 10,
      filterTaps: true
    },
    pinch: {
      threshold: 0.1
    }
  });

  return (
    <div
      ref={ref}
      {...bind()}
      className={`touch-manipulation select-none ${className}`}
      style={{
        touchAction: 'pan-x pan-y pinch-zoom',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};