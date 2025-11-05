import React from 'react';
import { BulkSeriesUpload } from '@/components/admin/BulkSeriesUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Navigate } from 'react-router-dom';

const BulkUploadPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bulk Series Upload</h1>
        <p className="text-muted-foreground">Upload multiple episodes for a series at once</p>
      </div>
      <BulkSeriesUpload />
    </div>
  );
};

export default BulkUploadPage;