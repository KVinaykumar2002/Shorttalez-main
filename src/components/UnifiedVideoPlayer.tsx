import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  PlaySquare,
  ChevronRight,
  UserPlus,
  UserCheck,
  Repeat2,
  ArrowLeft,
  List,
  X,
  Lock,
  Crown,
} from "lucide-react";
import OptimizedVideoPlayer from "@/components/OptimizedVideoPlayer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLikeStatus } from "@/hooks/useLikeStatus";
import { useComments } from "@/hooks/useComments";
import { useWatchProgress } from "@/hooks/useWatchProgress";

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
  created_at: string;
  episode_number?: number;
  is_premium?: boolean;
  series: {
    id: string;
    title: string;
    genre: string;
    is_premium?: boolean;
    creators: {
      id: string;
      verified: boolean;
      profiles: {
        username: string;
        display_name: string;
        avatar_url: string;
      };
    };
  };
}

interface EpisodeListItem {
  id: string;
  title: string;
  episode_number: number;
  thumbnail_url: string;
  is_premium?: boolean;
}

interface UnifiedVideoPlayerProps {
  episode: Episode;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  isMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
  autoPlay?: boolean;
  className?: string;
  showSeriesButton?: boolean;
  compact?: boolean;
  hideNavigation?: boolean;
  showHomeButton?: boolean;
  playerClassName?: string;
  videoClassName?: string;
  nextVideoUrl?: string; // For preloading next video (Reels-style)
}

export const UnifiedVideoPlayer: React.FC<UnifiedVideoPlayerProps> = ({
  episode,
  isPlaying = false,
  onPlayStateChange,
  isMuted = false,
  onMuteChange,
  autoPlay = false,
  className = "",
  showSeriesButton = true,
  compact = false,
  hideNavigation = false,
  showHomeButton = true,
  playerClassName = "",
  videoClassName = "",
  nextVideoUrl,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isResharing, setIsResharing] = useState(false);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [allEpisodes, setAllEpisodes] = useState<EpisodeListItem[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateWatchProgress } = useWatchProgress();

  // Track watch progress
  const handleProgressUpdate = (currentTime: number, duration: number) => {
    if (user && duration > 0) {
      updateWatchProgress(episode.id, currentTime, duration);
    }
  };

  // Only set video player active for full-screen experiences
  // This is determined by the absence of compact mode and presence of showSeriesButton
  const { setVideoPlayerActive } = useVideoPlayer();

  // Use real-time hooks for likes and comments
  const { isLiked, likesCount, toggleLike, isLoading: isLikeLoading } = useLikeStatus(episode.id, "episode");

  const { commentsCount } = useComments({
    contentId: episode.id,
    contentType: "episode",
    initialCount: episode.comments_count || 0,
  });

  // Set video player as active when component mounts (only when explicitly requested)
  useEffect(() => {
    if (hideNavigation) {
      setVideoPlayerActive(true);
      return () => setVideoPlayerActive(false);
    }
  }, [hideNavigation, setVideoPlayerActive]);

  // Check if user is following the creator
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !episode?.series?.creators?.id) return;

      try {
        const { data } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("follower_id", user.id)
          .eq("creator_id", episode.series.creators.id)
          .maybeSingle();

        setIsFollowing(!!data);
      } catch (error) {
        console.warn("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [user, episode?.series?.creators?.id]);

  // Fetch all episodes for the series
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!episode?.series?.id) return;

      setLoadingEpisodes(true);
      try {
        const { data, error } = await supabase
          .from("episodes")
          .select("id, title, episode_number, thumbnail_url, is_premium")
          .eq("series_id", episode.series.id)
          .eq("status", "approved")
          .order("episode_number", { ascending: true });

        if (error) throw error;
        if (data) {
          // Deduplicate episodes by episode_number to prevent duplicates
          const uniqueEpisodes = data.reduce((acc: EpisodeListItem[], current) => {
            const existing = acc.find(ep => ep.episode_number === current.episode_number);
            if (!existing) {
              acc.push(current);
            }
            return acc;
          }, []);
          setAllEpisodes(uniqueEpisodes);
        }
      } catch (error) {
        console.warn("Error fetching episodes:", error);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [episode?.series?.id]);

  const handleFollow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!episode?.series?.creators?.id) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("subscriptions")
          .delete()
          .eq("follower_id", user.id)
          .eq("creator_id", episode.series.creators.id);

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You unfollowed @${episode?.series?.creators?.profiles?.username || "this creator"}`,
        });
      } else {
        // Follow
        await supabase.from("subscriptions").insert({
          follower_id: user.id,
          creator_id: episode.series.creators.id,
        });

        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following @${episode?.series?.creators?.profiles?.username || "this creator"}`,
        });
      }
    } catch (error) {
      console.warn("Error handling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const success = await toggleLike();
    // Removed notification - silent like/unlike for better UX
  };

  const handleReshare = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsResharing(true);
    try {
      // Create a reshare post in the user's feed
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        post_type: "reshared_episode",
        reshared_episode_id: episode.id,
        content: null,
        privacy_setting: "public",
      });

      if (error) throw error;

      // Record the reshare interaction
      await supabase.from("interactions").insert({
        user_id: user.id,
        target_id: episode.id,
        target_type: "episode",
        interaction_type: "reshare",
      });

      toast({
        title: "Reshared!",
        description: "Episode shared to your feed",
      });
    } catch (error) {
      console.warn("Error resharing:", error);
      toast({
        title: "Error",
        description: "Failed to reshare. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResharing(false);
    }
  };

  const handleShare = async () => {
    if (!episode?.series?.id) {
      console.warn("Cannot share episode without series:", episode.id);
      return;
    }

    const shareData = {
      title: episode.title,
      text: episode.description,
      url: `${window.location.origin}/series/${episode.series.id}?episode=${episode.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Episode link copied to clipboard",
        });
      } catch (err) {
        console.warn("Copy to clipboard failed:", err);
      }
    }
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleEpisodeSelect = (episodeId: string, episodeNumber: number) => {
    if (!episode?.series?.id) return;

    // Check if series is premium and episode is locked (episode > 1)
    const isPremiumSeries = episode?.series?.is_premium;
    const isLocked = isPremiumSeries && episodeNumber > 1;

    if (isLocked && !user) {
      // Show auth prompt for non-authenticated users
      navigate("/auth");
      return;
    }

    if (isLocked) {
      // Show premium prompt for locked episodes
      setShowEpisodeSelector(false);
      setShowPremiumPrompt(true);
      return;
    }

    setShowEpisodeSelector(false);
    // Navigate to the selected episode without page reload
    navigate(`/series/${episode.series.id}?episode=${episodeId}`);
  };

  return (
    <div
      className={`relative w-full h-full bg-black group ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Back to Home Button - Conditionally visible */}
      {showHomeButton && (
        <div className="absolute top-4 left-4 z-50 pointer-events-auto">
          <Button
            onClick={handleBackToHome}
            size="sm"
            className="bg-muted/60 hover:bg-muted/80 text-foreground border border-border/30 hover:border-border/50 backdrop-blur-md transition-all duration-300 rounded-full px-3 py-2 shadow-lg hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-medium">Home</span>
          </Button>
        </div>
      )}

      {/* Video Player - FIXED CONTAINER */}
      <div
        className={`absolute inset-0 w-full h-full ${playerClassName}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <OptimizedVideoPlayer
          videoUrl={episode.video_url}
          thumbnailUrl={episode.thumbnail_url}
          episodeId={episode.id}
          isPlaying={isPlaying}
          onPlayStateChange={onPlayStateChange}
          isMuted={isMuted}
          onMuteChange={onMuteChange}
          autoPlay={autoPlay}
          preload="metadata"
          nextVideoUrl={nextVideoUrl}
          showBackButton={false}
          controls={false}
          onProgressUpdate={handleProgressUpdate}
          className={`w-full h-full min-w-full min-h-full object-cover ${videoClassName}`}
        />

        {/* Hide provider overlays (e.g., YouTube title/3-dots) when paused */}
        {!isPlaying && (
          <div className="absolute top-0 left-0 right-0 h-16 z-40 pointer-events-none bg-gradient-to-b from-black/70 to-transparent" />
        )}

        {/* Premium Badge - Always visible on thumbnail */}
        {(episode?.is_premium || episode?.series?.is_premium) && (
          <div className="absolute top-4 right-4 z-50 pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-bold">Premium</span>
            </div>
          </div>
        )}

        {/* Instagram-style side controls with higher z-index */}
        <div
          className={`absolute right-2 sm:right-3 bottom-24 sm:bottom-20 flex flex-col items-center space-y-4 sm:space-y-6 ${showEpisodeSelector ? "z-10" : "z-[60]"} pointer-events-none`}
        >
          {/* Like button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg disabled:opacity-50 ${
                isLiked
                  ? "bg-red-500/30 text-red-400 scale-110 border-red-400/50 shadow-red-500/25"
                  : "bg-muted/50 text-foreground hover:bg-muted/70 hover:scale-110 border-border/20 hover:border-border/40"
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current animate-pulse" : ""}`} />
            </button>
            <span className="text-white text-xs mt-1 font-medium drop-shadow-lg">{formatViews(likesCount)}</span>
          </div>

          {/* Comment button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <button
              onClick={() => {
                if (!user) {
                  navigate("/auth");
                  return;
                }
                if (!episode?.series?.id) {
                  console.warn("Episode has no series associated:", episode.id);
                  return;
                }
                navigate(`/series/${episode.series.id}?episode=${episode.id}&comments=true`);
              }}
              className="p-3 rounded-full bg-muted/50 text-foreground hover:bg-muted/70 hover:scale-110 backdrop-blur-md border border-border/20 hover:border-border/40 transition-all duration-300 shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <span className="text-white text-xs mt-1 font-medium drop-shadow-lg">{commentsCount}</span>
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-muted/50 text-foreground hover:bg-muted/70 hover:scale-110 backdrop-blur-md border border-border/20 hover:border-border/40 transition-all duration-300 shadow-lg"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <span className="text-white text-xs mt-1 font-medium drop-shadow-lg">Share</span>
          </div>

          {/* Reshare button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <button
              onClick={handleReshare}
              disabled={isResharing}
              className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg disabled:opacity-50 ${
                isResharing
                  ? "bg-green-500/30 text-green-400 border-green-400/50 shadow-green-500/25"
                  : "bg-muted/50 text-foreground hover:bg-muted/70 hover:scale-110 border-border/20 hover:border-border/40"
              }`}
            >
              <Repeat2 className="w-6 h-6" />
            </button>
            <span className="text-white text-xs mt-1 font-medium drop-shadow-lg">Reshare</span>
          </div>

          {/* Episodes button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <button
              onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
              className="p-3 rounded-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 text-white hover:from-purple-600/60 hover:to-pink-600/60 hover:scale-110 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 shadow-lg"
            >
              <List className="w-6 h-6" />
            </button>
            <span className="text-white text-xs mt-1 font-medium drop-shadow-lg">Episodes</span>
          </div>

          {/* Watch Series button - moved to right side */}
          {showSeriesButton && episode?.series?.id && (
            <div className="flex flex-col items-center pointer-events-auto">
              <button
                onClick={async () => {
                  window.dispatchEvent(new CustomEvent("pause-all-videos"));
                  const { data: firstEpisode } = await supabase
                    .from("episodes")
                    .select("id")
                    .eq("series_id", episode.series.id)
                    .eq("episode_number", 1)
                    .single();
                  if (firstEpisode) {
                    navigate(`/series/${episode.series.id}?episode=${firstEpisode.id}`);
                  } else {
                    navigate(`/series/${episode.series.id}`);
                  }
                }}
                className="p-3 rounded-full bg-gradient-to-br from-pink-500/50 to-purple-500/50 text-white hover:from-pink-600/60 hover:to-purple-600/60 hover:scale-110 backdrop-blur-md border border-pink-400/30 hover:border-pink-400/50 transition-all duration-300 shadow-lg"
              >
                <PlaySquare className="w-6 h-6" />
              </button>
              <span className="text-white text-xs mt-1 font-medium drop-shadow-lg">Series</span>
            </div>
          )}
        </div>

        {/* Premium Prompt Modal */}
        {showPremiumPrompt && (
          <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 pointer-events-auto p-4">
            <Card className="max-w-md w-full bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-2 border-yellow-400/50 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Lock className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-white text-2xl font-bold mb-3">Premium Episode</h3>

                <p className="text-white/90 text-base mb-6 leading-relaxed">
                  This is episode {episode.episode_number} of {episode.series.title}. Subscribe to unlock all episodes!
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/subscription")}
                    className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Get Premium Access
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowPremiumPrompt(false)}
                    className="w-full border-white/30 text-white hover:bg-white/10 py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Episode Selector Modal */}
        {showEpisodeSelector && (
          <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-auto">
            <div className="bg-background/95 backdrop-blur-lg rounded-t-2xl border-t-2 border-border/50 p-4 max-h-[70vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
                <h3 className="text-foreground font-semibold text-base">All Episodes</h3>
                <button
                  onClick={() => setShowEpisodeSelector(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Episodes List */}
              {loadingEpisodes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                </div>
              ) : allEpisodes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {allEpisodes.map((ep) => {
                    const isPremiumSeries = episode?.series?.is_premium;
                    const isLocked = ep.is_premium || (isPremiumSeries && ep.episode_number > 1);

                    return (
                      <button
                        key={ep.id}
                        onClick={() => handleEpisodeSelect(ep.id, ep.episode_number)}
                        disabled={ep.id === episode.id}
                        className={`relative flex items-center gap-3 p-2 rounded-xl transition-all overflow-hidden ${
                          ep.id === episode.id
                            ? "bg-purple-500/20 border-2 border-purple-500"
                            : "bg-muted/50 border border-border/30 hover:bg-muted hover:border-purple-400/50"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={ep.thumbnail_url}
                            alt={`Episode ${ep.episode_number}`}
                            className={`w-full h-full object-cover ${isLocked ? "opacity-50" : ""}`}
                          />
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-yellow-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-purple-500 font-bold text-sm">EP {ep.episode_number}</span>
                            {isLocked && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/50 text-xs">
                                Premium
                              </Badge>
                            )}
                            {ep.id === episode.id && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <p
                            className={`font-medium text-sm line-clamp-2 ${isLocked ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {ep.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">No episodes available</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Channel info and details - always visible */}
      {/* Bottom overlay with episode info - Always visible */}
      <div className="absolute bottom-0 left-0 right-0 video-overlay p-3 sm:p-4 z-40">
        <div className="flex items-end justify-between pr-16 sm:pr-20">
          {/* Left: Creator info and episode details */}
          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
            {/* Creator Avatar */}
            {episode?.series?.creators?.id ? (
              <Link to={`/creator/${episode.series.creators.id}`}>
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-white/30 hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <AvatarImage src={episode.series.creators.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                    {episode.series.creators.profiles?.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-white/30 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                  U
                </AvatarFallback>
              </Avatar>
            )}

            {/* Content Info */}
            <div className="flex-1 min-w-0">
              {/* Channel Name and Follow Button */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 mb-0.5 sm:mb-1">
                {episode?.series?.creators?.id ? (
                  <>
                    <Link
                      to={`/creator/${episode.series.creators.id}`}
                      className="text-white font-semibold text-xs sm:text-sm hover:text-purple-300 transition-colors duration-300 truncate"
                    >
                      @{episode.series.creators.profiles?.username || "Unknown"}
                    </Link>
                    {episode.series.creators.verified && (
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-white font-semibold text-sm truncate">@Unknown</span>
                )}

                {/* Follow Button */}
                {episode?.series?.creators?.id && (
                  <Button
                    size="sm"
                    onClick={handleFollow}
                    disabled={isFollowLoading || !user}
                    className={`follow-button h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs font-medium rounded-full transition-all duration-300 flex-shrink-0 ${
                      isFollowing
                        ? "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
                        : "bg-muted/20 text-foreground hover:bg-muted/30 border border-border/50"
                    }`}
                  >
                    {isFollowLoading ? (
                      <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Episode Stats */}
              <div className="episode-stats">
                <div className="stat-item">
                  <Eye className="w-3 h-3" />
                  <span>{formatViews(episode.views)}</span>
                </div>
                <div className="stat-item">
                  <Heart className="w-3 h-3" />
                  <span>{formatViews(likesCount)}</span>
                </div>
                <div className="stat-item">
                  <MessageCircle className="w-3 h-3" />
                  <span>{commentsCount}</span>
                </div>
                <span className="text-white/50">{new Date(episode.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
