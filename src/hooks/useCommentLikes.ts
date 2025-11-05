import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCommentLikes = (commentId: string) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check like status and count
  const fetchLikeData = useCallback(async () => {
    if (!commentId) return;

    try {
      // Get like count
      const { count } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', commentId)
        .eq('target_type', 'comment')
        .eq('interaction_type', 'like');

      setLikesCount(count || 0);

      // Check if current user liked this comment
      if (user) {
        const { data } = await supabase
          .from('interactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('target_id', commentId)
          .eq('target_type', 'comment')
          .eq('interaction_type', 'like')
          .maybeSingle();
        
        setIsLiked(!!data);
      } else {
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Error fetching comment like data:', error);
    }
  }, [commentId, user]);

  // Initial fetch
  useEffect(() => {
    fetchLikeData();
  }, [fetchLikeData]);

  // Real-time subscription
  useEffect(() => {
    if (!commentId) return;

    const channel = supabase
      .channel(`comment-likes-${commentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${commentId} AND target_type=eq.comment AND interaction_type=eq.like`
        },
        (payload) => {
          setLikesCount(prev => prev + 1);
          if (user && payload.new.user_id === user.id) {
            setIsLiked(true);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${commentId} AND target_type=eq.comment AND interaction_type=eq.like`
        },
        (payload) => {
          setLikesCount(prev => Math.max(0, prev - 1));
          if (user && payload.old.user_id === user.id) {
            setIsLiked(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentId, user]);

  // Toggle like function
  const toggleLike = useCallback(async () => {
    if (!user || !commentId) return false;

    setIsLoading(true);
    
    // Optimistic update
    const wasLiked = isLiked;
    const oldCount = likesCount;
    
    setIsLiked(!wasLiked);
    setLikesCount(wasLiked ? Math.max(0, oldCount - 1) : oldCount + 1);

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', commentId)
          .eq('target_type', 'comment')
          .eq('interaction_type', 'like');

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('interactions')
          .insert({
            user_id: user.id,
            target_id: commentId,
            target_type: 'comment',
            interaction_type: 'like'
          });

        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikesCount(oldCount);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, commentId, isLiked, likesCount]);

  return {
    isLiked,
    likesCount,
    isLoading,
    toggleLike
  };
};