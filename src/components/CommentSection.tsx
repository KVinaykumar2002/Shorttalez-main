import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, Heart, MoreHorizontal, Reply, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCommentLikes } from '@/hooks/useCommentLikes';
import { CommentLikeButton } from '@/components/CommentLikeButton';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
  replies?: Comment[];
  likes?: number;
  isLiked?: boolean;
}

interface CommentSectionProps {
  contentId: string;
  contentType: 'episode' | 'post';
  commentsCount: number;
  onCommentsUpdate?: (count: number) => void;
  className?: string;
  maxHeight?: string;
  showTitle?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  contentType,
  commentsCount,
  onCommentsUpdate,
  className = '',
  maxHeight = 'max-h-96',
  showTitle = true,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Scroll & focus management for accessibility
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const replyInputRefs = React.useRef<Record<string, HTMLTextAreaElement | null>>({});

  const focusReplyInput = (commentId: string) => {
    // wait for textarea to mount
    requestAnimationFrame(() => {
      const el = replyInputRefs.current[commentId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    });
  };

  useEffect(() => {
    if (contentId) {
      fetchComments();
    }
  }, [contentId]);

  // Real-time subscription for comments
  useEffect(() => {
    if (!contentId) return;

    const channel = supabase
      .channel(`comments-${contentType}-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId} AND content_type=eq.${contentType}`
        },
        () => {
          fetchComments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId} AND content_type=eq.${contentType}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, contentType]);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch top-level comments
      const { data: parentComments, error: parentError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (parentError) throw parentError;

      // Fetch replies for each parent comment
      const commentsWithReplies = await Promise.all(
        (parentComments || []).map(async (comment) => {
          const { data: replies, error: repliesError } = await supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url
              )
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          if (repliesError) {
            console.warn('Error fetching replies:', repliesError);
            return { ...comment, replies: [] };
          }

          return { ...comment, replies: replies || [] };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.warn('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contentId, contentType, toast]);

  const handleSubmitComment = async (content?: string, parentId?: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const commentContent = content || newComment.trim();
    if (!commentContent) return;

    setIsSubmitting(true);
    try {
        const { error } = await supabase
          .from('comments')
          .insert({
            content: commentContent,
            content_id: contentId,
            content_type: contentType,
            episode_id: contentType === 'episode' ? contentId : null, // Backward compatibility
            user_id: user.id,
            parent_id: parentId || null,
          });

      if (error) throw error;

      if (parentId) {
        setReplyContent('');
        setReplyTo(null);
      } else {
        setNewComment('');
      }
      
      fetchComments();
      onCommentsUpdate?.(commentsCount + 1);
      
      // Remove success toast to reduce notification spam
      // Comment will appear via real-time updates
    } catch (error) {
      console.warn('Error posting comment:', error);
      toast({
        title: "Error",
        description: `Failed to post ${parentId ? "reply" : "comment"}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchComments();
      onCommentsUpdate?.(Math.max(0, commentsCount - 1));
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } catch (error) {
      console.warn('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAuthRequired = () => {
    navigate('/auth');
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="space-y-3">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.profiles?.avatar_url || ''} />
              <AvatarFallback>
                {comment.profiles?.display_name?.charAt(0) || comment.profiles?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {comment.profiles?.display_name || comment.profiles?.username || 'Unknown User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed">
                {comment.content}
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <CommentLikeButton commentId={comment.id} size="sm" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  aria-label="Reply to comment"
                  onClick={() => {
                    const next = replyTo === comment.id ? null : comment.id;
                    setReplyTo(next);
                    if (next) focusReplyInput(comment.id);
                  }}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
                {user?.id === comment.user_id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDeleteComment(comment.id)}
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>

              {/* Reply Input */}
              {replyTo === comment.id && (
                <div className="mt-3 flex gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {user?.user_metadata?.display_name?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                      disabled={isSubmitting}
                      aria-label="Reply input"
                      ref={(el) => (replyInputRefs.current[comment.id] = el)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitComment(replyContent, comment.id)}
                        disabled={!replyContent.trim() || isSubmitting}
                        className="h-7 px-3 text-xs"
                        aria-label="Post reply"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setReplyTo(null);
                           setReplyContent('');
                           listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                         }}
                         className="h-7 px-3 text-xs"
                         aria-label="Cancel reply"
                       >
                         Cancel
                       </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-6 space-y-2">
              {comment.replies.map((reply) => (
                <Card key={reply.id} className="bg-muted/30 border-muted">
                  <CardContent className="p-3">
                    <div className="flex gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={reply.profiles?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {reply.profiles?.display_name?.charAt(0) || reply.profiles?.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">
                            {reply.profiles?.display_name || reply.profiles?.username || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className="text-xs text-foreground leading-relaxed">
                          {reply.content}
                        </p>
                        
                        <div className="flex items-center gap-1 pt-1">
                          <CommentLikeButton commentId={reply.id} size="default" />
                          {user?.id === reply.user_id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 px-2 text-xs hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDeleteComment(reply.id)}
                              aria-label="Delete reply"
                            >
                              <Trash2 className="w-2 h-2 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Comment Input */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {user ? (
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                <AvatarFallback>
                  {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="w-8 h-8">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            )}
            
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={user ? "Add a comment..." : "Sign in to comment"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none bg-background/50"
                disabled={!user || isSubmitting}
                onClick={!user ? handleAuthRequired : undefined}
                maxLength={500}
              />
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {user ? `${newComment.length}/500 characters` : 'Please sign in to comment'}
                </span>
                
                {user ? (
                  <Button
                    onClick={() => handleSubmitComment()}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="gap-2"
                    aria-label="Post comment"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                ) : (
                  <Button onClick={handleAuthRequired} size="sm">
                    Sign In to Comment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        {showTitle && (
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{commentsCount} {contentType === 'post' ? 'Comments' : 'Comments'}</span>
          </div>
        )}

        <div ref={listRef} className={`space-y-3 overflow-y-auto ${maxHeight} scroll-smooth scroll-pb-24 pr-1`} aria-live="polite">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length > 0 ? (
            comments.map(renderComment)
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No comments yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to share your thoughts!
                </p>
                {!user && (
                  <Button onClick={handleAuthRequired} variant="outline">
                    Sign In to Comment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};