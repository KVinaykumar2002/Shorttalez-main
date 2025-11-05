import { useState, useEffect } from "react";
import FeedScreen from "@/components/ui/shorttalez/FeedScreen";
import type { VideoItem } from "@/components/ui/shorttalez/types";
import { toast } from "@/components/ui/use-toast";
import { useVideoPrefetch } from "@/hooks/useVideoPrefetch";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { Button } from "@/components/ui/button";

// Mock video data for demo
const mockVideos: VideoItem[] = [
  {
    id: "1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    duration: 596,
    caption: "Amazing short film about a bunny 🐰 #animation #shortfilm #creative",
    autoCaptions: "Watch this incredible animated story about Big Buck Bunny and his adventures in the forest.",
    isLiked: false,
    likesCount: 1250,
    commentsCount: 89,
    isFollowed: false,
    creator: {
      id: "creator1",
      name: "AnimationStudio",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimationStudio"
    }
  },
  {
    id: "2", 
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    duration: 653,
    caption: "Dreams can take you anywhere... 🐘✨ #dreams #animation #artistic #shortfilm",
    isLiked: true,
    likesCount: 2100,
    commentsCount: 156,
    isFollowed: true,
    creator: {
      id: "creator2", 
      name: "DreamMaker",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DreamMaker"
    }
  },
  {
    id: "3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: 15,
    caption: "When the beat drops 🔥🎵 #music #fire #energy",
    isLiked: false,
    likesCount: 892,
    commentsCount: 34,
    isFollowed: false,
    creator: {
      id: "creator3",
      name: "BeatMaster",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=BeatMaster"
    }
  }
];

export default function ShortTalezDemo() {
  const [videos, setVideos] = useState(mockVideos);
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'upload' | 'inbox' | 'profile'>('home');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);
  
  const networkInfo = useNetworkInfo();
  const { stats, clearCache, getCacheStats, isPrefetching } = useVideoPrefetch(
    videos,
    currentVideoIndex,
    {
      enabled: true,
      wifiOnly: false, // Allow prefetch on cellular for demo
      aheadCount: networkInfo.isWiFi ? 3 : 1,
      behindCount: 1,
    }
  );

  // Show network status toast on mount
  useEffect(() => {
    const connectionType = networkInfo.isWiFi ? 'WiFi' : 
                          networkInfo.effectiveType.toUpperCase();
    
    toast({
      title: "🚀 Video Optimization Active",
      description: `Connected via ${connectionType}. Prefetching ${networkInfo.isWiFi ? '3' : '1'} videos ahead.`,
      duration: 3000,
    });
  }, []);

  const handleToggleLike = (videoId: string) => {
    setVideos(prev => prev.map(video => {
      if (video.id === videoId) {
        return {
          ...video,
          isLiked: !video.isLiked,
          likesCount: video.isLiked ? video.likesCount - 1 : video.likesCount + 1
        };
      }
      return video;
    }));
    
    toast({
      title: "Like updated!",
      description: "Video like status has been changed.",
      duration: 1000,
    });
  };

  const handleOpenComments = (videoId: string) => {
    toast({
      title: "Comments",
      description: `Opening comments for video ${videoId}`,
    });
  };

  const handleShare = (videoId: string) => {
    toast({
      title: "Share",
      description: `Sharing video ${videoId}`,
    });
  };

  const handleFollow = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, isFollowed: !v.isFollowed } : v
      ));
      
      toast({
        title: video.isFollowed ? "Unfollowed" : "Following",
        description: `${video.isFollowed ? 'Unfollowed' : 'Now following'} @${video.creator.name}`,
      });
    }
  };

  const handleQuickRecord = () => {
    toast({
      title: "Quick Record",
      description: "Opening camera for quick recording...",
    });
  };

  const handleOpenEditor = () => {
    toast({
      title: "Editor",
      description: "Opening video editor...",
    });
  };

  const handleTabChange = (tab: 'home' | 'discover' | 'upload' | 'inbox' | 'profile') => {
    setActiveTab(tab);
    toast({
      title: `${tab.charAt(0).toUpperCase() + tab.slice(1)}`,
      description: `Switched to ${tab} tab`,
      duration: 1000,
    });
  };

  const handleClearCache = async () => {
    await clearCache();
    toast({
      title: "Cache Cleared",
      description: "All cached videos have been removed",
    });
  };

  const handleShowStats = async () => {
    const cacheStats = await getCacheStats();
    setShowStats(true);
    
    toast({
      title: "📊 Performance Stats",
      description: (
        <div className="space-y-1 text-xs">
          <div>Cache Hit Rate: {(stats.hitRate * 100).toFixed(1)}%</div>
          <div>Videos Cached: {cacheStats.memoryEntries + cacheStats.diskEntries}</div>
          <div>Cache Size: {cacheStats.totalSizeMB.toFixed(1)} MB</div>
          <div>Data Downloaded: {(stats.bytesTransferred / 1024 / 1024).toFixed(1)} MB</div>
          <div>Network: {networkInfo.isWiFi ? 'WiFi' : networkInfo.effectiveType.toUpperCase()}</div>
        </div>
      ),
      duration: 8000,
    });
  };

  return (
    <div className="min-h-screen cheelee-gradient relative">
      {/* Performance Stats Overlay (top-right) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleShowStats}
          className="backdrop-blur-sm bg-black/50 text-white text-xs"
        >
          📊 Stats
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleClearCache}
          className="backdrop-blur-sm bg-black/50 text-white text-xs"
        >
          🗑️ Clear Cache
        </Button>
      </div>

      {/* Prefetch Status Indicator */}
      {isPrefetching && (
        <div className="fixed top-20 right-4 z-50 backdrop-blur-sm bg-blue-500/20 text-white px-3 py-1 rounded-full text-xs">
          ⬇️ Prefetching...
        </div>
      )}

      <FeedScreen
        videos={videos}
        onToggleLike={handleToggleLike}
        onOpenComments={handleOpenComments}
        onShare={handleShare}
        onFollow={handleFollow}
        onQuickRecord={handleQuickRecord}
        onOpenEditor={handleOpenEditor}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        onVideoIndexChange={setCurrentVideoIndex}
      />
    </div>
  );
}