import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { OptimizedImage } from '@/components/OptimizedImage';

interface Series {
  id: string;
  title: string;
  thumbnail_url: string;
  genre: string;
}

interface FeaturedCarouselProps {
  items: Series[];
  title: string;
  mobileColumns?: 2 | 3;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ items, title, mobileColumns = 3 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();

  // Auto-play functionality for desktop only
  useEffect(() => {
    if (isAutoPlaying && items.length > 1 && window.innerWidth >= 768) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, items.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleItemClick = (item: Series) => {
    navigate(`/series/${item.id}`);
  };

  if (!items.length) return null;

  // Generate visible items for desktop carousel
  const getVisibleItems = () => {
    const visibleItems = [];
    const totalItems = items.length;
    
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + totalItems) % totalItems;
      visibleItems.push({
        item: items[index],
        position: i,
        index
      });
    }
    
    return visibleItems;
  };

  const visibleItems = getVisibleItems();

  return (
    <div className="space-y-4 mb-8">
      {/* Enhanced Title */}
      <div className="text-left pl-4">
          <h2 className="font-montserrat text-xl md:text-2xl font-semibold text-white relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-0.5 after:bg-gradient-to-r after:from-indigo-400 after:to-pink-500 after:rounded-full">
            {title}
          </h2>
      </div>
      
      {/* Mobile View - Dynamic Columns */}
      <div className="md:hidden px-1">
        <div className={`grid gap-5 ${mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {items.slice(0, mobileColumns).map((item, index) => (
            <div 
              key={`mobile-${item.id}`} 
              className="relative cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg">
                <OptimizedImage
                  src={item.thumbnail_url || '/placeholder.svg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  priority
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Trending badge for all items */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-white/20 flex items-center gap-1 animate-pulse">
                    <span className="text-yellow-300">🔥</span>
                    {t('trending', 'ui')}
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-1">
                  <h4 className="text-white font-bold text-xs leading-tight line-clamp-1">
                    {item.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View - Original Carousel */}
      <div className="hidden md:block">
        <div 
          className="relative h-80 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-blue-900/40 to-purple-900/40 backdrop-blur-sm border border-white/10 shadow-2xl"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Carousel Items */}
          <div className="flex items-center justify-center h-full relative">
            {visibleItems.map(({ item, position, index }) => {
              const isCurrent = position === 0;
              const isAdjacent = Math.abs(position) === 1;
              const isVisible = Math.abs(position) <= 2;

              if (!isVisible) return null;

              // Calculate transform and scale based on position for smoother transitions
              const getTransform = () => {
                const baseTranslate = position * 160;
                const scale = isCurrent ? 1 : isAdjacent ? 0.85 : 0.7;
                const zIndex = isCurrent ? 10 : isAdjacent ? 8 : 6;
                const opacity = isCurrent ? 1 : isAdjacent ? 0.9 : 0.7;
                
                return {
                  transform: `translateX(${baseTranslate}px) scale(${scale})`,
                  zIndex,
                  opacity
                };
              };

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="absolute transition-all duration-500 ease-out cursor-pointer group"
                  style={getTransform()}
                  onClick={() => handleItemClick(item)}
                >
                  <div className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl border transition-all duration-500 ${
                    isCurrent 
                      ? 'w-72 h-72 border-white/20 hover:border-white/40' 
                      : 'w-56 h-56 border-white/10 hover:border-white/30'
                  }`}>
                    <OptimizedImage
                      src={item.thumbnail_url || '/placeholder.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      loading="eager"
                      priority
                    />
                    
                    <div className={`absolute inset-0 transition-all duration-500 ${
                      isCurrent 
                        ? 'bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/60' 
                        : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/70'
                    }`} />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-background/20 backdrop-blur-sm rounded-full p-3 border border-border/30 shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-primary-foreground px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border border-border/20 animate-pulse">
                          🔥 {t('trending', 'ui')}
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className={`text-white font-bold leading-tight transition-all duration-300 ${
                        isCurrent ? 'text-lg' : 'text-sm'
                      } ${isCurrent ? 'drop-shadow-lg' : 'drop-shadow-md'}`}>
                        {item.title}
                      </h4>
                      {isCurrent && (
                        <p className="text-white/80 text-sm mt-1 line-clamp-1">
                          {item.genre}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};