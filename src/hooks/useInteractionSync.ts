import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InteractionSyncProps {
  targetId: string;
  targetType: 'episode' | 'post';
  onLikeChange?: (count: number) => void;
  onCommentChange?: (count: number) => void;
}

/**
 * Global hook to sync interactions across all components
 * This ensures that when a user likes/comments on content in one view,
 * it updates in all other views instantly
 */
export const useInteractionSync = ({ 
  targetId, 
  targetType, 
  onLikeChange, 
  onCommentChange 
}: InteractionSyncProps) => {
  useEffect(() => {
    if (!targetId) return;

    // Create a unique channel for this specific content
    const channel = supabase
      .channel(`interaction-sync-${targetType}-${targetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${targetId} AND target_type=eq.${targetType}`
        },
        async (payload: any) => {
          console.log('Interaction added:', payload);
          
          if (payload.new.interaction_type === 'like' && onLikeChange) {
            // Fetch updated like count
            const { count } = await supabase
              .from('interactions')
              .select('*', { count: 'exact', head: true })
              .eq('target_id', targetId)
              .eq('target_type', targetType)
              .eq('interaction_type', 'like');
            
            onLikeChange(count || 0);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${targetId} AND target_type=eq.${targetType}`
        },
        async (payload: any) => {
          console.log('Interaction removed:', payload);
          
          if (payload.old.interaction_type === 'like' && onLikeChange) {
            // Fetch updated like count
            const { count } = await supabase
              .from('interactions')
              .select('*', { count: 'exact', head: true })
              .eq('target_id', targetId)
              .eq('target_type', targetType)
              .eq('interaction_type', 'like');
            
            onLikeChange(count || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetId, targetType, onLikeChange, onCommentChange]);
};