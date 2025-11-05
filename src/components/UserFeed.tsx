import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/PostCard';
import { CreatePost } from '@/components/CreatePost';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserFeedProps {
  userId?: string; // If provided, shows specific user's posts only
  showCreatePost?: boolean;
}

export const UserFeed: React.FC<UserFeedProps> = ({ 
  userId, 
  showCreatePost = true 
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let allPosts: any[] = [];

      if (userId) {
        // Show specific user's posts only
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            user_id,
            content,
            post_type,
            media_url,
            media_type,
            likes_count,
            comments_count,
            reshares_count,
            created_at,
            profiles!posts_user_id_fkey (
              username,
              display_name,
              avatar_url
            ),
            reshared_episode:episodes (
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              duration,
              views,
              likes,
              comments_count,
              created_at,
              series (
                id,
                title,
                genre,
                creators (
                  id,
                  verified,
                  profiles (
                    username,
                    display_name,
                    avatar_url
                  )
                )
              )
            ),
            reshared_post:reshared_post_id (
              id,
              content,
              created_at,
              profiles!posts_user_id_fkey (
                username,
                display_name,
                avatar_url
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1);

        if (error) {
          console.warn('Error fetching user posts:', error);
          allPosts = [];
        } else {
          allPosts = data || [];
        }
      } else {
        // For main feed, show all posts with user's own posts included
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            user_id,
            content,
            post_type,
            media_url,
            media_type,
            likes_count,
            comments_count,
            reshares_count,
            created_at,
            profiles!posts_user_id_fkey (
              username,
              display_name,
              avatar_url
            ),
            reshared_episode:episodes (
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              duration,
              views,
              likes,
              comments_count,
              created_at,
              series (
                id,
                title,
                genre,
                creators (
                  id,
                  verified,
                  profiles (
                    username,
                    display_name,
                    avatar_url
                  )
                )
              )
            ),
            reshared_post:reshared_post_id (
              id,
              content,
              created_at,
              profiles!posts_user_id_fkey (
                username,
                display_name,
                avatar_url
              )
            )
          `)
          .order('created_at', { ascending: false })
          .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1);

        if (error) {
          console.warn('Error fetching posts:', error);
          allPosts = [];
        } else {
          allPosts = data || [];
        }
      }

      if (reset || pageNum === 0) {
        setPosts(allPosts);
      } else {
        setPosts(prev => [...prev, ...allPosts]);
      }

      setHasMore(allPosts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.warn('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, user]);

  useEffect(() => {
    fetchPosts(0, true);
  }, [fetchPosts]);

  // Real-time subscription for posts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
      console.log('New post received:', payload);
      // Refresh posts when a new post is created
      if (userId === undefined || payload.new.user_id === userId) {
        fetchPosts(0, true);
      }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post updated:', payload);
          // Update the specific post in the current state
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === payload.new.id ? { ...post, ...payload.new } : post
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post deleted:', payload);
          // Remove the deleted post from state
          setPosts(prevPosts => 
            prevPosts.filter(post => post.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userId, fetchPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handlePostCreated = () => {
    setPage(0);
    fetchPosts(0, true);
  };

  const handlePostUpdate = () => {
    setPage(0);
    fetchPosts(0, true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {showCreatePost && user && !userId && (
        <CreatePost onPostCreated={handlePostCreated} />
      )}
      
      <div className="space-y-0">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onUpdate={handlePostUpdate}
          />
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          {userId ? 'Inka posts levu.' : 'Mee feed lo inka posts levu.'}
        </div>
      )}

      {hasMore && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading chesthunnam...
              </>
            ) : (
              'Inka Load cheskondi'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};