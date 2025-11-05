import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, Reply, Trash2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CommentLikeButton } from '@/components/CommentLikeButton';
import { useLanguage } from '@/contexts/LanguageContext';

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
}

interface ImprovedCommentSectionProps {
  contentId: string;
  contentType: 'episode' | 'post';
  commentsCount: number;
  onCommentsUpdate?: (count: number) => void;
  className?: string;
  maxHeight?: string;
  showTitle?: boolean;
}

export const ImprovedCommentSection: React.FC<ImprovedCommentSectionProps> = ({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = useCallback(async () => {
    if (!contentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          user_id,
          content_id,
          content_type,
          created_at,
          parent_id,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      // Organize comments with replies
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create all comments
      data?.forEach(comment => {
        const commentWithReplies: Comment = {
          ...comment,
          replies: []
        };
        commentMap.set(comment.id, commentWithReplies);
        
        if (!comment.parent_id) {
          topLevelComments.push(commentWithReplies);
        }
      });

      // Second pass: organize replies
      data?.forEach(comment => {
        if (comment.parent_id) {
          const parentComment = commentMap.get(comment.parent_id);
          if (parentComment) {
            parentComment.replies = parentComment.replies || [];
            parentComment.replies.push(commentMap.get(comment.id)!);
          }
        }
      });

      setComments(topLevelComments);
      onCommentsUpdate?.(data?.length || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType, onCommentsUpdate]);

  // Set up realtime subscription for comments
  useEffect(() => {
    if (!contentId) return;

    fetchComments();

    // Subscribe to realtime changes for comments
    const channel = supabase
      .channel(`comments-realtime-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`
        },
        (payload) => {
          console.log('New comment inserted via realtime:', payload);
          fetchComments(); // Refetch to get the comment with profile data
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`
        },
        (payload) => {
          console.log('Comment deleted via realtime:', payload);
          fetchComments(); // Refetch comments
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Success",
        description: "Comment posted successfully!",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: replyContent.trim(),
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          parent_id: parentId,
        });

      if (error) throw error;

      setReplyContent('');
      setReplyTo(null);
      toast({
        title: "Success",
        description: "Reply posted successfully!",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
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

      toast({
        title: "Success",
        description: "Comment deleted successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-8 pt-3' : 'pb-4'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={comment.profiles?.avatar_url} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {comment.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground">
              {comment.profiles?.display_name || comment.profiles?.username || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed break-words">
            {comment.content}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-2">
          <CommentLikeButton 
            commentId={comment.id}
            size="sm"
          />
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
          )}
          
          {comment.user_id === user?.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteComment(comment.id)}
              className="text-xs text-destructive hover:text-destructive p-0 h-auto"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          )}
          
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment.id)}
              className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
            >
              {expandedReplies.has(comment.id) 
                ? 'Hide replies'
                : `View replies (${comment.replies.length})`
              }
            </Button>
          )}
        </div>
        
        {/* Reply form */}
        {replyTo === comment.id && (
          <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] resize-none text-sm"
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replyContent.trim() || isSubmitting}
                  className="whitespace-nowrap"
                >
                  <Send className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}
        
        {/* Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
          <div className="mt-3 border-l-2 border-border pl-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  if (!user) {
    return (
      <Card className={`${className} bg-card/80 backdrop-blur-sm border-border/50`}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
          <p className="text-muted-foreground mb-4">
            Please sign in to join the conversation
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-card/90 backdrop-blur-sm border-border/50`}>
      <CardContent className="p-4 space-y-4">
        {showTitle && (
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              Comments ({commentsCount})
            </h3>
          </div>
        )}

        {/* Comment input form */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || isSubmitting}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments list */}
        <div className={`space-y-1 ${maxHeight} overflow-y-auto`}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Loading...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs">Be the first to comment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};