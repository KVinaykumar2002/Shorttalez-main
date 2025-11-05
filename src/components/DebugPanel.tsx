import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Bug, RefreshCw, Trash2 } from 'lucide-react';
import { AppHealthMonitor } from '@/utils/errorRecovery';

interface DebugPanelProps {
  show?: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ show = false }) => {
  const { user, session, loading, initialized } = useAuth();
  const [isVisible, setIsVisible] = useState(show);
  const [healthStats, setHealthStats] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      const monitor = AppHealthMonitor.getInstance();
      setHealthStats(monitor.getHealthStatus());
      
      const interval = setInterval(() => {
        setHealthStats(monitor.getHealthStatus());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Show debug panel in development or when URL contains debug=true
  const shouldShow = process.env.NODE_ENV === 'development' || 
                   new URLSearchParams(window.location.search).get('debug') === 'true';

  if (!shouldShow && !show) return null;

  const clearAllCaches = async () => {
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear localStorage except auth
      const authData = localStorage.getItem('supabase.auth.token');
      localStorage.clear();
      if (authData) {
        localStorage.setItem('supabase.auth.token', authData);
      }
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      console.log('All caches cleared');
      alert('Caches cleared successfully!');
    } catch (error) {
      console.error('Failed to clear caches:', error);
      alert('Failed to clear caches');
    }
  };

  const forceReload = () => {
    // Use navigate instead of hard reload to maintain SPA behavior
    window.location.reload();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Bug className="w-4 h-4 mr-1" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Panel
            </div>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="space-y-1">
            <div className="font-semibold">Auth Status:</div>
            <div className="pl-2 space-y-1">
              <div>Loading: {loading ? '✅' : '❌'}</div>
              <div>Initialized: {initialized ? '✅' : '❌'}</div>
              <div>User: {user ? '✅' : '❌'}</div>
              <div>Session: {session ? '✅' : '❌'}</div>
              {user && (
                <div>Email: {user.email}</div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold">Page Info:</div>
            <div className="pl-2 space-y-1">
              <div>Path: {window.location.pathname}</div>
              <div>Origin: {window.location.origin}</div>
              <div>SW: {'serviceWorker' in navigator ? '✅' : '❌'}</div>
            </div>
          </div>

          {healthStats && (
            <div className="space-y-1">
              <div className="font-semibold">App Health:</div>
              <div className="pl-2 space-y-1">
                <div>Errors: {healthStats.errorCount}</div>
                <div>Recoveries: {healthStats.recoveryAttempts}</div>
                <div>Status: {healthStats.isHealthy ? '✅' : '⚠️'}</div>
                {healthStats.lastError && (
                  <div className="text-red-600 text-xs">
                    Last: {healthStats.lastError.substring(0, 30)}...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={clearAllCaches}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Cache
            </Button>
            <Button
              onClick={forceReload}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};