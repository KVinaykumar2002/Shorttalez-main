import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';
import { AnimatedImageLogo } from '@/components/AnimatedImageLogo';

const Index = () => {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Handle navigation after auth is initialized
  useEffect(() => {
    if (initialized && !showLoading) {
      if (user) {
        console.log('User authenticated, navigating to home');
        navigate('/home', { replace: true });
      } else {
        console.log('User not authenticated, navigating to auth');
        navigate('/auth', { replace: true });
      }
    }
  }, [user, initialized, showLoading, navigate]);

  if (loading || !initialized) {
    return (
      <MovieThemedLoadingScreen message="Initializing your cinematic experience..." />
    );
  }

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Show consistent loading while navigation is happening
  return (
    <MovieThemedLoadingScreen message="Preparing your experience..." />
  );
};

export default Index;
