import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DebugLogger from "./components/DebugLogger";
import ErrorBoundary from "./components/ErrorBoundary";
import { DebugPanel } from "./components/DebugPanel";
import { DebugCleanup } from "./components/DebugCleanup";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import VideosPage from "./pages/VideosPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import SeriesPage from "./pages/SeriesPage";
import CreatorPage from "./pages/CreatorPage";
import UploadPage from "./pages/UploadPage";
import BulkUploadPage from "./pages/BulkUploadPage";
import DashboardPage from "./pages/DashboardPage";
import MigrationPage from "./pages/MigrationPage";
import FeedPage from "./pages/FeedPage";
import NotFound from "./pages/NotFound";
import IOSAudioTestPage from "./pages/IOSAudioTestPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import { initAppHealthMonitoring, manageServiceWorker, recoverFromBlankPage } from "./utils/errorRecovery";
import { initPerformanceOptimizations } from "./utils/performanceOptimizations";
import { ExternalErrorHandler } from "./utils/externalErrorHandler";
import "./utils/triggerDebugCleanup"; // Auto-trigger debug cleanup

// Create optimized query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Initialize app monitoring and recovery on mount
  React.useEffect(() => {
    try {
      initAppHealthMonitoring();
      manageServiceWorker();
      initPerformanceOptimizations();
      ExternalErrorHandler.init(); // Initialize external error filtering
      
      
      // Check for blank page on load
      const checkBlankPage = () => {
        const appRoot = document.getElementById('root');
        if (appRoot && appRoot.children.length === 0) {
          recoverFromBlankPage();
        }
      };
      
      // Check immediately and after a delay
      checkBlankPage();
      setTimeout(checkBlankPage, 2000);
      
      console.log('App initialization complete');
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider>
              <VideoPlayerProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <DebugLogger />
              <DebugCleanup />
              <DebugPanel />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/home" element={<Layout><HomePage /></Layout>} />
                  <Route path="/feed" element={<Layout requireAuth><FeedPage /></Layout>} />
                  <Route path="/videos" element={<Layout><VideosPage /></Layout>} />
                  <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
                  <Route path="/user/:username" element={<Layout><PublicProfilePage /></Layout>} />
                  <Route path="/series/:id" element={<SeriesPage />} />
                  <Route path="/creator/:id" element={<Layout><CreatorPage /></Layout>} />
                  <Route path="/upload" element={<Layout requireAuth><UploadPage /></Layout>} />
                  <Route path="/bulk-upload" element={<Layout requireAuth><BulkUploadPage /></Layout>} />
                  <Route path="/dashboard" element={<Layout requireAuth><DashboardPage /></Layout>} />
                  <Route path="/migration" element={<Layout requireAuth><MigrationPage /></Layout>} />
                  <Route path="/test-ios-audio" element={<IOSAudioTestPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </TooltipProvider>
              </VideoPlayerProvider>
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;