import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWatchProgress, ContinueWatchingEpisode } from '@/hooks/useWatchProgress';
import { OptimizedImage } from '@/components/OptimizedImage';

interface ContinueWatchingCarouselProps {
  episodes: ContinueWatchingEpisode[];
  onRemove: (episodeId: string) => void;
}

export const ContinueWatchingCarousel: React.FC<ContinueWatchingCarouselProps> = ({
  episodes,
  onRemove
}) => {
  const navigate = useNavigate();

  const formatProgress = (progressSeconds: number, durationSeconds: number) => {
    const percentage = Math.round((progressSeconds / durationSeconds) * 100);
    return Math.min(percentage, 95); // Cap at 95% to show it's not complete
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (episodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-cinzel font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
        Continue Watching
        <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-transparent mt-1"></div>
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {episodes.map((episode) => (
          <Card 
            key={episode.id} 
            className="flex-shrink-0 w-64 bg-card/90 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
            onClick={() => navigate(`/series/${episode.series_id}`)}
          >
            <CardContent className="p-0 relative">
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <OptimizedImage
                  src={episode.thumbnail_url || '/placeholder.svg'}
                  alt={episode.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Progress bar overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div 
                    className="h-full bg-primary"
                    style={{ 
                      width: `${formatProgress(episode.progress_seconds, episode.duration_seconds)}%` 
                    }}
                  />
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <div className="bg-primary/90 rounded-full p-3">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 hover:bg-black/70 p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(episode.id);
                  }}
                >
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>

              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                  {episode.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {episode.series_title} • Episode {episode.episode_number}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTime(episode.progress_seconds)} / {formatTime(episode.duration_seconds)}</span>
                  <span>{formatProgress(episode.progress_seconds, episode.duration_seconds)}% watched</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};