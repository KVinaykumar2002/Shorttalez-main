import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';

export const AdminFloatingButton: React.FC = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate('/dashboard')}
      size="icon"
      className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 animate-bounce hover-bounce ripple-effect"
      aria-label="Admin Dashboard"
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
};