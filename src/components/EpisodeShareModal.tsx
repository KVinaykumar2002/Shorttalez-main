import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Repeat, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Episode {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  views: number;
  likes: number;
  comments_count: number;
  series: {
    id: string;
    title: string;
    creators: {
      id: string;
      profiles: {
        username: string;
        display_name: string;
        avatar_url: string;
      };
    };
  } | null;
}

interface EpisodeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode;
  onShared?: () => void;
}

export const EpisodeShareModal: React.FC<EpisodeShareModalProps> = ({
  isOpen,
  onClose,
  episode,
  onShared
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleShare = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Create reshare post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim() || `Check out this amazing episode: ${episode.title}`,
          post_type: 'reshare',
          reshared_episode_id: episode.id
        });

      if (postError) throw postError;

      // Add to interactions
      const { error: interactionError } = await supabase
        .from('interactions')
        .insert({
          user_id: user.id,
          target_type: 'episode',
          target_id: episode.id,
          interaction_type: 'reshare'
        });

      if (interactionError) throw interactionError;

      toast({
        title: "Episode Share ayyindhi!",
        description: "Episode mee profile lo share ayyindhi",
      });

      setContent('');
      onClose();
      onShared?.();
    } catch (error) {
      console.warn('Error sharing episode:', error);
      toast({
        title: "Error",
        description: "Failed to share episode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary" />
            Episode Share cheskondi
          </DialogTitle>
          <DialogDescription>
            Ee episode ni mee feed lo optional message tho share cheskondi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.user_metadata?.display_name || user?.email}</p>
              <p className="text-sm text-muted-foreground">Mee feed lo share chesthunnam</p>
            </div>
          </div>

          {/* Message input */}
          <Textarea
            placeholder="Ee episode gurinchi mee thoughts raskandi..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px]"
            maxLength={280}
          />

          {/* Episode preview */}
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
            <div className="flex gap-3">
              <img 
                src={episode.thumbnail_url} 
                alt={episode.title}
                className="w-16 h-16 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{episode.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                  {episode.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  by @{episode.series?.creators?.profiles?.username || 'Unknown Creator'}
                </p>
              </div>
            </div>
          </div>

          {/* Character count */}
          <div className="text-right">
            <span className={`text-sm ${
              content.length > 250 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {280 - content.length} characters migalay
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel cheskondi
            </Button>
            <Button onClick={handleShare} disabled={isLoading}>
              {isLoading ? 'Share chesthunnam...' : 'Episode Share cheskondi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};