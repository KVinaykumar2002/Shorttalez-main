import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCommentLikes } from '@/hooks/useCommentLikes';

interface CommentLikeButtonProps {
  commentId: string;
  size?: 'sm' | 'default';
}

export const CommentLikeButton: React.FC<CommentLikeButtonProps> = ({ 
  commentId, 
  size = 'sm' 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLiked, likesCount, toggleLike, isLoading } = useCommentLikes(commentId);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    await toggleLike();
  };

  const buttonClass = size === 'default' 
    ? "h-5 px-2 text-xs hover:bg-red-50 hover:text-red-600" 
    : "h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600";
  
  const iconSize = size === 'default' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <Button 
      variant="ghost" 
      size={size}
      className={`${buttonClass} ${isLiked ? 'text-red-600' : ''}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart 
        className={`${iconSize} mr-1 ${isLiked ? 'fill-current' : ''}`} 
      />
      {likesCount > 0 ? likesCount : 'Like'}
    </Button>
  );
};