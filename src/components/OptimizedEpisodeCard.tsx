import React, { useState, memo, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Clock, Play, Repeat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Link, useNavigate } from 'react-router-dom';
import { EpisodeShareModal } from '@/components/EpisodeShareModal';
import { CommentModal } from '@/components/CommentModal';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedPlayButton } from '@/components/AnimatedPlayButton';
import { useComments } from '@/hooks/useComments';
import { useLikeStatus } from '@/hooks/useLikeStatus';

interface Episode {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  comments_count: number;
  duration: number;
  created_at: string;
  series: {
    id: string;
    title: string;
    genre: string;
    creators: {
      id: string;
      verified: boolean;
      profiles: {
        username: string;
        display_name: string;
        avatar_url: string;
      };
    };
  };
}

interface OptimizedEpisodeCardProps {
  episode: Episode;
  showHoverEffects?: boolean;
}

export const OptimizedEpisodeCard = memo<OptimizedEpisodeCardProps>(({ 
  episode, 
  showHoverEffects = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(episode.comments_count || 0);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use real-time hooks for likes and comments
  const { isLiked, likesCount, toggleLike, isLoading: isLikeLoading } = useLikeStatus(episode.id, 'episode');
  
  const { commentsCount } = useComments({
    contentId: episode.id,
    contentType: 'episode',
    initialCount: episode.comments_count || 0
  });

  // Sync local state with hook
  useEffect(() => {
    setLocalCommentsCount(commentsCount);
  }, [commentsCount]);
  
  const formatDuration = (seconds: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const thumbnailUrl = episode.thumbnail_url || '/placeholder.svg';

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowShareModal(true);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowCommentModal(true);
  };

  const handleEpisodeClick = () => {
    if (!episode.series?.id) {
      console.warn('Episode has no series associated:', episode.id);
      return;
    }
    navigate(`/series/${episode.series.id}?episode=${episode.id}`);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    await toggleLike();
    // Removed notification spam - visual feedback only
  };

  return (
    <>
      <Card 
        className={`overflow-hidden bg-blue-900/50 backdrop-blur-sm border-0 shadow-sm cursor-pointer video-hover-effect
          transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-2 hover:rotate-1
          group animate-fade-in ripple-effect ${showHoverEffects ? 'hover-lift' : ''}
        `}
        onClick={handleEpisodeClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            {!imageError ? (
              <>
                <OptimizedImage
                  src={thumbnailUrl}
                  alt={episode.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
                
                {/* Animated Play Button */}
                {showHoverEffects && (
                  <AnimatedPlayButton
                    isVisible={isHovered}
                    size="md"
                    variant="float"
                    showSoundWave={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEpisodeClick();
                    }}
                  />
                )}

                {/* Gradient overlay */}
                <div className={`absolute inset-0 z-15 transition-opacity duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                } bg-gradient-to-br from-primary/20 via-transparent to-accent/20`} />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                <Play className="w-8 h-8 text-purple-500 opacity-60" />
              </div>
            )}
            
            {/* Duration badge */}
            {episode.duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(episode.duration)}
              </div>
            )}
          </div>
            
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              {episode.title}
            </h3>
            
            {episode.series && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {episode.series.genre}
                </Badge>
                {episode.series.creators?.verified && (
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViews(episode.views || 0)}</span>
                </div>
                <button
                  onClick={handleLikeClick}
                  disabled={isLikeLoading}
                  className={`flex items-center gap-1 hover:text-primary transition-colors ${
                    isLiked ? 'text-primary' : ''
                  }`}
                >
                  <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{formatViews(likesCount)}</span>
                </button>
                <button
                  onClick={handleCommentClick}
                  className="flex items-center gap-1 hover:text-accent transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatViews(localCommentsCount)}</span>
                </button>
              </div>
              
              {/* Share Button */}
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-primaryVariant/10 hover:bg-primaryVariant/20 text-primaryVariant transition-colors duration-200"
              >
                <Repeat className="w-3 h-3" />
                <span className="text-xs font-medium">షేర్ చేయండి</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EpisodeShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        episode={episode}
        onShared={() => {
          // Could trigger a refresh of the parent component if needed
        }}
      />

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        contentId={episode.id}
        contentType="episode"
        contentTitle={episode.title}
        commentsCount={localCommentsCount}
        onCommentsUpdate={(count) => setLocalCommentsCount(count)}
      />
    </>
  );
});

OptimizedEpisodeCard.displayName = 'OptimizedEpisodeCard';