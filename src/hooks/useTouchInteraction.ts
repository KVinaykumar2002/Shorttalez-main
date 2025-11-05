import { useEffect, useRef, useState } from 'react';

interface TouchInteractionOptions {
  enableDuringScroll?: boolean;
  animationClass?: string;
  debounceMs?: number;
}

export const useTouchInteraction = (options: TouchInteractionOptions = {}) => {
  const {
    enableDuringScroll = true,
    animationClass = 'touch-active',
    debounceMs = 150
  } = options;
  
  const elementRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isScrollingRef = useRef(false);
  const lastScrollTime = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;
    
    // Track scrolling state
    const handleScroll = () => {
      isScrollingRef.current = true;
      lastScrollTime.current = Date.now();
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      // Allow touch interactions during scroll if enabled
      if (!enableDuringScroll && isScrollingRef.current) {
        return;
      }

      // Prevent default only for non-scroll touches
      if (!isScrollingRef.current) {
        e.preventDefault();
      }

      setIsActive(true);
      element.classList.add(animationClass);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleTouchEnd = () => {
      // Debounce the end of touch to allow animation to complete
      timeoutRef.current = setTimeout(() => {
        setIsActive(false);
        element.classList.remove(animationClass);
      }, debounceMs);
    };

    const handleTouchCancel = () => {
      setIsActive(false);
      element.classList.remove(animationClass);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Check if touch moved outside element boundaries
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();
      
      const isOutside = 
        touch.clientX < rect.left ||
        touch.clientX > rect.right ||
        touch.clientY < rect.top ||
        touch.clientY > rect.bottom;

      if (isOutside) {
        setIsActive(false);
        element.classList.remove(animationClass);
      }
    };

    // Add scroll listener to window
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add touch listeners to element
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      element.removeEventListener('touchmove', handleTouchMove);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [enableDuringScroll, animationClass, debounceMs]);

  return {
    elementRef,
    isActive,
    isScrolling: isScrollingRef.current
  };
};