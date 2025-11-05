import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseCommentsProps {
  contentId: string;
  contentType: 'episode' | 'post';
  initialCount?: number;
}

export const useComments = ({ contentId, contentType, initialCount = 0 }: UseCommentsProps) => {
  const [commentsCount, setCommentsCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch current comment count
  const fetchCommentCount = useCallback(async () => {
    if (!contentId) return;
    
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('content_id', contentId)
        .eq('content_type', contentType);

      if (error) throw error;
      setCommentsCount(count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  }, [contentId, contentType]);

  // Real-time subscription for comment updates
  useEffect(() => {
    if (!contentId) return;

    // Initial fetch
    fetchCommentCount();

    const channel = supabase
      .channel(`comments-count-${contentType}-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`
        },
        (payload) => {
          console.log('Comment inserted via realtime:', payload);
          setCommentsCount(prev => prev + 1);
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
          setCommentsCount(prev => Math.max(0, prev - 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, contentType, fetchCommentCount]);

  // Quick comment submission
  const submitComment = useCallback(async (content: string, parentId?: string) => {
    if (!user || !content.trim()) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          content_id: contentId,
          content_type: contentType,
          user_id: user.id,
          parent_id: parentId || null,
        });

      if (error) throw error;

      console.log('Comment submitted successfully');
      
      // Comment count will be updated via realtime subscription
      toast({
        title: "Success",
        description: "Comment posted successfully!",
        duration: 2000,
      });

      return true;
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: `Failed to post ${parentId ? "reply" : "comment"}. Please try again.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, contentId, contentType, toast]);

  return {
    commentsCount,
    setCommentsCount,
    submitComment,
    isLoading,
    refreshCount: fetchCommentCount
  };
};