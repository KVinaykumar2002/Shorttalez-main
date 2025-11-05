import React, { ReactNode } from 'react';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { MobileGestureWrapper } from '@/components/MobileGestureWrapper';

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  enableSwipeNavigation?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const MobileResponsiveLayout: React.FC<MobileResponsiveLayoutProps> = ({
  children,
  enableSwipeNavigation = false,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  const { isMobile, isIOS, isAndroid } = useMobileOptimization();

  const containerClasses = `
    ${className}
    ${isMobile ? 'touch-optimized' : ''}
    ${isIOS ? 'safe-top safe-bottom' : ''}
    ${isAndroid ? 'overscroll-none' : ''}
    smooth-scroll
    relative
    min-h-screen
    w-full
  `.trim();

  if (enableSwipeNavigation && isMobile) {
    return (
      <MobileGestureWrapper
        className={containerClasses}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
      >
        {children}
      </MobileGestureWrapper>
    );
  }

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};