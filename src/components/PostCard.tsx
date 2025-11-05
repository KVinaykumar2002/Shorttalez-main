import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Repeat, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EpisodeCard } from '@/components/EpisodeCard';
import { useLikeStatus } from '@/hooks/useLikeStatus';
import { useComments } from '@/hooks/useComments';
import { CommentModal } from '@/components/CommentModal';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    media_url?: string;
    media_type?: string;
    post_type: string;
    likes_count: number;
    comments_count: number;
    reshares_count: number;
    created_at: string;
    profiles: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
    reshared_episode?: {
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
        creators: {
          id: string;
          user_id: string;
          bio: string;
          follower_count: number;
          profiles: {
            username: string;
            display_name: string;
            avatar_url: string;
          };
        };
      };
    };
    reshared_post?: {
      id: string;
      content: string;
      created_at: string;
      profiles: {
        username: string;
        display_name: string;
        avatar_url: string;
      };
    };
  };
  onUpdate?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  
  // Use real-time like hook
  const { isLiked, likesCount, toggleLike, isLoading: isLikeLoading } = useLikeStatus(post.id, 'post');

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    const success = await toggleLike();
    if (success && !isLiked) {
      const button = e.currentTarget;
      button.classList.add('animate-confetti');
      setTimeout(() => button.classList.remove('animate-confetti'), 800);
    }
  };

  const handleReshare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
          reshared_post_id: post.id,
          content: `Reshared from @${post.profiles.username}`
        });

      await supabase
        .from('interactions')
        .insert({
          user_id: user.id,
          target_type: 'post',
          target_id: post.id,
          interaction_type: 'reshare'
        });

      toast({
        title: "Reshared!",
        description: "Post reshared to your profile",
      });

      onUpdate?.();
    } catch (error) {
      console.warn('Error resharing:', error);
      toast({
        title: "Error",
        description: "Failed to reshare. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <>
      <Card className="mb-4 hover:bg-muted/30 transition-all duration-300 cursor-pointer group border-l-4 border-l-primary/20 hover:border-l-primary/50">
        <CardContent className="p-5">
          {/* Reshare indicator */}
          {post.post_type === 'reshare' && post.profiles && (
            <div className="flex items-center gap-2 mb-4 text-sm text-primary/80 bg-primary/10 px-3 py-2 rounded-full w-fit">
              <Repeat className="w-4 h-4" />
              <span className="font-medium">@{post.profiles.username || 'User'} reshared</span>
            </div>
          )}

          {/* Post header */}
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-bold">
                {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg truncate hover:underline cursor-pointer">
                  {post.profiles?.display_name || post.profiles?.username || 'Unknown User'}
                </span>
                <span className="text-muted-foreground font-medium">@{post.profiles?.username || 'unknown'}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-sm bg-muted/50 px-2 py-1 rounded-full">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Post content */}
          {post.content && (
            <div className="mb-4">
              <p className="text-foreground whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
            </div>
          )}

          {/* Media content */}
          {post.media_url && post.media_type === 'image' && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img 
                src={post.media_url} 
                alt="Post content"
                className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(post.media_url, '_blank');
                }}
              />
            </div>
          )}

          {/* Reshared episode */}
          {post.reshared_episode && (
            <div className="mb-4 rounded-xl overflow-hidden border border-border/50">
              <EpisodeCard episode={post.reshared_episode} />
            </div>
          )}

          {/* Reshared post */}
          {post.reshared_post && (
            <Card className="mb-4 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <Avatar className="w-8 h-8 ring-1 ring-primary/30">
                    <AvatarImage src={post.reshared_post.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs bg-gradient-to-r from-secondary to-primary text-white">
                      {post.reshared_post.profiles?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{post.reshared_post.profiles?.display_name}</span>
                  <span className="text-muted-foreground">@{post.reshared_post.profiles?.username}</span>
                </div>
                <p className="text-foreground">{post.reshared_post.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-start gap-2 pt-4 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 h-10 px-4 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200 group/btn"
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  navigate('/auth');
                  return;
                }
                setShowCommentModal(true);
              }}
            >
              <MessageCircle className="w-5 h-5 group-hover/btn:animate-pulse" />
              <span className="font-medium">{formatCount(commentsCount)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 h-10 px-4 py-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-200 group/btn"
              onClick={handleReshare}
            >
              <Repeat className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-300" />
              <span className="font-medium">{formatCount(post.reshares_count)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 h-10 px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200 group/btn ${
                isLiked ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : ''
              }`}
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              <Heart className={`w-5 h-5 transition-all duration-200 ${
                isLiked 
                  ? 'fill-current animate-bounce' 
                  : 'group-hover/btn:scale-110'
              }`} />
              <span className="font-medium">{formatCount(likesCount)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 h-10 px-4 py-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-all duration-200 group/btn"
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: `Post by ${post.profiles?.display_name || 'User'}`,
                    text: post.content,
                    url: window.location.origin + `/feed?post=${post.id}`
                  });
                } else {
                  navigator.clipboard.writeText(window.location.origin + `/feed?post=${post.id}`);
                }
              }}
            >
              <Share2 className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-200" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comment Modal for Posts */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        contentId={post.id}
        contentType="post"
        contentTitle={`Post by ${post.profiles.display_name || post.profiles.username}`}
        commentsCount={commentsCount}
        onCommentsUpdate={(count) => setCommentsCount(count)}
      />
    </>
  );
};