import React, { useState, useEffect } from 'react';
import { Play, Heart, Share2, Bookmark, Zap, Star, Flame, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FeatureItem {
  id: number;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  gradient: string;
  animation: string;
}

export const InteractiveFeatureShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const features: FeatureItem[] = [
    {
      id: 1,
      icon: Play,
      title: "Premium Streaming",
      description: "Watch unlimited episodes in HD quality with zero interruptions",
      gradient: "from-blue-500 to-purple-600",
      animation: "animate-bounce"
    },
    {
      id: 2,
      icon: Heart,
      title: "Smart Recommendations",
      description: "AI-powered suggestions based on your viewing preferences",
      gradient: "from-pink-500 to-red-600",
      animation: "animate-pulse"
    },
    {
      id: 3,
      icon: Share2,
      title: "Social Features",
      description: "Share, comment, and connect with fellow viewers",
      gradient: "from-green-500 to-teal-600",
      animation: "animate-swing"
    },
    {
      id: 4,
      icon: Bookmark,
      title: "Personal Library",
      description: "Save your favorite series and create custom watchlists",
      gradient: "from-orange-500 to-yellow-600",
      animation: "animate-tada"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70 backdrop-blur-md border-0 shadow-2xl">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Feature Display */}
            <div className="relative p-8 md:p-12 overflow-hidden">
              {/* Background Animation */}
              <div className={`absolute inset-0 bg-gradient-to-br ${features[activeFeature].gradient} opacity-10 transition-all duration-700`}></div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-float"></div>
              <div className="absolute bottom-8 left-4 w-12 h-12 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
              
              <div className="relative z-10">
                {/* Feature Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${features[activeFeature].gradient} text-white mb-6 ${features[activeFeature].animation} shadow-lg`}>
                  {React.createElement(features[activeFeature].icon, { className: "w-8 h-8" })}
                </div>
                
                {/* Feature Content */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {features[activeFeature].title}
                </h3>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {features[activeFeature].description}
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    className={`bg-gradient-to-r ${features[activeFeature].gradient} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ripple-effect`}
                  >
                    Try Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Feature Selector */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 md:p-8">
              <h4 className="text-lg font-semibold mb-6 text-center">Explore Features</h4>
              
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const isActive = index === activeFeature;
                  
                  return (
                    <button
                      key={feature.id}
                      onClick={() => {
                        setActiveFeature(index);
                        setIsAutoPlaying(false);
                      }}
                      className={`
                        w-full p-4 rounded-xl transition-all duration-300 text-left group
                        ${isActive 
                          ? `bg-gradient-to-r ${feature.gradient} text-white shadow-lg scale-105` 
                          : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 hover:scale-102'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : `bg-gradient-to-r ${feature.gradient} text-white group-hover:scale-110`
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{feature.title}</div>
                          <div className={`text-sm ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                            Click to explore
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Auto-play Control */}
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-xs"
                >
                  {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};