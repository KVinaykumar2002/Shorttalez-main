import React, { useState, useEffect } from 'react';
import { Crown, Star, Sparkles, Award, Zap, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditorsPick {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  rating: number;
  badge: string;
  reason: string;
  gradient: string;
}

export const EditorsPicksCarousel: React.FC = () => {
  const [currentPick, setCurrentPick] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { t } = useLanguage();

  const editorsPicks: EditorsPick[] = [
    {
      id: 1,
      title: "I'm Not A Virgin",
      description: "A bold and refreshing take on modern relationships with stellar performances",
      thumbnail: "/src/assets/im-not-virgin-new-thumbnail.jpg",
      category: "Romance Drama",
      rating: 4.8,
      badge: "Editor's Choice",
      reason: "Outstanding storytelling and character development",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      id: 2,
      title: "Auto Johny S1",
      description: "An engaging series that perfectly captures the essence of everyday struggles",
      thumbnail: "/src/assets/auto-johny-s2-thumbnail.png",
      category: "Comedy Drama",
      rating: 4.6,
      badge: "Most Loved",
      reason: "Exceptional viewer engagement and reviews",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      id: 3,
      title: "Trio Short Series",
      description: "A captivating trio of stories that showcase diverse narrative styles",
      thumbnail: "/src/assets/trio-series-thumbnail.jpg",
      category: "Anthology",
      rating: 4.7,
      badge: "Hidden Gem",
      reason: "Innovative storytelling and unique perspectives",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentPick((prev) => (prev + 1) % editorsPicks.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentItem = editorsPicks[currentPick];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-full px-6 py-3 border border-amber-200/30 dark:border-amber-700/30 mb-4">
          <Crown className="w-6 h-6 text-amber-600 animate-pulse" />
          <span className="font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {t('sections.editors_picks', 'homepage')}
          </span>
        </div>
        <p className="text-muted-foreground">{t('editors_picks.subtitle', 'homepage')}</p>
      </div>

      {/* Main Carousel */}
      <Card className="overflow-hidden bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70 backdrop-blur-md border-0 shadow-2xl">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-3 gap-0">
            {/* Image Section */}
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${currentItem.gradient} opacity-20 z-10`}></div>
              <OptimizedImage
                src={currentItem.thumbnail}
                alt={currentItem.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
              
              {/* Overlay Badge */}
              <div className="absolute top-4 left-4 z-20">
                <Badge className={`bg-gradient-to-r ${currentItem.gradient} text-white shadow-lg animate-pulse`}>
                  <Award className="w-3 h-3 mr-1" />
                  {currentItem.badge}
                </Badge>
              </div>
              
              {/* Rating */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium text-sm">{currentItem.rating}</span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="md:col-span-2 p-8 md:p-12 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-green-400/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                {/* Category */}
                <Badge variant="outline" className="mb-4 border-purple-200 text-purple-600">
                  {currentItem.category}
                </Badge>
                
                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {currentItem.title}
                </h3>
                
                {/* Description */}
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {currentItem.description}
                </p>
                
                {/* Editor's Reason */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 mb-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">{t('editors_picks.why_picked', 'homepage')}</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">{currentItem.reason}</div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-4">
                  <Button className={`bg-gradient-to-r ${currentItem.gradient} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ripple-effect`}>
                    <Zap className="w-4 h-4 mr-2" />
                    {t('actions.watch_now', 'common')}
                  </Button>
                  <Button variant="outline" className="hover:scale-105 transition-all duration-300">
                    {t('actions.add_to_watchlist', 'common')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {editorsPicks.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentPick(index);
              setIsAutoPlaying(false);
            }}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index === currentPick 
                ? `bg-gradient-to-r ${currentItem.gradient} scale-125 shadow-lg` 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }
            `}
          />
        ))}
      </div>

      {/* Auto-play Control */}
      <div className="text-center mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <Calendar className="w-3 h-3 mr-1" />
          {isAutoPlaying ? t('editors_picks.pause_auto', 'homepage') : t('editors_picks.resume_auto', 'homepage')}
        </Button>
      </div>
    </div>
  );
};