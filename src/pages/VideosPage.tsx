import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share, MoreVertical, Eye, Repeat, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MovieThemedLoadingScreen } from "@/components/MovieThemedLoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { generatePlaceholderThumbnail } from "@/utils/thumbnailGenerator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EpisodeShareModal } from "@/components/EpisodeShareModal";
import { UnifiedVideoPlayer } from "@/components/UnifiedVideoPlayer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEOTranslation } from "@/lib/seoTranslations";

interface Episode {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  comments_count: number;
  duration: number;
  episode_number: number;
  created_at: string;
  series_id?: string;
  series: {
    id: string;
    title: string;
    genre: string;
    thumbnail_url?: string;
    creators: {
      id: string;
      verified: boolean;
      profiles: {
        username: string;
        display_name: string;
        avatar_url: string;
      } | null;
    };
  };
}

interface SidebarEpisode {
  id: string;
  title: string;
  thumbnail_url: string;
  episode_number: number;
}

const VideosPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState<SidebarEpisode[]>([]);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { t } = useLanguage();

  // Update SEO meta tags for videos page
  useSEOTranslation("videos");

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Ensure full-screen for iOS - remove body padding and safe area
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

  const fetchEpisodes = async ({ pageParam = 0 }) => {
    const limit = 20;
    const offset = pageParam * limit;
    const { data, error } = await supabase
      .from("episodes")
      .select(
        `
        id,
        title,
        description,
        video_url,
        thumbnail_url,
        views,
        likes,
        comments_count,
        duration,
        episode_number,
        series_id,
        is_premium,
        series:series_id (
          id,
          title,
          genre,
          thumbnail_url,
          is_premium,
          creators (
            id,
            verified,
            profiles (
              username,
              display_name,
              avatar_url
            )
          )
        ),
        created_at
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Filter to show only episode 1 for premium series, all episodes for non-premium
    const filteredData = (data || []).filter((episode) => {
      const isPremiumSeries = episode.series?.is_premium || episode.is_premium;
      if (isPremiumSeries) {
        return episode.episode_number === 1;
      }
      return true;
    });

    // Ensure at least one premium episode (episode 1) is in the first page
    if (pageParam === 0) {
      const hasPremium = filteredData.some((ep) => ep.series?.is_premium || ep.is_premium);

      if (!hasPremium) {
        // Fetch premium series first, then get their episode 1
        const { data: premiumSeries } = await supabase
          .from("series")
          .select("id")
          .eq("is_premium", true)
          .eq("status", "published")
          .limit(1)
          .maybeSingle();

        if (premiumSeries) {
          // Now fetch episode 1 of this premium series
          const { data: premiumEpisode } = await supabase
            .from("episodes")
            .select(
              `
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              views,
              likes,
              comments_count,
              duration,
              episode_number,
              series_id,
              is_premium,
              series:series_id (
                id,
                title,
                genre,
                thumbnail_url,
                is_premium,
                creators (
                  id,
                  verified,
                  profiles (
                    username,
                    display_name,
                    avatar_url
                  )
                )
              ),
              created_at
            `,
            )
            .eq("status", "approved")
            .eq("series_id", premiumSeries.id)
            .eq("episode_number", 1)
            .maybeSingle();

          if (premiumEpisode) {
            // Add premium episode at the beginning
            filteredData.unshift(premiumEpisode);
          }
        }
      }
    }

    return filteredData;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ["episodes"],
    queryFn: fetchEpisodes,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length : undefined;
    },
    initialPageParam: 0,
  });

  const episodes = data?.pages.flat() || [];

  // IntersectionObserver to detect which video is in view and auto-play it
  useEffect(() => {
    if (!episodes.length || !containerRef.current) return;

    const scrollContainer = containerRef.current.querySelector(".overflow-y-scroll");
    if (!scrollContainer) return;

    const options = {
      root: scrollContainer,
      threshold: 0.7, // 70% of video must be visible
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const episodeId = entry.target.getAttribute("data-episode-id");
        if (!episodeId) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          // Video is in view - play ONLY this video
          console.log(`🎬 Video ${episodeId} is in view (${Math.round(entry.intersectionRatio * 100)}%), auto-playing`);
          setPlayingVideos(new Set([episodeId]));
          setCurrentEpisode(episodes.find(e => e.id === episodeId) || null);
        } else if (!entry.isIntersecting) {
          // Video is out of view - pause it
          console.log(`⏸️ Video ${episodeId} is out of view, pausing`);
          setPlayingVideos((prev) => {
            const newSet = new Set(prev);
            newSet.delete(episodeId);
            return newSet;
          });
        }
      });
    }, options);

    // Observe all video containers with a small delay to ensure they're rendered
    const timeoutId = setTimeout(() => {
      const videoContainers = scrollContainer.querySelectorAll("[data-episode-id]");
      console.log(`📹 Found ${videoContainers.length} video containers to observe`);
      videoContainers.forEach((element) => {
        observer.observe(element);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [episodes.length]);

  // Cleanup effect - pause all videos when component unmounts
  useEffect(() => {
    return () => {
      console.log("VideosPage unmounting, pausing all videos");
      setPlayingVideos(new Set());
    };
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;

      // Load more when user is near bottom (within 2 screen heights)
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < clientHeight * 2) {
        if (hasNextPage && !isFetchingNextPage) {
          console.log("Loading more episodes... Distance from bottom:", distanceFromBottom);
          fetchNextPage();
        }
      }
    };

    const scrollContainer = containerRef.current?.querySelector(".overflow-y-scroll");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      // Trigger initial check in case we need to load more
      handleScroll({ target: scrollContainer } as any);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Intersection Observer to detect current video and ensure only one plays
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible video
        let mostVisible: { id: string; ratio: number } | null = null;

        entries.forEach((entry) => {
          const episodeId = entry.target.getAttribute("data-episode-id");
          if (!episodeId) return;

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            if (!mostVisible || entry.intersectionRatio > mostVisible.ratio) {
              mostVisible = { id: episodeId, ratio: entry.intersectionRatio };
            }
          }
        });

        // If we found a most visible video, play ONLY that one
        if (mostVisible) {
          const episode = episodes.find((ep) => ep.id === mostVisible!.id);
          if (episode) {
            setCurrentEpisode(episode);
            setPlayingVideos(new Set([mostVisible.id]));
            console.log(`Auto-playing most visible video: ${mostVisible.id} (${mostVisible.ratio})`);
          }
        } else {
          // No video is sufficiently visible, pause all
          setPlayingVideos(new Set());
          console.log("No video sufficiently visible, pausing all");
        }
      },
      {
        threshold: [0.5, 0.75, 1.0],
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    // Observe all video elements
    videoRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [episodes, currentEpisode]);

  // Fetch series episodes when current episode changes
  useEffect(() => {
    if (!currentEpisode) {
      setSeriesEpisodes([]);
      return;
    }

    // Clear previous episodes immediately when switching to different series
    setSeriesEpisodes([]);

    const fetchSeriesEpisodes = async () => {
      const { data } = await supabase
        .from("episodes")
        .select(
          `
          id,
          title,
          thumbnail_url,
          episode_number
        `,
        )
        .eq("series_id", currentEpisode.series_id)
        .eq("status", "approved")
        .order("episode_number", { ascending: true });

      if (data) {
        // Filter out current episode
        const otherEpisodes = data.filter((ep) => ep.id !== currentEpisode.id);
        setSeriesEpisodes(otherEpisodes);
      }
    };

    fetchSeriesEpisodes();
  }, [currentEpisode?.id, currentEpisode?.series_id]);

  const scrollToEpisode = (episodeId: string) => {
    const element = videoRefs.current.get(episodeId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Close sidebar on mobile after selection
      if (window.innerWidth < 1024) {
        setShowSidebar(false);
      }
    }
  };

  // Check liked episodes
  useEffect(() => {
    if (!user || episodes.length === 0) return;

    const checkLikes = async () => {
      const episodeIds = episodes.map((ep) => ep.id);
      const { data } = await supabase
        .from("interactions")
        .select("target_id")
        .eq("user_id", user.id)
        .eq("target_type", "episode")
        .eq("interaction_type", "like")
        .in("target_id", episodeIds);

      if (data) {
        setLikedEpisodes(new Set(data.map((item) => item.target_id)));
      }
    };

    checkLikes();
  }, [user, episodes]);

  const handleLike = async (episodeId: string) => {
    if (!user) {
      toast({
        title: t("messages.login_required", "videos"),
        description: t("messages.please_log_in_to_like_episodes", "videos"),
        variant: "default",
      });
      return;
    }

    const isLiked = likedEpisodes.has(episodeId);
    if (isLiked) {
      await supabase
        .from("interactions")
        .delete()
        .eq("user_id", user.id)
        .eq("target_id", episodeId)
        .eq("target_type", "episode")
        .eq("interaction_type", "like");

      setLikedEpisodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(episodeId);
        return newSet;
      });
    } else {
      await supabase.from("interactions").insert({
        user_id: user.id,
        target_id: episodeId,
        target_type: "episode",
        interaction_type: "like",
      });

      setLikedEpisodes((prev) => new Set([...prev, episodeId]));
    }
  };

  const handleShare = async (episode: Episode) => {
    const shareData = {
      title: episode.title,
      text: episode.description,
      url: window.location.origin + `/series/${episode.id}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  const handleReshare = (episode: Episode) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedEpisode(episode);
    setShowShareModal(true);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Show loading state while data is being fetched
  if (isLoading || episodes.length === 0) {
    return <MovieThemedLoadingScreen message={t("Loading amazing videos...")} />;
  }

  // Show error state
  if (isError) {
    return (
      <div
        className="flex items-center justify-center bg-black text-white"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
        height: "100dvh",
        }}
      >
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">{t("Error loading videos")}</div>
          <div className="text-sm text-gray-400">{t("Please try refreshing the page")}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="video-page-container bg-black overflow-hidden relative flex"
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
      ref={containerRef}
    >
      {/* Animated background */}
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

      {/* Header with Back Button */}
      <div className="absolute top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
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

      {/* Video Feed - FIXED CONTAINER */}
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
        {episodes.map((episode, index) => (
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
      {/* Video Player Container - Optimized for full screen */}
            <UnifiedVideoPlayer
              episode={episode}
              isPlaying={playingVideos.has(episode.id)}
              onPlayStateChange={(playing) => {
                console.log(`Video ${episode.id} play state change: ${playing}`);
              }}
              isMuted={true}
              autoPlay={true}
              showSeriesButton={true}
              hideNavigation={true}
              showHomeButton={false}
              className="absolute inset-0 w-full h-full"
              playerClassName="absolute inset-0 w-full h-full"
              videoClassName="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Loading indicator for infinite scroll */}
        {isFetchingNextPage && (
          <div
            className="snap-start flex items-center justify-center"
            style={{
              width: "100vw",
              height: "100dvh",
              minHeight: "100dvh",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <p className="text-white text-sm">Loading more videos...</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-xl border-l border-white/10 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="text-white text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t("messages.ee_series_lo_inka_episodes", "videos")}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {seriesEpisodes.slice(0, 6).map((episode, index) => (
                  <div key={episode.id} className="cursor-pointer group" onClick={() => scrollToEpisode(episode.id)}>
                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

                      <div className="relative z-10 p-3">
                        <div className="flex gap-3">
                          <img
                            src={currentEpisode?.series?.thumbnail_url || episode.thumbnail_url}
                            alt={episode.title}
                            className="w-20 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = generatePlaceholderThumbnail({
                                id: episode.id,
                                title: episode.title,
                                episode_number: episode.episode_number,
                              });
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium mb-1 line-clamp-2">{episode.title}</h4>
                            <div className="text-purple-300 text-xs">
                              {t("Episode")} {episode.episode_number}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {currentEpisode && seriesEpisodes.length > 0 && (
        <div className="hidden lg:flex w-80 xl:w-96 h-full bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-xl border-l border-white/10 flex-col py-6 overflow-y-auto relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-pink-500/5 to-orange-500/5 animate-gradient-shift"></div>

          <div className="relative z-10">
            <div className="text-white text-sm font-bold mb-6 px-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t("messages.ee_series_lo_inka_episodes", "videos")}
            </div>
            <div className="space-y-4 px-4">
              {seriesEpisodes.slice(0, 6).map((episode, index) => (
                <div
                  key={episode.id}
                  className="cursor-pointer group hover-lift"
                  onClick={() => scrollToEpisode(episode.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

                    <div className="relative z-10 p-4">
                      <img
                        src={currentEpisode.series?.thumbnail_url || episode.thumbnail_url}
                        alt={episode.title}
                        className="w-full aspect-video object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = generatePlaceholderThumbnail({
                            id: episode.id,
                            title: episode.title,
                            episode_number: episode.episode_number,
                          });
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.naturalWidth === 0 || target.naturalHeight === 0) {
                            target.src = generatePlaceholderThumbnail({
                              id: episode.id,
                              title: episode.title,
                              episode_number: episode.episode_number,
                            });
                          }
                        }}
                      />
                      <div className="mt-3">
                        <h4 className="text-white text-sm font-medium mb-1 line-clamp-2">{episode.title}</h4>
                        <div className="text-purple-300 text-xs">
                          {t("Episode")} {episode.episode_number}
                        </div>
                      </div>

                      {/* Play indicator */}
                      <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-twinkle opacity-30"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Load more trigger */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 lg:left-1/4 lg:-translate-x-1/2">
          <Button
            onClick={() => fetchNextPage()}
            className="bg-primary/20 text-white border border-white/20 text-sm px-4 py-2"
          >
            {t("Inka Load cheskondi")}
          </Button>
        </div>
      )}

      {/* Episode Share Modal */}
      {showShareModal && selectedEpisode && (
        <EpisodeShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedEpisode(null);
          }}
          episode={{
            ...selectedEpisode,
            series: {
              id: selectedEpisode.series?.id || "",
              title: selectedEpisode.series?.title || "",
              creators: {
                id: selectedEpisode.series?.creators?.id || "",
                profiles: {
                  username: selectedEpisode.series?.creators?.profiles?.username || "",
                  display_name: selectedEpisode.series?.creators?.profiles?.display_name || "",
                  avatar_url: selectedEpisode.series?.creators?.profiles?.avatar_url || "",
                },
              },
            },
          }}
          onShared={() => {
            setShowShareModal(false);
            setSelectedEpisode(null);
          }}
        />
      )}
    </div>
  );
};

export default VideosPage;
