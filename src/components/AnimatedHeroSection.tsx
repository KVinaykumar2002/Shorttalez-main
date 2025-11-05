import React, { useState, useEffect } from 'react';
import { Play, Sparkles, TrendingUp, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedImageLogo } from '@/components/AnimatedImageLogo';
import { Link } from 'react-router-dom';
interface AnimatedHeroSectionProps {
  totalSeries?: number;
  totalEpisodes?: number;
  totalViews?: number;
}
export const AnimatedHeroSection: React.FC<AnimatedHeroSectionProps> = ({
  totalSeries = 0,
  totalEpisodes = 0,
  totalViews = 0
}) => {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroTexts = ["Discover Amazing Stories", "Watch Premium Content", "Join Our Community", "Experience Cinema"];
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % heroTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  return (
    <div className="relative overflow-hidden bg-gradient-hero dark:bg-gradient-hero rounded-3xl border border-primary/20 backdrop-blur-xl mb-8">
      <div className="relative z-10 p-8 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-primary animate-golden-shimmer">
            {heroTexts[currentText]}
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in">
            Premium Telugu content at your fingertips
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 touch-card border border-primary/20">
              <Play className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">{formatNumber(totalEpisodes)} Episodes</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/10 backdrop-blur-sm rounded-full px-4 py-2 touch-card border border-secondary/20">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-secondary">{formatNumber(totalViews)} Views</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/10 backdrop-blur-sm rounded-full px-4 py-2 touch-card border border-accent/20">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-semibold text-accent">{formatNumber(totalSeries)} Series</span>
            </div>
          </div>
          
          <Link to="/videos">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:bg-gradient-secondary text-primary-foreground px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 touch-button hover-lift btn-glow"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Watching
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float" />
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-secondary/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-accent/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};