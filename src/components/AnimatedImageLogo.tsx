import React, { useState, useEffect } from 'react';
import { Film, Camera, Sparkles, Star, Play, Home, Video } from 'lucide-react';
import talezClapboard from '@/assets/talez-clapboard.png';

interface AnimatedImageLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCaption?: boolean;
  className?: string;
}

export const AnimatedImageLogo: React.FC<AnimatedImageLogoProps> = ({
  size = 'md',
  showCaption = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [sparkleIndex, setSparkleIndex] = useState(0);
  const [showDelayedCaption, setShowDelayedCaption] = useState(false);

  // Cycling sparkle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkleIndex(prev => (prev + 1) % 6);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Delayed caption animation - appears after main logo animation
  useEffect(() => {
    console.log('Logo useEffect triggered, setting delayed caption timer');
    const timer = setTimeout(() => {
      console.log('Setting showDelayedCaption to true');
      setShowDelayedCaption(true);
    }, 1500); // Reduced delay to 1.5 seconds

    return () => {
      console.log('Cleaning up delayed caption timer');
      clearTimeout(timer);
    };
  }, []);

  console.log('AnimatedImageLogo render - showCaption:', showCaption, 'showDelayedCaption:', showDelayedCaption);

  const getSizeConfig = () => {
    switch (size) {
      case 'xs':
        return { 
          container: 'h-8', 
          text: 'text-lg', 
          caption: 'text-xs', 
          icon: 'w-3 h-3',
          padding: 'px-2 py-1'
        };
      case 'sm':
        return { 
          container: 'h-10', 
          text: 'text-xl', 
          caption: 'text-xs', 
          icon: 'w-4 h-4',
          padding: 'px-3 py-1'
        };
      case 'md':
        return { 
          container: 'h-14', 
          text: 'text-2xl', 
          caption: 'text-sm', 
          icon: 'w-5 h-5',
          padding: 'px-4 py-2'
        };
      case 'lg':
        return { 
          container: 'h-18', 
          text: 'text-3xl', 
          caption: 'text-base', 
          icon: 'w-6 h-6',
          padding: 'px-5 py-2'
        };
      case 'xl':
        return { 
          container: 'h-22', 
          text: 'text-4xl', 
          caption: 'text-lg', 
          icon: 'w-8 h-8',
          padding: 'px-6 py-3'
        };
      default:
        return { 
          container: 'h-14', 
          text: 'text-2xl', 
          caption: 'text-sm', 
          icon: 'w-5 h-5',
          padding: 'px-4 py-2'
        };
    }
  };

  const config = getSizeConfig();

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow container */}
      <div className="relative">
        {/* Animated background glow */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-red-500/20 via-white/10 to-red-500/20 rounded-xl blur-lg transition-all duration-700 ${
            isHovered ? 'animate-pulse scale-110' : 'animate-pulse'
          }`}
        />
        
        {/* Film strip background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeating-linear-gradient-film animate-film-roll"></div>
        </div>

        {/* Main logo container */}
        <div className={`relative ${config.container} ${config.padding} bg-gradient-to-br from-white/95 via-gray-100/90 to-white/95 backdrop-blur-sm rounded-xl border border-red-500/30 shadow-2xl overflow-hidden`}>
          
          {/* Animated film strip borders */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-white to-black animate-cinema-border"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-white to-red-500 animate-cinema-border-reverse"></div>
          
          {/* Content container */}
          <div className="relative z-10 flex items-center justify-center space-x-2">
            
            {/* Animated talez clapperboard icon with movie reel effect */}
            <div className={`relative ${isHovered ? 'animate-bounce' : 'animate-pulse'}`}>
              <img 
                src={talezClapboard}
                alt="Talez Clapboard"
                className={`${size==='xs' ? 'h-4' : size==='sm' ? 'h-5' : size==='md' ? 'h-6' : size==='lg' ? 'h-7' : 'h-8'} w-auto object-contain drop-shadow-lg shrink-0 ${isHovered ? 'animate-spin' : ''}`}
              />
              {isHovered && (
                <>
                  <div className="absolute -top-1 -right-1">
                    <Film className="w-3 h-3 text-red-500 animate-spin" />
                  </div>
                  <div className="absolute -bottom-1 -left-1">
                    <Video className="w-2 h-2 text-red-600 animate-pulse" />
                  </div>
                </>
              )}
            </div>

            {/* Main title with movie theater marquee effects */}
            <div className="relative">
              <h1 className={`${config.text} font-black text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-800 to-black drop-shadow-lg tracking-wide ${isHovered ? 'animate-pulse' : ''}`}>
                SHORT
              </h1>
              
              {/* Movie marquee light effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent -skew-x-12 ${
                  isHovered ? 'animate-bounce' : 'opacity-0'
                }`}
              />
              
              {/* Film strip perforation effects */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                 className={`absolute w-1 h-1 bg-red-500 rounded-full transition-all duration-300 ${
                   sparkleIndex === i ? 'animate-ping opacity-100' : 'opacity-50'
                 }`}
                  style={{
                    top: `${20 + i * 20}%`,
                    left: `${-10 + i * 5}%`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>

            <div className="relative">
              <h1 className={`${config.text} font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-black to-gray-800 drop-shadow-lg tracking-wide ${isHovered ? 'animate-pulse' : ''}`}>
                TALEZ
              </h1>
              
              {/* Camera flash animation */}
              {isHovered && (
                <div className="absolute -top-2 -right-2">
                  <Camera className="w-4 h-4 text-white animate-pulse" />
                </div>
              )}
            </div>

            {/* Play button with movie projector effect */}
            <div className={`relative transition-all duration-300 ${isHovered ? 'scale-125 animate-bounce' : 'animate-pulse'}`}>
              <div className="relative">
                <Play 
                  className={`${config.icon} text-red-600 drop-shadow-lg`}
                  fill="currentColor"
                />
                {isHovered && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping"></div>
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-2 h-2 text-yellow-400 animate-spin" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Moving light streaks */}
          {isHovered && (
            <>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-cinema-streak"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-cinema-streak-reverse"></div>
            </>
          )}

          {/* Corner decorations */}
          <div className="absolute top-1 left-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <div className="absolute bottom-1 left-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#001a33', animationDelay: '1s' }}></div>
          </div>
          <div className="absolute bottom-1 right-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>

        {/* Floating particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-white to-black rounded-full animate-cinema-float opacity-70"
                style={{
                  top: `${10 + Math.random() * 80}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Telugu caption with delayed cinematic styling */}
      {showCaption && (
        <div className={`text-center ${size === 'xs' || size === 'sm' ? 'mt-1' : 'mt-3'}`}>
          {/* Enhanced caption container with icons */}
          <div 
            className={`relative inline-flex items-center space-x-2 ${
              size === 'xs' || size === 'sm' 
                ? 'px-3 py-1 bg-gradient-to-r from-white/80 via-gray-100/90 to-white/80' 
                : `${config.padding} bg-gradient-to-r from-white/90 via-gray-50/95 to-white/90`
            } backdrop-blur-sm rounded-xl border border-blue-500/20 shadow-xl transition-all duration-1000 animate-[caption-ensemble-entry_2s_ease-out] hover:animate-[caption-ensemble-dance_1.5s_ease-in-out] hover:shadow-2xl hover:border-blue-500/40 ${
              showDelayedCaption 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-6 scale-95'
            }`}
          >
            {/* House icon before caption */}
            <div className={`relative animate-[caption-icon-slide-in_1s_ease-out] ${showDelayedCaption ? '' : 'translate-x-[-20px] opacity-0'}`} style={{ animationDelay: '1.8s' }}>
              <Home 
                className={`${size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-blue-500 animate-[caption-icon-glow_3s_ease-in-out_infinite] hover:text-white transition-colors duration-300 cursor-pointer`} 
              />
              {/* Icon glow effect */}
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
            </div>

            {/* Main Telugu text */}
            <div className="relative">
              <p className={`${config.caption} text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-800 to-black font-semibold tracking-wider transition-all duration-500 hover:scale-110 hover:tracking-widest cursor-pointer ${isHovered ? 'animate-pulse' : ''}`}>
                చిన్న కథలు
              </p>
              
              {/* Text glow underline */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-60"></div>
            </div>

            {/* Video button after caption */}
            <div className={`relative animate-[caption-icon-slide-in_1s_ease-out] ${showDelayedCaption ? '' : 'translate-x-[20px] opacity-0'}`} style={{ animationDelay: '2s' }}>
              <div className="relative group cursor-pointer">
                <Video 
                  className={`${size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-blue-600 animate-pulse hover:text-blue-800 transition-all duration-300 group-hover:scale-125`} 
                />
                {/* Video button effects */}
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-pulse opacity-0 group-hover:opacity-100"></div>
                <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse opacity-0 group-hover:opacity-100"></div>
              </div>
            </div>

            {/* Floating sparkles around the whole caption */}
            {showDelayedCaption && (
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {[...Array(4)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className={`absolute w-2 h-2 text-white animate-[caption-sparkle-float_${3 + i}s_ease-in-out_infinite] opacity-60`}
                    style={{
                      top: `${-10 + Math.random() * 120}%`,
                      left: `${-5 + Math.random() * 110}%`,
                      animationDelay: `${i * 0.8}s`
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Animated underline with enhanced effects */}
            {showDelayedCaption && (size !== 'xs' && size !== 'sm') && (
              <>
                <div className="absolute -top-1 left-2 animate-[caption-letter-dance_2s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}>
                  <Camera className="w-2 h-2 text-blue-500 animate-pulse" />
                </div>
                <div className="absolute -top-1 right-2 animate-[caption-letter-dance_2s_ease-in-out_infinite]" style={{ animationDelay: '0.7s' }}>
                  <Camera className="w-2 h-2 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
                
                {/* Enhanced animated underline */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-white via-black to-white transition-all duration-500 group-hover:w-full animate-[caption-shimmer_3s_linear_infinite] opacity-80"></div>
              </>
            )}
            
            {/* Simplified decoration for small sizes with animation */}
            {showDelayedCaption && (size === 'xs' || size === 'sm') && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-white via-black to-white transition-all duration-500 group-hover:w-full animate-[caption-shimmer_3s_linear_infinite] opacity-60"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};