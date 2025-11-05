import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Lock, Play, X } from 'lucide-react';
import { useIOSAudio } from '@/hooks/useIOSAudio';

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  is_premium?: boolean;
  video_url: string;
}

interface Series {
  id: string;
  title: string;
  is_premium?: boolean;
}

interface PremiumVideoPlayerProps {
  episode: Episode;
  series: Series;
  onClose?: () => void;
}

export const PremiumVideoPlayer: React.FC<PremiumVideoPlayerProps> = ({
  episode,
  series,
  onClose
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { isIOS, enableAudioForVideo } = useIOSAudio();

  // For premium series, show premium prompt after 2 minutes for first episode
  // For other episodes, show immediately
  const shouldShowPremiumPrompt = () => {
    if (!series.is_premium) return false;
    
    if (episode.episode_number === 1) {
      return watchTime >= 120; // 2 minutes
    }
    
    return true; // Show immediately for other episodes
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setWatchTime(video.currentTime);
      
      if (shouldShowPremiumPrompt() && !showPremiumPrompt) {
        setShowPremiumPrompt(true);
        video.pause();
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [watchTime, showPremiumPrompt, episode.episode_number, series.is_premium]);

  const handleSubscribeClick = () => {
    navigate('/subscription');
  };

  const handleContinueWatching = async () => {
    setShowPremiumPrompt(false);
    if (videoRef.current) {
      // Enable audio on iOS during user interaction
      if (isIOS && !hasInteracted) {
        enableAudioForVideo(videoRef.current);
        setHasInteracted(true);
      }
      try {
        await videoRef.current.play();
      } catch (error) {
        console.warn('Play error:', error);
        // On iOS, don't force mute - wait for user interaction
        if (error?.name === 'NotAllowedError' && isIOS && !hasInteracted) {
          // Wait for user interaction
          return;
        }
      }
    }
  };

  const handlePlayClick = async () => {
    if (videoRef.current) {
      // Enable audio on iOS during user interaction
      if (isIOS && !hasInteracted) {
        enableAudioForVideo(videoRef.current);
        setHasInteracted(true);
      }
      try {
        await videoRef.current.play();
      } catch (error) {
        console.warn('Play error:', error);
        // On iOS, don't force mute - wait for user interaction
        if (error?.name === 'NotAllowedError' && isIOS && !hasInteracted) {
          // Wait for user interaction
          return;
        }
      }
    }
  };

  const isPremiumContent = series.is_premium && (episode.episode_number > 1 || showPremiumPrompt);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls={true}
        poster={`/api/placeholder/1920/1080`}
        preload="metadata"
        playsInline
        webkit-playsinline="true"
        disablePictureInPicture
        crossOrigin="anonymous"
        onClick={handlePlayClick}
        onTouchStart={(e) => {
          // iOS requires user interaction for audio
          if (isIOS && !hasInteracted && videoRef.current) {
            setHasInteracted(true);
            enableAudioForVideo(videoRef.current);
          }
        }}
      >
        <source src={episode.video_url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Close Button - Removed as per requirements */}

      {/* Premium Prompt Overlay */}
      {showPremiumPrompt && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
          <Card className="max-w-md mx-4 bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-2 border-yellow-400/50 shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Crown className="w-16 h-16 text-yellow-400 animate-pulse" />
                  <Lock className="absolute -bottom-1 -right-1 w-6 h-6 text-red-400" />
                </div>
              </div>

              <h3 className="text-white text-xl font-bold mb-2">
                Premium Content
              </h3>
              
              <p className="text-white/80 text-sm mb-4">
                {episode.episode_number === 1 
                  ? "Continue watching this premium series with our exclusive subscription!"
                  : "This episode is premium content. Upgrade to watch the full series!"
                }
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleSubscribeClick}
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe for ₹1
                </Button>

                {episode.episode_number === 1 && watchTime < 300 && (
                  <Button
                    variant="outline"
                    onClick={handleContinueWatching}
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue Free Preview
                  </Button>
                )}
              </div>

              <p className="text-white/50 text-xs mt-4">
                Premium features include unlimited access to all series, ad-free experience, and exclusive content.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Premium Content Blocked */}
      {isPremiumContent && !showPremiumPrompt && episode.episode_number > 1 && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
          <Card className="max-w-md mx-4 bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-2 border-yellow-400/50">
            <CardContent className="p-6 text-center">
              <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">
                Premium Episode
              </h3>
              <p className="text-white/80 text-sm mb-4">
                This is episode {episode.episode_number} of {series.title}. Subscribe to unlock all episodes!
              </p>
              <Button
                onClick={handleSubscribeClick}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Crown className="w-4 h-4 mr-2" />
                Get Premium Access
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};