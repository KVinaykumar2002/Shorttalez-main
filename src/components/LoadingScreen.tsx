import React from 'react';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  return (
    <MovieThemedLoadingScreen
      onComplete={onComplete}
      message="Mee cinematic experience ki welcome..."
    />
  );
};