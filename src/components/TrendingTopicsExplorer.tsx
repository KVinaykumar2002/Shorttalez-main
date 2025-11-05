import React, { useState } from 'react';
import { Flame, Heart, TrendingUp, Star, Zap, Crown, Calendar, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TrendingTopic {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
  count: number;
  growth: string;
  color: string;
  gradient: string;
  description: string;
}

export const TrendingTopicsExplorer: React.FC = () => {
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'genres' | 'trending' | 'popular'>('trending');

  const trendingTopics: Record<string, TrendingTopic[]> = {
    trending: [
      {
        id: 1,
        name: "Romance Drama",
        icon: Heart,
        count: 245,
        growth: "+15%",
        color: "text-pink-500",
        gradient: "from-pink-500 to-rose-600",
        description: "Heartwarming love stories"
      },
      {
        id: 2,
        name: "Comedy Series",
        icon: Zap,
        count: 189,
        growth: "+23%",
        color: "text-yellow-500",
        gradient: "from-yellow-500 to-orange-600",
        description: "Laugh-out-loud moments"
      },
      {
        id: 3,
        name: "Thriller",
        icon: Flame,
        count: 156,
        growth: "+18%",
        color: "text-red-500",
        gradient: "from-red-500 to-purple-600",
        description: "Edge-of-seat suspense"
      },
      {
        id: 4,
        name: "Family Drama",
        icon: Users,
        count: 132,
        growth: "+12%",
        color: "text-blue-500",
        gradient: "from-blue-500 to-teal-600",
        description: "Stories that bind hearts"
      }
    ],
    genres: [
      {
        id: 5,
        name: "Sci-Fi",
        icon: Star,
        count: 98,
        growth: "+25%",
        color: "text-purple-500",
        gradient: "from-purple-500 to-indigo-600",
        description: "Future possibilities"
      },
      {
        id: 6,
        name: "Horror",
        icon: Flame,
        count: 87,
        growth: "+19%",
        color: "text-gray-700",
        gradient: "from-gray-700 to-black",
        description: "Spine-chilling tales"
      },
      {
        id: 7,
        name: "Action",
        icon: Zap,
        count: 156,
        growth: "+22%",
        color: "text-orange-500",
        gradient: "from-orange-500 to-red-600",
        description: "High-octane adventures"
      },
      {
        id: 8,
        name: "Mystery",
        icon: TrendingUp,
        count: 143,
        growth: "+16%",
        color: "text-green-500",
        gradient: "from-green-500 to-emerald-600",
        description: "Unravel the unknown"
      }
    ],
    popular: [
      {
        id: 9,
        name: "Most Watched",
        icon: Crown,
        count: 1250,
        growth: "+8%",
        color: "text-gold-500",
        gradient: "from-yellow-400 to-orange-500",
        description: "Viewer favorites"
      },
      {
        id: 10,
        name: "Most Liked",
        icon: Heart,
        count: 892,
        growth: "+14%",
        color: "text-pink-500",
        gradient: "from-pink-500 to-red-500",
        description: "Community approved"
      },
      {
        id: 11,
        name: "Newest",
        icon: Calendar,
        count: 67,
        growth: "+45%",
        color: "text-blue-500",
        gradient: "from-blue-500 to-purple-600",
        description: "Fresh content daily"
      },
      {
        id: 12,
        name: "Rising Stars",
        icon: TrendingUp,
        count: 234,
        growth: "+38%",
        color: "text-green-500",
        gradient: "from-green-500 to-teal-600",
        description: "Tomorrow's hits"
      }
    ]
  };

  const categories = [
    { key: 'trending', label: 'Trending Now', icon: Flame },
    { key: 'genres', label: 'By Genre', icon: Star },
    { key: 'popular', label: 'Most Popular', icon: Crown }
  ];

  return (
    <div className="w-full">
      {/* Category Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-2 border border-white/30 dark:border-gray-700/30 shadow-lg">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.key;
            
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as any)}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trendingTopics[selectedCategory].map((topic, index) => {
          const Icon = topic.icon;
          const isHovered = hoveredTopic === topic.id;
          
          return (
            <Card
              key={topic.id}
              className={`
                group cursor-pointer transition-all duration-500 hover:scale-105 hover:rotate-1
                bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70
                backdrop-blur-md border-0 shadow-lg hover:shadow-2xl
                ${isHovered ? 'animate-tada' : ''}
              `}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => setHoveredTopic(null)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 relative overflow-hidden">
                {/* Background Gradient Animation */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-10 
                  transition-opacity duration-500
                `}></div>
                
                {/* Floating Particles on Hover */}
                {isHovered && (
                  <>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  </>
                )}
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center w-12 h-12 rounded-full mb-4
                    bg-gradient-to-r ${topic.gradient} text-white shadow-lg
                    transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12
                    ${isHovered ? 'animate-bounce' : ''}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Topic Name */}
                  <h3 className="font-bold mb-2 text-sm md:text-base">{topic.name}</h3>
                  
                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {topic.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-white/50 dark:bg-gray-700/50"
                    >
                      {topic.count} series
                    </Badge>
                    <Badge 
                      className={`text-xs bg-gradient-to-r ${topic.gradient} text-white`}
                    >
                      {topic.growth}
                    </Badge>
                  </div>
                </div>
                
                {/* Bottom Glow Effect */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${topic.gradient}
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center
                `}></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};