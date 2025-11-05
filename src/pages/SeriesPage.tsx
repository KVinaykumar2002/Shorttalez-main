import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnifiedVideoPlayer } from '@/components/UnifiedVideoPlayer';
import { PremiumVideoPlayer } from '@/components/PremiumVideoPlayer';
import { ImprovedCommentSection } from '@/components/ImprovedCommentSection';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ArrowLeft, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Eye,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Repeat,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useGesture } from '@use-gesture/react';
import { EpisodeShareModal } from '@/components/EpisodeShareModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface Episode {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  views: number;
  likes: number;
  comments_count: number;
  episode_number: number;
  created_at: string;
  is_premium?: boolean;
}

interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  genre: string;
  language: string;
  episode_count: number;
  total_views: number;
  source_platform?: string;
  is_premium?: boolean;
  creators?: {
    id: string;
    verified: boolean;
    follower_count: number;
    profiles?: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
  episodes: Episode[];
}

const SeriesPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [series, setSeries] = useState<Series | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { t } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Ensure full-screen for mobile - remove body padding and safe area
  useEffect(() => {
    const originalBodyStyle = {
      padding: document.body.style.padding,
      margin: document.body.style.margin,
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      height: document.body.style.height
    };
    
    // Force body to take full screen without safe area padding
    document.body.style.padding = "0";
    document.body.style.margin = "0"; 
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";
    
    // Override any CSS safe area insets
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.position = "fixed";
      rootElement.style.top = "0";
      rootElement.style.left = "0";
      rootElement.style.width = "100vw";
      rootElement.style.height = "100vh";
      rootElement.style.padding = "0";
      rootElement.style.margin = "0";
    }
    
    return () => {
      document.body.style.padding = originalBodyStyle.padding;
      document.body.style.margin = originalBodyStyle.margin;
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.height = originalBodyStyle.height;
      document.body.style.width = "";
      
      if (rootElement) {
        rootElement.style.position = "";
        rootElement.style.top = "";
        rootElement.style.left = "";
        rootElement.style.width = "";
        rootElement.style.height = "";
        rootElement.style.padding = "";
        rootElement.style.margin = "";
      }
    };
  }, []);

  // Cleanup effect for page unmount
  useEffect(() => {
    return () => {
      // Force stop any playing video when leaving the page
      setPlayingVideos(new Set());
    };
  }, []);

  useEffect(() => {
    if (id) {
      fetchSeries();
    }
  }, [id]);

  // React to URL parameter changes for episode navigation
  useEffect(() => {
    const requestedEpisodeId = searchParams.get('episode');
    if (requestedEpisodeId && series?.episodes?.length) {
      const episodeIndex = series.episodes.findIndex(ep => ep.id === requestedEpisodeId);
      if (episodeIndex >= 0 && episodeIndex !== currentEpisodeIndex) {
        setCurrentEpisodeIndex(episodeIndex);
        setPlayingVideos(new Set([requestedEpisodeId]));
        
        // Scroll to the episode
        setTimeout(() => {
          const targetEl = videoRefs.current.get(requestedEpisodeId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
        }, 100);
      }
    }
  }, [searchParams, series]);

  useEffect(() => {
    const currentEpisode = series?.episodes[currentEpisodeIndex];
    if (currentEpisode) {
      setLikesCount(currentEpisode.likes);
      checkIfLiked(currentEpisode.id);
    }
  }, [currentEpisodeIndex, series, user]);

  // Check for comments parameter in URL
  useEffect(() => {
    const commentsParam = searchParams.get('comments');
    if (commentsParam === 'true') {
      setShowComments(true);
    }
  }, [searchParams]);

  // Intersection Observer to detect current video - optimized to prevent re-renders
  useEffect(() => {
    if (!series?.episodes?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible video
        let mostVisibleEntry: IntersectionObserverEntry | null = null;
        let highestRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            mostVisibleEntry = entry;
          }
        });

        // Only update if we have a clearly visible video (>50% visible)
        if (mostVisibleEntry && highestRatio > 0.5) {
          const episodeId = mostVisibleEntry.target.getAttribute('data-episode-id');
          if (!episodeId) return;

          const episodeIndex = series.episodes.findIndex(ep => ep.id === episodeId);
          if (episodeIndex >= 0) {
            setCurrentEpisodeIndex(episodeIndex);
            setPlayingVideos(new Set([episodeId]));
          }
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px'
      }
    );

    // Observe all video elements
    const elements = Array.from(videoRefs.current.values());
    elements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [series?.episodes?.length]); // Only re-run when episode count changes

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('series')
        .select(`
          *,
          creators (
            id,
            verified,
            follower_count,
            profiles (
              username,
              display_name,
              avatar_url
            )
          ),
          episodes (
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            views,
            likes,
            comments_count,
            episode_number,
            created_at,
            is_premium,
            status
          )
        `)
        .eq('id', id)
        .eq('episodes.status', 'approved')
        .order('episode_number', { referencedTable: 'episodes', ascending: true })
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to load series: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Series not found');
      }
      
      setSeries(data);
      
      // Check if there's a specific episode requested in URL
      const requestedEpisodeId = searchParams.get('episode');
      if (requestedEpisodeId && data?.episodes?.length > 0) {
        // Find the index of the requested episode
        const episodeIndex = data.episodes.findIndex(ep => ep.id === requestedEpisodeId);
        if (episodeIndex >= 0) {
          setCurrentEpisodeIndex(episodeIndex);
          setPlayingVideos(new Set([requestedEpisodeId]));

          // Scroll the requested episode into view so it plays immediately
          // Delay to ensure DOM nodes are mounted and refs are set
          setTimeout(() => {
            const targetEl = videoRefs.current.get(requestedEpisodeId);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
          }, 100);
        }
      } else if (data?.episodes?.length > 0) {
        // Start with first episode when no specific episode is requested
        setCurrentEpisodeIndex(0);
        setPlayingVideos(new Set([data.episodes[0].id]));
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load series",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async (episodeId: string) => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_type', 'episode')
        .eq('target_id', episodeId)
        .eq('interaction_type', 'like')
        .maybeSingle();
      
      setIsLiked(!!data);
    } catch (error) {
      // Ignore error, means not liked
    }
  };

  const handleLike = async () => {
    if (!user || !series) {
      if (!user) {
        navigate('/auth');
      }
      return;
    }

    const currentEpisode = series.episodes[currentEpisodeIndex];
    
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('target_type', 'episode')
          .eq('target_id', currentEpisode.id)
          .eq('interaction_type', 'like');
        
        if (error) throw error;
        
        setIsLiked(false);
        // Refresh like count from database
        const { data: refreshedEpisode, error: fetchError } = await supabase
          .from('episodes')
          .select('likes')
          .eq('id', currentEpisode.id)
          .maybeSingle();
          
        if (fetchError) throw fetchError;
        if (refreshedEpisode) {
          setLikesCount(refreshedEpisode.likes);
        }
      } else {
        const { error } = await supabase
          .from('interactions')
          .insert({
            user_id: user.id,
            target_type: 'episode',
            target_id: currentEpisode.id,
            interaction_type: 'like'
          });
        
        if (error) throw error;
        
        setIsLiked(true);
        // Refresh like count from database
        const { data: refreshedEpisode, error: fetchError } = await supabase
          .from('episodes')
          .select('likes')
          .eq('id', currentEpisode.id)
          .maybeSingle();
          
        if (fetchError) throw fetchError;
        if (refreshedEpisode) {
          setLikesCount(refreshedEpisode.likes);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!series?.creators?.id) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('subscriptions')
          .delete()
          .eq('follower_id', user.id)
          .eq('creator_id', series.creators.id);

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You unfollowed @${series.creators.profiles?.username || 'this creator'}`,
        });
      } else {
        // Follow
        await supabase
          .from('subscriptions')
          .insert({
            follower_id: user.id,
            creator_id: series.creators.id
          });

        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following @${series.creators.profiles?.username || 'this creator'}`,
        });
      }
    } catch (error) {
      console.error('Error handling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading) {
    return <MovieThemedLoadingScreen message={t('messages.loading_amazing_videos', 'videos')} />;
  }

  if (!series || !series.episodes || series.episodes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('empty_states.no_series', 'homepage')}</h1>
          <Button onClick={() => navigate(-1)}>{t('actions.try_again', 'homepage')}</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div 
        className="video-page-container bg-black overflow-hidden relative flex"
        ref={containerRef} 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100dvh",
          padding: 0,
          margin: 0,
        }}
      >
        {/* Animated background - matching VideosPage */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 animate-float opacity-60"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
        </div>

        {/* Header with Back Button - matching VideosPage */}
        <div 
          className="absolute top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 12px)",
            paddingLeft: "12px",
            paddingRight: "12px",
            paddingBottom: "12px",
          }}
        >
          <div className="flex items-center justify-start pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate("/home");
              }}
              className="text-white hover:bg-white/20 touch-manipulation h-10 w-10 sm:h-12 sm:w-12 pointer-events-auto"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        {/* Video Feed - FIXED CONTAINER matching VideosPage */}
        <div 
          className="flex-1 h-full snap-y snap-mandatory overflow-y-scroll relative z-10 scroll-smooth w-full"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100dvh",
            touchAction: "pan-y",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "y mandatory",
            scrollPaddingTop: "0px",
          }}
        >
          {series.episodes.map((episode, index) => (
            <div 
              key={episode.id}
              className="h-full w-full snap-center snap-always relative flex items-center justify-center group"
              data-episode-id={episode.id}
              style={{
                scrollSnapAlign: "center",
                scrollSnapStop: "always",
                width: "100vw",
                height: "100dvh",
                minHeight: "100dvh",
                maxHeight: "100dvh",
                overflow: "hidden",
                position: "relative",
              }}
              ref={(el) => {
                if (el) {
                  videoRefs.current.set(episode.id, el);
                } else {
                  videoRefs.current.delete(episode.id);
                }
              }}
            >
                <div className="relative w-full h-full bg-black">
                  <ErrorBoundary fallback={
                    <div className="flex items-center justify-center w-full h-full text-white">
                      <p>{t('messages.please_try_refreshing_the_page', 'videos')}</p>
                    </div>
                  }>
                    {/* Premium Video Player for Premium Content */}
                    {series.is_premium && (episode.is_premium || episode.episode_number > 1) ? (
                      <PremiumVideoPlayer
                        episode={episode}
                        series={series}
                        onClose={() => navigate("/home")}
                      />
                    ) : (
                      <UnifiedVideoPlayer
                        key={`video-${episode.id}`}
                        episode={{
                          id: episode.id,
                          title: episode.title,
                          description: episode.description,
                          video_url: episode.video_url,
                          thumbnail_url: episode.thumbnail_url,
                          duration: episode.duration || 0,
                          views: episode.views,
                          likes: index === currentEpisodeIndex ? likesCount : episode.likes,
                          comments_count: episode.comments_count,
                          created_at: episode.created_at,
                          episode_number: episode.episode_number,
                          is_premium: episode.is_premium,
                          series: {
                            id: series.id,
                            title: series.title,
                            genre: series.genre || 'General',
                            is_premium: series.is_premium,
                            creators: {
                              id: series.creators?.id || '',
                              verified: series.creators?.verified || false,
                              profiles: series.creators?.profiles ? {
                                username: series.creators.profiles.username,
                                display_name: series.creators.profiles.display_name,
                                avatar_url: series.creators.profiles.avatar_url
                              } : {
                                username: 'Unknown',
                                display_name: 'Unknown User',
                                avatar_url: ''
                              }
                            }
                          }
                        }}
                        nextVideoUrl={series.episodes[index + 1]?.video_url} 
                        isPlaying={playingVideos.has(episode.id)}
                        showHomeButton={false}
                        onPlayStateChange={(playing) => {
                          if (playing) {
                            setPlayingVideos(new Set([episode.id]));
                            if (index !== currentEpisodeIndex) {
                              setCurrentEpisodeIndex(index);
                            }
                          }
                        }}
                        isMuted={isMuted}
                        onMuteChange={setIsMuted}
                        autoPlay={index === currentEpisodeIndex}
                        showSeriesButton={false}
                        hideNavigation={true}
                      />
                    )}
                  </ErrorBoundary>
                </div>
            </div>
          ))}
        </div>

        {/* Comments Section */}
        {showComments && series.episodes[currentEpisodeIndex] && (
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-background border-t border-border rounded-t-3xl z-50 safe-area-bottom">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Comments</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(false)}
                className="h-8 w-8"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-full overflow-hidden">
              <ImprovedCommentSection
                contentId={series.episodes[currentEpisodeIndex].id}
                contentType="episode"
                commentsCount={series.episodes[currentEpisodeIndex].comments_count}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Episode Share Modal */}
        {showShareModal && series.episodes[currentEpisodeIndex] && (
          <EpisodeShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            episode={{
              ...series.episodes[currentEpisodeIndex],
                series: {
                  id: series.id,
                  title: series.title,
                  creators: {
                    id: series.creators?.id || '',
                    profiles: series.creators?.profiles || {
                      username: 'Unknown',
                      display_name: 'Unknown User',
                      avatar_url: ''
                    }
                  }
                }
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SeriesPage;