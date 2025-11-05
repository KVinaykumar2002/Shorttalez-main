import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Heart, MessageCircle, Users, Calendar, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  color: string;
  gradient: string;
  suffix?: string;
}

interface InteractiveStatsCardProps {
  className?: string;
  stats?: {
    totalViews?: number;
    totalLikes?: number;
    totalComments?: number;
    totalUsers?: number;
    totalSeries?: number;
    totalEpisodes?: number;
  };
}

export const InteractiveStatsCard: React.FC<InteractiveStatsCardProps> = ({
  className = "",
  stats = {}
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  const formatNumber = (num: number) => {
    if (num >= 1000000) return { value: num / 1000000, suffix: 'M' };
    if (num >= 1000) return { value: num / 1000, suffix: 'K' };
    return { value: num, suffix: '' };
  };

  const statItems: StatItem[] = [
    {
      icon: Eye,
      label: 'Total Views',
      value: stats.totalViews || 0,
      color: 'text-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Heart,
      label: 'Likes',
      value: stats.totalLikes || 0,
      color: 'text-red-500',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      icon: MessageCircle,
      label: 'Comments',
      value: stats.totalComments || 0,
      color: 'text-green-500',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      label: 'Users',
      value: stats.totalUsers || 0,
      color: 'text-purple-500',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      icon: TrendingUp,
      label: 'Series',
      value: stats.totalSeries || 0,
      color: 'text-orange-500',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Award,
      label: 'Episodes',
      value: stats.totalEpisodes || 0,
      color: 'text-yellow-500',
      gradient: 'from-yellow-500 to-orange-600'
    }
  ];

  // Animate numbers on mount
  useEffect(() => {
    const animateNumbers = () => {
      statItems.forEach((item, index) => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = item.value / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= item.value) {
            current = item.value;
            clearInterval(timer);
          }
          
          setAnimatedValues(prev => ({
            ...prev,
            [item.label]: current
          }));
        }, duration / steps);
      });
    };

    const timeout = setTimeout(animateNumbers, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const animatedValue = animatedValues[item.label] || 0;
          const formattedNumber = formatNumber(animatedValue);
          const isHovered = hoveredIndex === index;
          
          return (
            <Card
              key={item.label}
              className={`
                group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl
                bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60
                backdrop-blur-sm border-0 shadow-lg cursor-pointer
                ${isHovered ? 'animate-tada' : ''}
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CardContent className="p-6 relative">
                {/* Background Gradient Animation */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 
                  transition-opacity duration-500
                `}></div>
                
                {/* Floating Icon */}
                <div className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full mb-4
                  bg-gradient-to-br ${item.gradient} text-white
                  transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12
                  ${isHovered ? 'animate-bounce' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Animated Counter */}
                <div className="relative z-10">
                  <div className={`
                    text-2xl md:text-3xl font-bold mb-1 transition-all duration-300
                    bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent
                    ${isHovered ? 'animate-pulse' : ''}
                  `}>
                    {formattedNumber.value.toFixed(formattedNumber.suffix ? 1 : 0)}{formattedNumber.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {item.label}
                  </div>
                </div>
                
                {/* Hover Effect Particles */}
                {isHovered && (
                  <>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/2 right-4 w-1 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  </>
                )}
                
                {/* Progress Bar Animation */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};