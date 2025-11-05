import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, LogIn, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface AuthGuardProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  showInteractionPrompt?: boolean;
  action?: string;
}
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  showInteractionPrompt = false,
  action = "continue"
}) => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  if (user) {
    return <>{children}</>;
  }
  if (fallback) {
    return <>{fallback}</>;
  }
  if (showInteractionPrompt) {
    return <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        
        
      </Card>;
  }
  return <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center relative">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute left-2 top-2"
        >
          <span className="text-xl">&times;</span>
        </Button>
        <CardTitle>Authentication Required</CardTitle>
        <CardDescription>
          Please sign in to {action}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/auth')} className="flex-1" variant="default">
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth')} className="flex-1" variant="outline">
            Sign Up
          </Button>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="w-full mt-2"
        >
          Cancel
        </Button>
      </CardContent>
    </Card>;
};