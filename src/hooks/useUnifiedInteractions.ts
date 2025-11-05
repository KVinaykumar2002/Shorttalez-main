import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseUnifiedInteractionsProps {
  contentId: string;
  contentType: 'episode' | 'post';
  initialLikesCount?: number;
  initialCommentsCount?: number;
}

interface InteractionCounts {
  likesCount: number;
  commentsCount: number;
}

export const useUnifiedInteractions = ({
  contentId,
  contentType,
  initialLikesCount = 0,
  initialCommentsCount = 0
}: UseUnifiedInteractionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [isLiked, setIsLiked] = useState(false);
  const [counts, setCounts] = useState<InteractionCounts>({
    likesCount: initialLikesCount,
    commentsCount: initialCommentsCount
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!contentId || !user) return;

    try {
      // Check like status
      const { data: likeData } = await supabase
        .from('interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_id', contentId)
        .eq('target_type', contentType)
        .eq('interaction_type', 'like')
        .maybeSingle();

      setIsLiked(!!likeData);

      // Get current counts
      const [likesResponse, commentsResponse] = await Promise.all([
        supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', contentId)
          .eq('target_type', contentType)
          .eq('interaction_type', 'like'),
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('content_id', contentId)
          .eq('content_type', contentType)
      ]);

      setCounts({
        likesCount: likesResponse.count || 0,
        commentsCount: commentsResponse.count || 0
      });
    } catch (error) {
      console.error('Error fetching interaction data:', error);
    }
  }, [contentId, contentType, user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!contentId) return;

    fetchInitialData();

    // Subscribe to like changes
    const likesChannel = supabase
      .channel(`likes-${contentType}-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${contentId} AND target_type=eq.${contentType} AND interaction_type=eq.like`
        },
        () => {
          setCounts(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${contentId} AND target_type=eq.${contentType} AND interaction_type=eq.like`
        },
        () => {
          setCounts(prev => ({ ...prev, likesCount: Math.max(0, prev.likesCount - 1) }));
        }
      )
      .subscribe();

    // Subscribe to comment changes
    const commentsChannel = supabase
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
          setCounts(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
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
          setCounts(prev => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [contentId, contentType, fetchInitialData]);

  // Toggle like function with race condition protection
  const toggleLike = useCallback(async () => {
    if (!user || isLoading) return false;

    setIsLoading(true);
    
    // Optimistic update with rollback protection
    const wasLiked = isLiked;
    const oldCount = counts.likesCount;
    
    setIsLiked(!wasLiked);
    setCounts(prev => ({
      ...prev,
      likesCount: wasLiked ? Math.max(0, oldCount - 1) : oldCount + 1
    }));

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', contentId)
          .eq('target_type', contentType)
          .eq('interaction_type', 'like');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('interactions')
          .insert({
            user_id: user.id,
            target_id: contentId,
            target_type: contentType,
            interaction_type: 'like'
          });

        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update
      setIsLiked(wasLiked);
      setCounts(prev => ({ ...prev, likesCount: oldCount }));
      
      // Show error only for network issues, but no success notifications
      if (error && 'code' in error && error.code !== '23505') {
        toast({
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, contentId, contentType, isLiked, counts.likesCount, isLoading, toast]);

  return {
    isLiked,
    likesCount: counts.likesCount,
    commentsCount: counts.commentsCount,
    isLoading,
    toggleLike,
    refreshData: fetchInitialData
  };
};