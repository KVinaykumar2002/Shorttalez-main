import React, { createContext, useContext, useState } from 'react';

interface VideoPlayerContextType {
  isVideoPlayerActive: boolean;
  setVideoPlayerActive: (active: boolean) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false);

  const setVideoPlayerActive = (active: boolean) => {
    setIsVideoPlayerActive(active);
  };

  return (
    <VideoPlayerContext.Provider value={{ isVideoPlayerActive, setVideoPlayerActive }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};