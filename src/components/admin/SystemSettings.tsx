import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Database, 
  Shield, 
  Monitor,
  HardDrive,
  Wifi,
  Activity,
  AlertTriangle
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMaintenanceToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      // In a real app, this would call an API to enable/disable maintenance mode
      setMaintenanceMode(enabled);
      
      toast({
        title: enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: enabled 
          ? "Website is now in maintenance mode for all users except admins"
          : "Website is now accessible to all users",
        variant: enabled ? "default" : "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle maintenance mode",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const systemStats = [
    {
      label: "Database Status",
      value: "Operational",
      icon: Database,
      status: "good" as const,
      detail: "99.9% uptime"
    },
    {
      label: "CDN Status", 
      value: "Operational",
      icon: Wifi,
      status: "good" as const,
      detail: "Global edge locations active"
    },
    {
      label: "Storage Usage",
      value: "67%",
      icon: HardDrive,
      status: "warning" as const,
      detail: "2.1TB / 3.0TB used"
    },
    {
      label: "System Load",
      value: "Normal",
      icon: Activity,
      status: "good" as const,
      detail: "CPU: 45%, RAM: 62%"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          System Settings & Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* System Status Overview */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            System Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`p-4 rounded-lg border ${getStatusColor(stat.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{stat.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stat.value}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-75">{stat.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Controls */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            System Controls
          </h4>
          
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Temporarily disable public access for system updates
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={handleMaintenanceToggle}
                disabled={loading}
              />
            </div>

            {maintenanceMode && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Maintenance mode is active. Only admins can access the system.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Debug Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Enable detailed logging and error reporting
                </p>
              </div>
              <Switch
                checked={debugMode}
                onCheckedChange={setDebugMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Analytics Collection</Label>
                <p className="text-xs text-muted-foreground">
                  Collect anonymous usage statistics and performance metrics
                </p>
              </div>
              <Switch
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Quick Actions
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <Database className="w-4 h-4 mb-1" />
              <span className="text-xs">Restart DB</span>
            </Button>
            
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <Monitor className="w-4 h-4 mb-1" />
              <span className="text-xs">System Info</span>
            </Button>
            
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <HardDrive className="w-4 h-4 mb-1" />
              <span className="text-xs">Disk Cleanup</span>
            </Button>
            
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <Activity className="w-4 h-4 mb-1" />
              <span className="text-xs">View Logs</span>
            </Button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 text-sm">Environment Information</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Environment:</span>
              <Badge variant="outline" className="ml-2">Production</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Version:</span>
              <span className="ml-2 font-mono">v2.1.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Deploy:</span>
              <span className="ml-2">{new Date().toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Uptime:</span>
              <span className="ml-2">7d 12h 45m</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};