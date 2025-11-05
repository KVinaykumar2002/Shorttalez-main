import React, { useState, memo } from 'react';
import { Eye, Calendar, Sparkles, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/OptimizedImage';
import { MovieClapboard } from '@/components/MovieClapboard';
import { Link } from 'react-router-dom';

interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  genre: string;
  language: string;
  episode_count: number;
  total_views: number;
  status: string;
  created_at: string;
  source_platform?: string;
  is_premium?: boolean;
  creators: {
    id: string;
    user_id: string;
    bio: string;
    verified: boolean;
    follower_count: number;
    profiles?: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

interface OptimizedSeriesCardProps {
  series: Series;
  showHoverEffects?: boolean;
}

export const OptimizedSeriesCard = memo<OptimizedSeriesCardProps>(({ 
  series, 
  showHoverEffects = true 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const formatViews = (views: number): string => {
    if (!views || views < 0) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const thumbnailUrl = series.thumbnail_url || '/placeholder.svg';
  const creatorName = series.creators?.profiles?.display_name || 
                     series.creators?.profiles?.username || 
                     'Unknown Creator';

  return (
    <Link 
      to={`/series/${series.id}`}
      className="block group"
    >
      <Card className={`overflow-hidden bg-blue-900/50 backdrop-blur-sm border-0 shadow-sm transition-all duration-200 ${showHoverEffects ? 'hover:shadow-lg hover:scale-[1.02]' : ''}`}>
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            {!imageError ? (
              <OptimizedImage
                src={thumbnailUrl}
                alt={series.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
                seriesTitle={series.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                <Play className="w-12 h-12 text-purple-500 opacity-60" />
              </div>
            )}
            
            {/* Episode count badge */}
            <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-10">
              {series.episode_count} ఎపిసోడ్‌లు
            </div>
            
            {/* All status badges at top right corner - flush with corner */}
            <div className="absolute top-0 right-0 z-30 flex flex-col gap-1 items-end max-w-[45%] p-2">
              {/* Status badges - NEW/HOT */}
              {Date.now() - new Date(series.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 ? (
                <Badge className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white border-none text-[11px] font-bold px-2 py-0.5 shadow-lg animate-pulse whitespace-nowrap">
                  NEW
                </Badge>
              ) : series.total_views > 10000 ? (
                <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-none text-[11px] font-bold px-2 py-0.5 shadow-md whitespace-nowrap">
                  HOT
                </Badge>
              ) : null}
              
              {/* Premium badge */}
              {series.is_premium && (
                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black border border-amber-300/50 text-[11px] font-bold px-2 py-0.5 shadow-lg whitespace-nowrap">
                  ⭐ PREMIUM
                </Badge>
              )}
              
              {/* Genre badge */}
              <Badge variant="secondary" className="text-[11px] px-2 py-0.5 whitespace-nowrap">
                {series.genre}
              </Badge>
              
              {/* Source platform badge */}
              {series.source_platform && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 whitespace-nowrap">
                  {series.source_platform}
                </Badge>
              )}
              
              {/* Verified badge */}
              {series.creators?.verified && (
                <div className="bg-blue-500 text-white p-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Play overlay with movie clapboard */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              {/* Regular play button (hidden on hover) */}
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </div>
              
              {/* Movie clapboard (shown on hover) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <MovieClapboard 
                  className="transform scale-150" 
                  animate={true}
                />
              </div>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100 leading-tight break-words">
              {series.title.replace(/_/g, ' ') || 'Untitled'}
            </h3>
            
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {series.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatViews(series.total_views || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(series.created_at)}</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground truncate">
              {creatorName}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

OptimizedSeriesCard.displayName = 'OptimizedSeriesCard';