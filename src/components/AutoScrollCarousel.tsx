import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AutoScrollCarouselProps {
  children: React.ReactNode[];
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
  pauseOnHover?: boolean;
  autoScroll?: boolean; // New prop to enable/disable auto-scroll
}

export const AutoScrollCarousel: React.FC<AutoScrollCarouselProps> = ({
  children,
  className = '',
  speed = 'normal',
  pauseOnHover = true,
  autoScroll = true, // Default to true, can be disabled
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Create duplicate items for seamless loop
  const duplicatedChildren = [...children, ...children];

  const getAnimationClass = () => {
    if (!autoScroll) return ''; // No animation if autoScroll is false
    const speedMap = {
      slow: {
        mobile: 'animate-scroll-left-mobile',
        tablet: 'animate-scroll-left-tablet',
        desktop: 'animate-scroll-left-slow',
      },
      normal: {
        mobile: 'animate-scroll-left-mobile',
        tablet: 'animate-scroll-left-tablet',
        desktop: 'animate-scroll-left',
      },
      fast: {
        mobile: 'animate-scroll-left-mobile',
        tablet: 'animate-scroll-left-tablet',
        desktop: 'animate-scroll-left-fast',
      },
    };
    return `${speedMap[speed].mobile} sm:${speedMap[speed].tablet} md:${speedMap[speed].desktop}`;
  };

  // Touch/Mouse event handlers for manual scrolling
  const handleStart = useCallback((clientX: number) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setIsUserInteracting(true);
    setIsPaused(true);
    setStartX(clientX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = clientX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => {
      setIsUserInteracting(false);
      if (autoScroll) setIsPaused(false); // Resume only if autoScroll is enabled
    }, 1000); // Resume auto-scroll after 1 second
  }, [autoScroll]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.pageX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].pageX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].pageX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Pause on hover for desktop
  const handleMouseEnter = () => {
    if (pauseOnHover && !isDragging && autoScroll) {
      setIsPaused(true);
    }
  };

  const handleMouseLeaveContainer = () => {
    if (!isDragging && autoScroll) {
      setIsPaused(false);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeaveContainer}
      >
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex space-x-4 will-change-transform overflow-hidden cursor-grab select-none",
            isDragging && "cursor-grabbing",
            !isUserInteracting && autoScroll && getAnimationClass() // Apply animation only if autoScroll is true
          )}
          style={{
            width: 'max-content',
            animationPlayState: (isPaused || isUserInteracting || !autoScroll) ? 'paused' : 'running',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {duplicatedChildren.map((child, index) => (
            <div
              key={`carousel-item-${index}`}
              className="flex-shrink-0"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background via-background to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background via-background to-transparent pointer-events-none z-10" />

      {/* Mobile scroll indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 md:hidden">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <div className="w-4 h-1 bg-white/60 rounded-full"></div>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Individual series card wrapper for the carousel
interface SeriesCardWrapperProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SeriesCardWrapper: React.FC<SeriesCardWrapperProps> = ({
  children,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={cn(
        "cursor-pointer transition-transform duration-300 hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AutoScrollCarousel;