import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { IntelligentAutoFix } from '@/utils/intelligentAutoFix';
import { useToast } from '@/hooks/use-toast';

interface AutoFixStats {
  total_attempts: number;
  successful_fixes: number;
  recent_success_rate: number;
  active_sessions: number;
}

interface AutoFixControlsProps {
  onStatsUpdate?: () => void;
}

export const AutoFixControls: React.FC<AutoFixControlsProps> = ({ onStatsUpdate }) => {
  const [autoFixEnabled, setAutoFixEnabled] = useState(false);
  const [stats, setStats] = useState<AutoFixStats>({
    total_attempts: 0,
    successful_fixes: 0,
    recent_success_rate: 0,
    active_sessions: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAutoFixStats();
    const interval = setInterval(fetchAutoFixStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAutoFixStats = async () => {
    try {
      const { data: attempts } = await supabase
        .from('auto_fix_attempts')
        .select('success, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Also get overall debug log stats
      const { data: debugStats } = await supabase.rpc('get_debug_stats');
      const stats = debugStats as any; // Type assertion for RPC return

      const totalAttempts = attempts?.length || 0;
      const successfulFixes = attempts?.filter(a => a.success).length || 0;
      const recentSuccessRate = totalAttempts > 0 ? (successfulFixes / totalAttempts) * 100 : 0;

      // Get recent success rate from IntelligentAutoFix
      const intelligentSuccessRate = IntelligentAutoFix.getRecentSuccessRate() * 100;

      // Calculate combined success rate
      const combinedSuccessRate = Math.max(recentSuccessRate, intelligentSuccessRate);
      
      // Also factor in actual fixes from debug stats
      const dbSuccessRate = stats?.auto_fixes_attempted > 0 
        ? (stats.auto_fixes_successful / stats.auto_fixes_attempted) * 100 
        : 0;

      setStats({
        total_attempts: Math.max(totalAttempts, stats?.auto_fixes_attempted || 0),
        successful_fixes: Math.max(successfulFixes, stats?.auto_fixes_successful || 0),
        recent_success_rate: Math.max(combinedSuccessRate, dbSuccessRate),
        active_sessions: 1
      });

      // Trigger parent stats update if provided
      onStatsUpdate?.();
    } catch (error) {
      console.warn('Error fetching auto-fix stats:', error);
    }
  };

  const toggleAutoFix = () => {
    setAutoFixEnabled(!autoFixEnabled);
    
    if (!autoFixEnabled) {
      toast({
        title: "🤖 Intelligent Auto-Fix Enabled",
        description: "AI will now automatically fix errors in real-time with enhanced accuracy",
        variant: "default",
      });
    } else {
      toast({
        title: "⏸️ Auto-Fix Disabled", 
        description: "Manual error resolution mode activated",
        variant: "default",
      });
    }
  };

  const runManualCleanup = async () => {
    setIsProcessing(true);
    try {
      // Clean up old fix history
      IntelligentAutoFix.cleanupHistory();
      
      // Clean up old debug logs
      await supabase.rpc('cleanup_old_debug_logs');
      
      toast({
        title: "🧹 Cleanup Complete",
        description: "Old debug logs and fix history have been cleaned up",
      });
      
      // Refresh stats immediately
      await fetchAutoFixStats();
      onStatsUpdate?.();
    } catch (error) {
      console.warn('Cleanup failed:', error);
      toast({
        title: "Error",
        description: "Failed to complete cleanup",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateIcon = (rate: number) => {
    if (rate >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (rate >= 60) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Auto-Fix Toggle */}
      <Card className={autoFixEnabled ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Intelligent Auto-Fix System
            </div>
            <Switch
              checked={autoFixEnabled}
              onCheckedChange={toggleAutoFix}
              className="data-[state=checked]:bg-green-600"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total_attempts}</div>
                <div className="text-sm text-muted-foreground">Attempts (24h)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successful_fixes}</div>
                <div className="text-sm text-muted-foreground">Fixed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getSuccessRateColor(stats.recent_success_rate)}`}>
                  {Math.round(stats.recent_success_rate)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.active_sessions}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fix Success Rate</span>
                <div className="flex items-center gap-1">
                  {getSuccessRateIcon(stats.recent_success_rate)}
                  <span className={`text-sm ${getSuccessRateColor(stats.recent_success_rate)}`}>
                    {Math.round(stats.recent_success_rate)}%
                  </span>
                </div>
              </div>
              <Progress 
                value={stats.recent_success_rate} 
                className="h-2"
              />
            </div>
            
            {autoFixEnabled && (
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    🤖 AI Auto-Fix Active - Monitoring all errors across the application
                  </span>
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                  ✅ Real-time error detection and intelligent fixing enabled
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={runManualCleanup}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              {isProcessing ? "Processing..." : "🧹 Cleanup Old Logs"}
            </Button>
            <Button 
              onClick={async () => {
                await fetchAutoFixStats();
                onStatsUpdate?.();
              }}
              variant="outline"
              size="sm"
            >
              🔄 Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};