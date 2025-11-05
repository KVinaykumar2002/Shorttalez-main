import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLikeStatus = (targetId: string, targetType: 'episode' | 'post') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Check if user has liked this item
  useEffect(() => {
    if (!user || !targetId) {
      setIsLiked(false);
      return;
    }

    const checkLikeStatus = async () => {
      try {
        const { data } = await supabase
          .from('interactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .eq('interaction_type', 'like')
          .maybeSingle();
        
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking like status:', error);
        setIsLiked(false);
      }
    };

    checkLikeStatus();
  }, [user, targetId, targetType]);

  // Real-time subscription for like updates
  useEffect(() => {
    if (!targetId) return;

    const channel = supabase
      .channel(`likes-${targetType}-${targetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${targetId} AND target_type=eq.${targetType} AND interaction_type=eq.like`
        },
        (payload) => {
          console.log('Like added:', payload);
          setLikesCount(prev => prev + 1);
          // Update our own like status if it's our like
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
          filter: `target_id=eq.${targetId} AND target_type=eq.${targetType} AND interaction_type=eq.like`
        },
        (payload) => {
          console.log('Like removed:', payload);
          setLikesCount(prev => Math.max(0, prev - 1));
          // Update our own like status if it's our like
          if (user && payload.old.user_id === user.id) {
            setIsLiked(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetId, targetType, user]);

  // Fetch current like count
  useEffect(() => {
    if (!targetId) return;

    const fetchLikeCount = async () => {
      try {
        const { count } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .eq('interaction_type', 'like');

        setLikesCount(count || 0);
      } catch (error) {
        console.error('Error fetching like count:', error);
      }
    };

    fetchLikeCount();
  }, [targetId, targetType]);

  const toggleLike = async () => {
    if (!user) {
      return false;
    }

    if (!targetId) return false;

    setIsLoading(true);
    
    // Optimistic update for immediate UI feedback
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
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .eq('interaction_type', 'like');

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('interactions')
          .insert({
            user_id: user.id,
            target_id: targetId,
            target_type: targetType,
            interaction_type: 'like'
          });

        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update silently on error
      setIsLiked(wasLiked);
      setLikesCount(oldCount);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLiked, isLoading, likesCount, setLikesCount, toggleLike };
};