import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Video, 
  Settings, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Trash2,
  RefreshCw,
  Database,
  UserCheck,
  Image,
  Palette,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';
import { UserManagement } from './UserManagement';
import { ContentManagement } from './ContentManagement';
import { SystemSettings } from './SystemSettings';
import { SecurityPanel } from './SecurityPanel';
import { CacheManager } from './CacheManager';
import DebugSystem from './DebugSystem';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThumbnailGenerator } from './ThumbnailGenerator';
import { AdminThemeControls } from './AdminThemeControls';
import { BulkSeriesUpload } from './BulkSeriesUpload';
import { QuickThumbnailFix } from './QuickThumbnailFix';

export const AdminDashboard: React.FC = () => {
  const { stats, loading } = useAdminStats();
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('admin_dashboard', 'ui')}
            </h1>
            <p className="text-muted-foreground">
              {t('admin_description', 'ui')}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Shield className="w-3 h-3 mr-1" />
          {t('administrator', 'ui')}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 pb-4 mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Themes</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="thumbnails" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Thumbnails</span>
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Debug</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-800">{stats?.userCount || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">Total Series</p>
                    <p className="text-2xl font-bold text-green-800">{stats?.seriesCount || 0}</p>
                  </div>
                  <Video className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">Total Episodes</p>
                    <p className="text-2xl font-bold text-purple-800">{stats?.episodeCount || 0}</p>
                  </div>
                  <Video className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 font-medium">Pending Review</p>
                    <p className="text-2xl font-bold text-orange-800">{stats?.pendingEpisodes || 0}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab('upload')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Series Upload
                </Button>
                <Button 
                  onClick={() => setActiveTab('system')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear System Cache
                </Button>
                <Button 
                  onClick={() => setActiveTab('security')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security Scan
                </Button>
                <Button 
                  onClick={() => setActiveTab('users')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            <QuickThumbnailFix />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="upload">
          <BulkSeriesUpload />
        </TabsContent>

        <TabsContent value="themes">
          <AdminThemeControls />
        </TabsContent>

        <TabsContent value="security">
          <SecurityPanel />
        </TabsContent>

        <TabsContent value="system">
          <div className="space-y-6">
            <SystemSettings />
            <CacheManager />
          </div>
        </TabsContent>

        <TabsContent value="thumbnails">
          <ThumbnailGenerator />
        </TabsContent>

        <TabsContent value="debug">
          <DebugSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};