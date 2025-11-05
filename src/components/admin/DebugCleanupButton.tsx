import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Wand2, RefreshCw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DebugCleanup } from '@/utils/debugCleanup';
import { supabase } from '@/integrations/supabase/client';

interface DebugCleanupButtonProps {
  onStatsUpdate?: () => void;
}

export const DebugCleanupButton: React.FC<DebugCleanupButtonProps> = ({ onStatsUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState<any>(null);
  const { toast } = useToast();

  const handleBatchCleanup = async () => {
    setIsProcessing(true);
    try {
      toast({
        title: "🧹 Starting Batch Cleanup",
        description: "Resolving common errors automatically...",
      });
      
      const result = await DebugCleanup.performFullCleanup();
      setLastCleanupResult(result);
      
      const totalResolved = (result.batch?.resolved || 0) + (result.stale?.cleaned || 0);
      
      toast({
        title: "✅ Cleanup Complete!",
        description: `Resolved ${totalResolved} errors. Page will refresh in 2 seconds.`,
        variant: "default",
      });
      
      // Refresh page to show updated error counts
      setTimeout(() => {
        onStatsUpdate?.(); // Update parent stats
        // Use state update instead of hard reload
      }, 2000);
      
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast({
        title: "❌ Cleanup Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkServerCleanup = async () => {
    setIsProcessing(true);
    try {
      toast({
        title: "⚡ Starting Server-Side Cleanup",
        description: "Using edge function for bulk error resolution...",
      });

      const { data, error } = await supabase.functions.invoke('bulk-debug-fix', {
        body: { action: 'resolve_common_errors' }
      });

      if (error) throw error;

      toast({
        title: "✅ Server Cleanup Complete!",
        description: "All common errors resolved. Refreshing page...",
        variant: "default",
      });

      // Refresh page to show updated error counts
      setTimeout(() => {
        onStatsUpdate?.(); // Update parent stats
        // Use state update instead of hard reload
      }, 2000);

    } catch (error) {
      console.error('Server cleanup failed:', error);
      toast({
        title: "❌ Server Cleanup Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Smart Debug Cleanup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Automatically resolve common errors that don't require manual fixes:
          </p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Dynamic import errors (now fixed)</li>
            <li>• Temporary network timeouts</li>
            <li>• Authentication retry errors</li>
            <li>• API connectivity issues</li>
            <li>• Stale errors older than 3 days</li>
          </ul>
          
          <div className="flex gap-2 items-center">
            <Button 
              onClick={handleBatchCleanup}
              disabled={isProcessing}
              className="flex items-center gap-2"
              size="sm"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Client Cleanup'}
            </Button>

            <Button 
              onClick={handleBulkServerCleanup}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="sm"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Server Bulk Fix
            </Button>
            
            {lastCleanupResult && (
              <div className="flex gap-2">
                {lastCleanupResult.batch?.resolved > 0 && (
                  <Badge variant="secondary">
                    Batch: {lastCleanupResult.batch.resolved}
                  </Badge>
                )}
                {lastCleanupResult.stale?.cleaned > 0 && (
                  <Badge variant="outline">
                    Stale: {lastCleanupResult.stale.cleaned}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};