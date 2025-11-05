import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Eye, Video, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useLanguage } from '@/contexts/LanguageContext';

interface SeriesCardProps {
  series: {
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
  };
}

export const SeriesCard: React.FC<SeriesCardProps> = memo(({ series }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const formatViews = (views: number) => {
    if (!views || views < 0) return '0';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const langMap: Record<string, string> = {
    te: 'తెలుగు',
    hi: 'హిందీ',
    en: 'ఇంగ్లీష్'
  };
  const languageLabel = langMap[series.language] || 'తెలుగు';
  const handleCardClick = () => {
    navigate(`/series/${series.id}`);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (series.creators?.id) {
      navigate(`/creator/${series.creators.id}`);
    }
  };

  return (
    <Card className="interactive-card group overflow-hidden bg-blue-900/50 backdrop-blur-sm border-border/50 cursor-pointer" onClick={handleCardClick}>
      <div className="relative aspect-[9/16] overflow-hidden">
        {/* Thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
        <OptimizedImage
          src={series.thumbnail_url || '/placeholder.svg'}
          alt={series.title}
          className="absolute inset-0 w-full h-full object-cover"
          width={400}
          height={600}
          quality={90}
          seriesTitle={series.title}
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary btn-glow flex items-center justify-center">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </div>
        </div>

        {/* Episode count badge */}
        <Badge className="absolute top-2 left-2 z-20 bg-black/80 text-white border-none text-xs">
          <Video className="w-3 h-3 mr-1" />
          {series.episode_count} {t('stats.episodes', 'videos')}
        </Badge>

        {/* Views badge */}
        <Badge className="absolute bottom-2 left-2 z-20 bg-black/80 text-white border-none text-xs">
          <Eye className="w-3 h-3 mr-1" />
          {formatViews(series.total_views)}
        </Badge>

        {/* All status badges at top right - flush with corner */}
        <div className="absolute top-0 right-0 z-30 flex flex-col gap-1.5 items-end max-w-[45%] p-2">
          {/* Status badges - NEW/HOT */}
          {Date.now() - new Date(series.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 ? (
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-none text-[11px] font-bold shadow-lg whitespace-nowrap">
              NEW
            </Badge>
          ) : series.total_views > 10000 ? (
            <Badge className="bg-red-500/90 text-white border-none text-[11px] font-bold whitespace-nowrap">
              HOT
            </Badge>
          ) : null}
          
          {/* Premium badge */}
          {series.is_premium && (
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black border border-amber-300/50 text-[11px] font-bold shadow-lg whitespace-nowrap">
              ⭐ PREMIUM
            </Badge>
          )}
          
          {/* Genre badge */}
          <Badge className="bg-primary/80 text-primary-foreground border-primary text-[11px] whitespace-nowrap">
            {series.genre}
          </Badge>
          
          {/* Source platform badge */}
          {series.source_platform && (
            <Badge className="bg-orange-500/80 text-white border-orange-400 text-[11px] whitespace-nowrap">
              {series.source_platform}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Creator info */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCreatorClick}>
          <Avatar className="w-8 h-8 ring-2 ring-primary/20">
            <AvatarImage src={series.creators?.profiles?.avatar_url} />
            <AvatarFallback>
              {series.creators?.profiles?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-foreground truncate">
                {series.creators?.profiles?.display_name || series.creators?.profiles?.username || 'Anonymous'}
              </p>
              {series.creators?.verified && (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(series.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Series title and description */}
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight break-words">
            {series.title.replace(/_/g, ' ') || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {series.description}
          </p>
        </div>

        {/* Language and follower count */}
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="text-xs">
            {languageLabel}
          </Badge>
            <div className="text-xs text-muted-foreground">
              {series.creators ? formatViews(series.creators.follower_count || 0) : '0'} {t('followers', 'common')}
            </div>
        </div>
      </CardContent>
    </Card>
  );
});