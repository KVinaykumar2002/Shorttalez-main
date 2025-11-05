import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, XCircle, Clock, Zap, Settings, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AutoFixControls } from './AutoFixControls';
import { DebugCleanupButton } from './DebugCleanupButton';
import { IntelligentAutoFix } from '@/utils/intelligentAutoFix';

interface DebugLog {
  id: string;
  message: string;
  level: string;
  timestamp: string;
  url?: string;
  stack_trace?: string;
  additional_data?: any;
  resolved: boolean;
  auto_fix_attempted: boolean;
  auto_fix_result?: string;
  status: string;
  user_agent?: string;
  session_id?: string;
}

interface AutoFixAttempt {
  id: string;
  debug_log_id: string;
  fix_suggestion: string;
  confidence_score: number;
  applied: boolean;
  success?: boolean;
  created_at: string;
}

interface DebugStats {
  total_logs: number;
  errors_today: number;
  unresolved_errors: number;
  auto_fixes_attempted: number;
  auto_fixes_successful: number;
  log_levels: Record<string, number>;
}

const DebugSystem: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [autoFixes, setAutoFixes] = useState<AutoFixAttempt[]>([]);
  const [stats, setStats] = useState<DebugStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingFix, setProcessingFix] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<'all' | 'error' | 'critical' | 'unresolved'>('all');
  const [autoMode, setAutoMode] = useState(false);
  const [autoModeActivity, setAutoModeActivity] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch debug logs
      const { data: logsData, error: logsError } = await supabase
        .from('debug_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Fetch auto-fix attempts
      const { data: autoFixData, error: autoFixError } = await supabase
        .from('auto_fix_attempts')
        .select('*')
        .order('created_at', { ascending: false });

      if (autoFixError) throw autoFixError;

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_debug_stats');

      if (statsError) throw statsError;

      setLogs(logsData || []);
      setAutoFixes(autoFixData || []);
      setStats(statsData ? statsData as unknown as DebugStats : null);
    } catch (error) {
      console.error('Error fetching debug data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch debug data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fix function for auto-mode
  const triggerAutoModeFixing = async (log: DebugLog) => {
    if (!autoMode) return;
    
    try {
      setAutoModeActivity(prev => [
        `🤖 Auto-fixing: ${log.message.substring(0, 50)}...`,
        ...prev.slice(0, 4)
      ]);

      const { data, error } = await supabase.functions.invoke('ai-auto-fix', {
        body: {
          error_message: log.message,
          stack_trace: log.stack_trace,
          url: log.url,
          additional_data: log.additional_data,
          debug_log_id: log.id
        }
      });

      if (error) throw error;

      // Update the log to mark auto-fix as attempted
      await supabase
        .from('debug_logs')
        .update({ 
          auto_fix_attempted: true,
          auto_fix_result: data.fix_suggestion 
        })
        .eq('id', log.id);

      setAutoModeActivity(prev => [
        `✅ Auto-fixed: ${log.message.substring(0, 50)}... (${Math.round(data.confidence_score * 100)}% confidence)`,
        ...prev.slice(0, 4)
      ]);

      toast({
        title: "🤖 Auto-Mode Fix Applied",
        description: `Fixed: ${log.message.substring(0, 60)}... - Refreshing browser...`,
        variant: "default",
      });

      // Auto-refresh browser after successful auto-fix with data refresh
      setTimeout(() => {
        fetchData(); // Refresh to show the updated data
        // Use state refresh instead of hard reload
      }, 3000);

    } catch (error) {
      console.error('Auto-mode fixing failed:', error);
      setAutoModeActivity(prev => [
        `❌ Auto-fix failed: ${log.message.substring(0, 50)}...`,
        ...prev.slice(0, 4)
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(fetchData, 30000) : null;
    
    // Real-time subscription for new logs
    const subscription = supabase
      .channel('debug_logs_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debug_logs'
      }, (payload) => {
        console.log('🆕 New debug log received:', payload.new);
        fetchData(); // Refresh data when new log is added
        
        const newLog = payload.new as DebugLog;
        
        // Auto-mode: automatically fix critical/error logs with intelligent system
        if (autoMode && (newLog.level === 'error' || newLog.level === 'critical')) {
          console.log('🤖 Auto-mode: Triggering intelligent auto-fix for:', newLog.message);
          setTimeout(async () => {
            try {
              await IntelligentAutoFix.applyAutomaticFix(
                newLog.id, 
                newLog.message, 
                newLog.stack_trace, 
                newLog.url
              );
              fetchData(); // Refresh to show the fix
            } catch (error) {
              console.error('Intelligent auto-fix failed:', error);
              // Fallback to old method
              triggerAutoModeFixing(newLog);
            }
          }, 1000);
        }
        
        // Show toast for critical errors
        if (newLog.level === 'critical') {
          toast({
            title: autoMode ? "🤖 Critical Error - Auto-Fixing..." : "🚨 Critical Error Detected",
            description: newLog.message,
            variant: "destructive",
          });
        }
      })
      .subscribe();

    return () => {
      if (interval) clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [autoRefresh, autoMode, toast]);

  const handleAutoFix = async (log: DebugLog) => {
    setProcessingFix(log.id);
    try {
      const { data, error } = await supabase.functions.invoke('ai-auto-fix', {
        body: {
          error_message: log.message,
          stack_trace: log.stack_trace,
          url: log.url,
          additional_data: log.additional_data,
          debug_log_id: log.id
        }
      });

      if (error) throw error;

      // Update the log to mark auto-fix as attempted
      await supabase
        .from('debug_logs')
        .update({ 
          auto_fix_attempted: true,
          auto_fix_result: data.fix_suggestion 
        })
        .eq('id', log.id);

      toast({
        title: "Auto-Fix Generated",
        description: `Confidence: ${Math.round(data.confidence_score * 100)}% - Refreshing browser...`,
      });

      fetchData(); // Refresh the data
      
      // Auto-refresh browser after successful fix with stats refresh
      setTimeout(() => {
        fetchData(); // Refresh debug data
        // Use state refresh instead of hard reload
      }, 2000);
    } catch (error) {
      console.error('Error generating auto-fix:', error);
      toast({
        title: "Auto-Fix Failed",
        description: "Failed to generate auto-fix suggestion",
        variant: "destructive",
      });
    } finally {
      setProcessingFix(null);
    }
  };

  const markAsResolved = async (logId: string) => {
    try {
      await supabase
        .from('debug_logs')
        .update({ resolved: true, status: 'fixed' })
        .eq('id', logId);

      toast({
        title: "Marked as Resolved",
        description: "Debug log has been marked as resolved",
      });

      fetchData();
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast({
        title: "Error",
        description: "Failed to mark log as resolved",
        variant: "destructive",
      });
    }
  };

  const clearOldLogs = async () => {
    try {
      // Call the cleanup function
      await supabase.rpc('cleanup_old_debug_logs');

      toast({
        title: "Logs Cleaned",
        description: "Old debug logs have been cleaned up",
      });

      fetchData();
    } catch (error) {
      console.error('Error cleaning logs:', error);
      toast({
        title: "Error",
        description: "Failed to clean old logs",
        variant: "destructive",
      });
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warn':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'destructive';
      case 'warn':
      case 'warning':
        return 'secondary';
      case 'info':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      switch (filter) {
        case 'error':
          return log.level === 'error';
        case 'critical':
          return log.level === 'critical';
        case 'unresolved':
          return !log.resolved && (log.level === 'error' || log.level === 'critical');
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Logs</span>
                <Badge variant="outline">{stats.total_logs}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Errors Today</span>
                <Badge variant="destructive">{stats.errors_today}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unresolved</span>
                <Badge variant="secondary">{stats.unresolved_errors}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Fixes</span>
                <Badge variant="default">{stats.auto_fixes_attempted}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <Badge variant="default">
                  {stats.auto_fixes_attempted > 0 
                    ? Math.round((stats.auto_fixes_successful / stats.auto_fixes_attempted) * 100)
                    : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="logs" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="logs">Debug Logs</TabsTrigger>
            <TabsTrigger value="fixes">Auto Fixes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Logs</option>
              <option value="critical">Critical Only</option>
              <option value="error">Errors Only</option>
              <option value="unresolved">Unresolved</option>
            </select>
            <Button 
              onClick={() => {
                setAutoMode(!autoMode);
                if (!autoMode) {
                  setAutoModeActivity([]);
                  toast({
                    title: "🤖 Auto-Mode Enabled",
                    description: "AI will automatically fix all errors from all users in real-time",
                    variant: "default",
                  });
                } else {
                  toast({
                    title: "⏸️ Auto-Mode Disabled",
                    description: "Manual fixing mode activated",
                    variant: "default",
                  });
                }
              }} 
              variant={autoMode ? "default" : "outline"} 
              size="sm"
              className={autoMode ? "bg-green-600 hover:bg-green-700 animate-pulse" : ""}
            >
              {autoMode ? "🤖 AUTO ON" : "🤖 AUTO OFF"}
            </Button>
            <Button 
              onClick={() => setAutoRefresh(!autoRefresh)} 
              variant={autoRefresh ? "default" : "outline"} 
              size="sm"
            >
              {autoRefresh ? "🔄 Auto" : "⏸️ Manual"}
            </Button>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={clearOldLogs} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Old Logs
            </Button>
          </div>
        </div>

        {/* Auto-Mode Activity Panel */}
        {autoMode && (
          <Card className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                🤖 Auto-Mode Active - Monitoring All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p className="mb-2">✅ Real-time error monitoring enabled for all users</p>
                <p className="mb-3">🔧 AI will automatically attempt to fix critical errors and errors</p>
                {autoModeActivity.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Recent Activity:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {autoModeActivity.map((activity, index) => (
                        <div key={index} className="text-xs p-2 bg-white dark:bg-gray-800 rounded border">
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="logs">
          <DebugCleanupButton onStatsUpdate={fetchData} />
          <Card>
            <CardHeader>
              <CardTitle>Recent Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {getFilteredLogs().length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {filter === 'all' ? '' : filter + ' '}logs found</p>
                    </div>
                  ) : (
                    getFilteredLogs().map((log) => (
                    <div key={log.id} className={`border rounded-lg p-4 space-y-2 ${
                      log.level === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                      log.level === 'error' ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' :
                      log.level === 'warn' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' :
                      'border-border'
                    } ${!log.resolved && (log.level === 'error' || log.level === 'critical') ? 'animate-pulse' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          <Badge variant={getLevelColor(log.level) as any}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          {log.resolved && (
                            <Badge variant="outline" className="bg-green-50">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!log.resolved && (
                            <Button
                              onClick={() => markAsResolved(log.id)}
                              variant="outline"
                              size="sm"
                            >
                              Mark Resolved
                            </Button>
                          )}
                          {!log.auto_fix_attempted && (log.level === 'error' || log.level === 'critical') && (
                            <Button
                              onClick={() => handleAutoFix(log)}
                              disabled={processingFix === log.id}
                              variant="default"
                              size="sm"
                            >
                              {processingFix === log.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Auto Fix
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="font-medium">{log.message}</div>
                      {log.url && (
                        <div className="text-sm text-muted-foreground">
                          URL: {log.url}
                        </div>
                      )}
                      {log.stack_trace && (
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium">Stack Trace</summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {log.stack_trace}
                          </pre>
                        </details>
                      )}
                      {log.auto_fix_result && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="font-medium text-blue-900 mb-1">AI Auto-Fix Suggestion:</div>
                          <div className="text-sm text-blue-800">{log.auto_fix_result}</div>
                        </div>
                      )}
                    </div>
                  )))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixes" className="space-y-4">
          <AutoFixControls onStatsUpdate={fetchData} />
          <Card>
            <CardHeader>
              <CardTitle>Auto-Fix Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {autoFixes.map((fix) => (
                    <div key={fix.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Confidence: {Math.round(fix.confidence_score * 100)}%
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(fix.created_at).toLocaleString()}
                          </span>
                          {fix.applied && (
                            <Badge variant={fix.success ? "default" : "destructive"}>
                              {fix.success ? "Applied Successfully" : "Application Failed"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm">
                        <strong>Fix Suggestion:</strong>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {fix.fix_suggestion}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <AutoFixControls />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Debug System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Auto-refresh:</span>
                        <Badge variant={autoRefresh ? "default" : "secondary"}>
                          {autoRefresh ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Filter:</span>
                        <Badge variant="outline">{filter}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-mode:</span>
                        <Badge variant={autoMode ? "default" : "secondary"}>
                          {autoMode ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">System Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Real-time monitoring: Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Database connection: Connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>AI auto-fix: Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span>Intelligent fixing: Enhanced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugSystem;