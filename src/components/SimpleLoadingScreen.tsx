import React from 'react';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';

interface SimpleLoadingScreenProps {
  message?: string;
}

export const SimpleLoadingScreen: React.FC<SimpleLoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <MovieThemedLoadingScreen message={message} />
  );
};