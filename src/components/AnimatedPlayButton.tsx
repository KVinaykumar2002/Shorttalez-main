import React, { useState, useEffect } from 'react';
import { Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedPlayButtonProps {
  isVisible: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pulse' | 'float' | 'scale' | 'glow';
  showSoundWave?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const AnimatedPlayButton: React.FC<AnimatedPlayButtonProps> = ({
  isVisible,
  size = 'md',
  variant = 'float',
  showSoundWave = true,
  onClick
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setMousePosition({
      x: (e.clientX - centerX) * 0.1,
      y: (e.clientY - centerY) * 0.1
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touch = e.touches[0];
    setMousePosition({
      x: (touch.clientX - centerX) * 0.1,
      y: (touch.clientY - centerY) * 0.1
    });
  };

  const handleTouchStart = () => {
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'pulse':
        return 'animate-pulse';
      case 'float':
        return 'animate-bounce';
      case 'scale':
        return isHovered ? 'scale-110' : 'scale-100';
      case 'glow':
        return 'shadow-2xl shadow-primary/50';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background ripple effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`${sizeClasses[size]} bg-primary/20 rounded-full animate-ping`} />
        <div className={`${sizeClasses[size]} bg-primary/30 rounded-full animate-ping animation-delay-200 absolute`} />
        <div className={`${sizeClasses[size]} bg-primary/10 rounded-full animate-ping animation-delay-400 absolute`} />
      </div>

      {/* Moving play button */}
      <Button 
        size="icon" 
        className={`
          ${sizeClasses[size]} rounded-full bg-primary/95 hover:bg-primary 
          backdrop-blur-sm border-2 border-white/30 shadow-xl
          transition-all duration-300 ease-out relative z-10
          touch-manipulation ripple-effect
          ${getVariantClasses()}
        `}
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) ${
            isHovered ? 'scale(1.1)' : 'scale(1)'
          }`
        }}
        onClick={onClick}
      >
        <Play className={`${iconSizes[size]} text-primary-foreground ml-1 animate-pulse`} />
        
        {/* Glowing border */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 to-primary/30 blur-sm -z-10 animate-pulse" />
      </Button>

      {/* Sound wave animation */}
      {showSoundWave && isHovered && (
        <div className="absolute flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`
                w-1 bg-primary/60 rounded-full mx-1 animate-pulse
                ${i === 0 ? 'h-4 animation-delay-100' : ''}
                ${i === 1 ? 'h-6 animation-delay-200' : ''}
                ${i === 2 ? 'h-8 animation-delay-300' : ''}
                ${i === 3 ? 'h-6 animation-delay-400' : ''}
              `}
              style={{
                transform: `translateX(${(i - 1.5) * 40 + mousePosition.x * 0.5}px)`,
                animationDuration: `${0.8 + i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Volume indicator */}
      {isHovered && (
        <div className="absolute top-full mt-2 flex items-center justify-center">
          <div className="bg-black/80 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 animate-fade-in">
            <Volume2 className="w-3 h-3" />
            <span>Click to play</span>
          </div>
        </div>
      )}
    </div>
  );
};