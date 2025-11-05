import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Play, Eye, Clock, Repeat, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/OptimizedImage';
import { AuthGuard } from '@/components/AuthGuard';
import { CommentModal } from '@/components/CommentModal';
import { AnimatedPlayButton } from '@/components/AnimatedPlayButton';
import { useLikeStatus } from '@/hooks/useLikeStatus';
import { useComments } from '@/hooks/useComments';

interface EpisodeCardProps {
  episode: {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
    views: number;
    likes: number;
    comments_count: number;
    created_at: string;
      series: {
        id: string;
        title: string;
        genre?: string;
        source_platform?: string;
        is_premium?: boolean;
        creators: {
          id: string;
          user_id: string;
          bio: string;
          follower_count: number;
          profiles: {
            username: string;
            display_name: string;
            avatar_url: string;
          } | null;
        };
      };
  };
}

export const EpisodeCard: React.FC<EpisodeCardProps> = memo(({ episode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use real-time hooks for likes and comments
  const { isLiked, likesCount, toggleLike, isLoading: isLikeLoading } = useLikeStatus(episode.id, 'episode');
  
  const { commentsCount } = useComments({
    contentId: episode.id,
    contentType: 'episode',
    initialCount: episode.comments_count || 0
  });

  // Close share options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareOptions) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showShareOptions]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    const success = await toggleLike();
    // Removed notification spam - only show confetti animation  
    if (success && !isLiked) {
      const button = e.currentTarget;
      button.classList.add('animate-confetti');
      setTimeout(() => button.classList.remove('animate-confetti'), 800);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareOptions(!showShareOptions);
  };

  const handleExternalShare = async () => {
    if (!episode.series?.id) {
      toast({
        title: "Cannot share",
        description: "Episode has no series associated",
        variant: "destructive"
      });
      return;
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: episode.title,
          text: episode.description,
          url: `${window.location.origin}/series/${episode.series.id}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/series/${episode.series.id}`);
      toast({
        title: "Link copied!",
        description: "Episode link copied to clipboard",
      });
    }
    setShowShareOptions(false);
  };

  const handleInAppReshare = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          post_type: 'reshare',
          reshared_episode_id: episode.id,
          content: `Check out this amazing episode: ${episode.title}`
        });

      // Also add to interactions for tracking
      await supabase
        .from('interactions')
        .insert({
          user_id: user.id,
          target_type: 'episode',
          target_id: episode.id,
          interaction_type: 'reshare'
        });

      toast({
        title: "Reshared!",
        description: "Episode shared to your profile",
      });
    } catch (error) {
      console.warn('Error resharing:', error);
      toast({
        title: "Error",
        description: "Failed to reshare. Please try again.",
        variant: "destructive",
      });
    }
    setShowShareOptions(false);
  };

  const handleCardClick = () => {
    if (!episode.series?.id) {
      console.warn('Episode has no series associated:', episode.id);
      return;
    }
    navigate(`/series/${episode.series.id}?episode=${episode.id}`);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!episode.series?.creators?.id) {
      console.warn('Episode has no creator associated:', episode.id);
      return;
    }
    navigate(`/creator/${episode.series.creators.id}`);
  };

  return (
    <Card 
      className="interactive-card group overflow-hidden bg-blue-900/50 backdrop-blur-sm border-border/50 video-hover-effect cursor-pointer hover-lift animate-fade-in" 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative video-container aspect-video overflow-hidden">
        {/* Thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
        <OptimizedImage
          src={episode.thumbnail_url || '/placeholder.svg'}
          alt={episode.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          width={400}
          height={600}
          quality={90}
        />
        
        {/* Animated Play Button */}
        <AnimatedPlayButton
          isVisible={isHovered}
          size="lg"
          variant="float"
          showSoundWave={true}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        />

        {/* Hover overlay with gradient animation */}
        <div className={`absolute inset-0 z-15 transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 bg-[length:200%_100%] animate-[gradient-wave_3s_ease_infinite]`} />

        {/* Duration badge */}
        <Badge className="absolute top-3 right-3 z-20 bg-black/80 text-white border-none">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(episode.duration)}
        </Badge>

        {/* Views badge */}
        <Badge className="absolute top-3 left-3 z-20 bg-black/80 text-white border-none">
          <Eye className="w-3 h-3 mr-1" />
          {formatViews(episode.views)}
        </Badge>

        {/* Status badges - NEW/HOT - Moved to top right */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 items-end">
          {Date.now() - new Date(episode.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 ? (
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-none text-xs font-bold shadow-lg">
              NEW
            </Badge>
          ) : episode.views > 10000 ? (
            <Badge className="bg-red-500/90 text-white border-none text-xs font-bold">
              HOT
            </Badge>
          ) : null}
        </div>

        {/* Premium badge - positioned above other content */}
        {episode.series.is_premium && (
          <Badge className="absolute bottom-12 right-3 z-20 bg-gradient-to-r from-amber-400 to-yellow-500 text-black border border-amber-300/50 text-xs font-bold shadow-lg backdrop-blur-sm">
            ⭐ PREMIUM
          </Badge>
        )}

        {/* Source platform badge */}
        {episode.series.source_platform && (
          <Badge className="absolute bottom-3 left-3 z-20 bg-orange-500/80 text-white border-orange-400">
            {episode.series.source_platform}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Creator info */}
        <div className="flex items-center gap-3" onClick={handleCreatorClick}>
          <Avatar className="w-8 h-8 ring-2 ring-primary/20">
            <AvatarImage src={episode.series.creators.profiles?.avatar_url} />
            <AvatarFallback>
              {episode.series.creators.profiles?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {episode.series.creators.profiles?.display_name || episode.series.creators.profiles?.username || 'Unknown Creator'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(episode.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Episode title and description */}
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
            {episode.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {episode.description}
          </p>
        </div>

        {/* Series info */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {episode.series.title}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 hover:bg-primary/10 hover:text-primary ${isLiked ? 'text-primary' : ''}`}
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{formatViews(likesCount)}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 hover:bg-accent/10 hover:text-accent"
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  navigate('/auth');
                  return;
                }
                setShowCommentModal(true);
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{formatViews(commentsCount)}</span>
            </Button>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 hover:bg-primaryVariant/10 hover:text-primaryVariant"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {/* Share Options Dropdown */}
            {showShareOptions && (
              <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                <AuthGuard
                  fallback={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2 text-left"
                      onClick={() => navigate('/auth')}
                    >
                      <Repeat className="w-4 h-4" />
                      Sign in to reshare
                    </Button>
                  }
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-2 text-left hover:bg-primary/10"
                    onClick={handleInAppReshare}
                  >
                    <Repeat className="w-4 h-4" />
                    Reshare to profile
                  </Button>
                </AuthGuard>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start gap-2 text-left hover:bg-primary/10"
                  onClick={handleExternalShare}
                >
                  <ExternalLink className="w-4 h-4" />
                  Share externally
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        contentId={episode.id}
        contentType="episode"
        contentTitle={episode.title}
        commentsCount={commentsCount}
        onCommentsUpdate={() => {}} // Comments will update automatically via real-time hook
      />
    </Card>
  );
});