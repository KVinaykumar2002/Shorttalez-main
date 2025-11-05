import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { isAdmin, isModerator, isStaff, loading, bootstrapAdmin } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBootstrapAdmin = async () => {
    const result = await bootstrapAdmin();
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Show admin dashboard if user has admin privileges
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Show moderator dashboard (simplified admin features)
  if (isModerator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Moderator Dashboard
              </h1>
              <p className="text-muted-foreground">Content moderation and user management</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Moderator Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Moderator dashboard features coming soon. You can moderate content and manage users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show creator dashboard for regular users
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Creator Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your content and analytics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Creator dashboard features coming soon. Upload and manage your series and episodes.
            </p>
            <Button>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-4">
              No admin users exist yet. Be the first admin of this system.
            </p>
            <Button 
              onClick={handleBootstrapAdmin}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Become Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;