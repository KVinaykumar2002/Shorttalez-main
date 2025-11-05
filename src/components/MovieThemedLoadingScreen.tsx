import React, { useState, useEffect } from 'react';
import { AnimatedImageLogo } from '@/components/AnimatedImageLogo';

interface MovieThemedLoadingScreenProps {
  onComplete?: () => void;
  message?: string;
}

const movieQuotes = [
  "Lights, Camera, Action!",
  "Show modalithey ravaali...",
  "Prathi manchaina story cheppali",
  "Cinema andharu ki nachaali",
  "Movies avi marakaaniki raani dreams",
  "Stories lo power chaala untundhi",
  "Endless entertainment world lo welcome",
  "Mee next favorite story wait chesthundhi"
];

const movieIcons = [
  "🎬", "🎭", "🎪", "🎨", "🎵", "🌟", "✨", "🎯"
];

export const MovieThemedLoadingScreen: React.FC<MovieThemedLoadingScreenProps> = ({ 
  onComplete, 
  message = "Mee cinematic experience load chesthunnam..." 
}) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'loading' | 'complete'>('loading');

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % movieQuotes.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setStage('complete');
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  if (stage === 'complete' && onComplete) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-secondary via-primary to-accent overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating movie icons */}
        {movieIcons.map((icon, index) => (
          <div
            key={index}
            className="absolute animate-float opacity-20 text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {icon}
          </div>
        ))}
        
        {/* Film strip animation */}
        <div className="absolute top-0 left-0 w-full h-2 bg-primary opacity-60 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-primary opacity-60 animate-pulse" 
             style={{ animationDelay: '0.5s' }} />
        
        {/* Spotlight effect */}
        <div className="absolute inset-0 bg-gradient-hero animate-luxury-glow" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md px-6">
        {/* Logo */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <AnimatedImageLogo size="xl" showCaption={true} />
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-primary/30">
            <div 
              className="h-full bg-gradient-primary rounded-full transition-all duration-300 ease-out relative animate-golden-shimmer"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-accent/30 animate-shimmer" />
            </div>
          </div>
          <div className="mt-2 text-primary-foreground/90 text-sm font-medium">
            {Math.round(progress)}% Complete avvindhi
          </div>
        </div>

        {/* Movie quote */}
        <div className="mb-4 h-16 flex items-center justify-center">
          <p className="text-primary-foreground text-lg font-light italic animate-fade-in leading-relaxed">
            "{movieQuotes[currentQuote]}"
          </p>
        </div>

        {/* Loading message */}
        <div className="text-primary-foreground/70 text-sm animate-pulse">
          {message}
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-2 mt-6 opacity-70">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
        }
      `}</style>
    </div>
  );
};