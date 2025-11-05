import React from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { AdminFloatingButton } from '@/components/AdminFloatingButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth();
  const { isVideoPlayerActive } = useVideoPlayer();

  if (loading) {
    return <SimpleLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1">
        {requireAuth && !user ? (
          <AuthGuard />
        ) : (
          children
        )}
      </main>
      {!isVideoPlayerActive && <BottomNavigation />}
      <AdminFloatingButton />
    </div>
  );
};