import React from 'react';
import { Play } from 'lucide-react';

interface MovieClapboardProps {
  className?: string;
  animate?: boolean;
}

export const MovieClapboard: React.FC<MovieClapboardProps> = ({ 
  className = "", 
  animate = false 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative w-16 h-16 flex items-center justify-center
        bg-gradient-to-br from-primary/90 to-primary
        rounded-full shadow-lg border-2 border-primary-foreground/20
        transition-all duration-300 ease-out
        ${animate ? 'animate-pulse scale-110' : 'hover:scale-105'}
      `}>
        {/* Animated rings */}
        {animate && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-primary/60 animate-pulse" />
          </>
        )}
        
        {/* Play icon */}
        <Play 
          className={`
            w-6 h-6 text-primary-foreground ml-1
            transition-transform duration-200
            ${animate ? 'animate-bounce' : ''}
          `}
          fill="currentColor"
        />
        
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full
          bg-gradient-to-br from-primary/40 to-transparent
          blur-sm transition-opacity duration-300
          ${animate ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `} />
      </div>
    </div>
  );
};