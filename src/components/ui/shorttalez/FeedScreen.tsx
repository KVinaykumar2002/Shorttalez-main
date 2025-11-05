import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "./VideoPlayer";
import BottomNav from "./BottomNav";
import UploadFab from "./UploadFab";
import OnboardingOverlay from "./OnboardingOverlay";
import CommentsModal from "./CommentsModal";
import type { VideoItem } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedScreenProps {
  videos: VideoItem[];
  onToggleLike: (videoId: string) => void;
  onOpenComments: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  onFollow?: (videoId: string) => void;
  onQuickRecord: () => void;
  onOpenEditor: () => void;
  onTabChange: (tab: 'home' | 'discover' | 'upload' | 'inbox' | 'profile') => void;
  activeTab?: 'home' | 'discover' | 'upload' | 'inbox' | 'profile';
  onVideoIndexChange?: (index: number) => void; // New callback for prefetch
}

export default function FeedScreen({
  videos,
  onToggleLike,
  onOpenComments,
  onShare,
  onFollow,
  onQuickRecord,
  onOpenEditor,
  onTabChange,
  activeTab = 'home',
  onVideoIndexChange,
}: FeedScreenProps) {
  const { t } = useLanguage();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const touchStartY = useRef(0);

  // Notify parent of video index changes for prefetch
  useEffect(() => {
    onVideoIndexChange?.(currentVideoIndex);
  }, [currentVideoIndex, onVideoIndexChange]);

  // Check for first time user
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('shorttalez-onboarding-seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Handle vertical swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isScrollingRef.current) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0 && currentVideoIndex < videos.length - 1) {
        // Swipe up - next video
        setCurrentVideoIndex(prev => prev + 1);
      } else if (deltaY < 0 && currentVideoIndex > 0) {
        // Swipe down - previous video
        setCurrentVideoIndex(prev => prev - 1);
      }
    }
  }, [currentVideoIndex, videos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentVideoIndex > 0) {
            setCurrentVideoIndex(prev => prev - 1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, videos.length]);

  if (!videos.length) {
    return (
      <div className="h-screen cheelee-gradient flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-2">📱</div>
          <h2 className="text-xl font-semibold mb-2">{t('feed.no_videos_yet', 'ui')}</h2>
          <p className="text-white/60">{t('feed.be_first_to_share', 'ui')}</p>
        </div>
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        <UploadFab onQuickRecord={onQuickRecord} onOpenEditor={onOpenEditor} />
      </div>
    );
  }

  const handleOpenCommentsWrapper = (videoId: string) => {
    setCommentsModalOpen(true);
    onOpenComments(videoId);
  };

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden dark-gradient">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full opacity-30"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideo.id}
            initial={{ 
              y: "100%",
              scale: 0.8,
              rotateX: 30
            }}
            animate={{ 
              y: 0,
              scale: 1,
              rotateX: 0
            }}
            exit={{ 
              y: "-100%",
              scale: 0.8,
              rotateX: -30
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            className="absolute inset-0"
          >
            <VideoPlayer
              video={currentVideo}
              onToggleLike={onToggleLike}
              onOpenComments={() => handleOpenCommentsWrapper(currentVideo.id)}
              onShare={onShare}
              onFollow={onFollow}
            />
          </motion.div>
        </AnimatePresence>

        {/* Modern Top Header */}
        <motion.div 
          className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.div
            className="glass-dark px-6 py-2 rounded-full border border-white/20"
            animate={{
              boxShadow: [
                "0 0 20px rgba(255,255,255,0.1)",
                "0 0 30px rgba(255,255,255,0.2)",
                "0 0 20px rgba(255,255,255,0.1)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-white text-xl font-bold text-center bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ShortTalez
            </h1>
          </motion.div>
        </motion.div>

        {/* Enhanced Video Progress Indicators */}
        {videos.length > 0 && (
          <motion.div 
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex space-x-1 glass-dark px-3 py-2 rounded-full border border-white/10">
              {videos.map((_, index) => (
                <motion.div
                  key={index}
                  className={`rounded-full transition-all duration-500 ${
                    index === currentVideoIndex 
                      ? 'bg-gradient-to-r from-pink-500 to-cyan-500' 
                      : 'bg-white/20'
                  }`}
                  animate={{ 
                    width: index === currentVideoIndex ? 24 : 6,
                    height: 6,
                    opacity: index === currentVideoIndex ? 1 : 0.5
                  }}
                  transition={{ 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      <UploadFab onQuickRecord={onQuickRecord} onOpenEditor={onOpenEditor} />

      <CommentsModal
        isOpen={commentsModalOpen}
        onClose={() => setCommentsModalOpen(false)}
        commentsCount={currentVideo?.commentsCount || 152}
      />

      <OnboardingOverlay
        show={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('shorttalez-onboarding-seen', 'true');
        }}
      />
    </div>
  );
}