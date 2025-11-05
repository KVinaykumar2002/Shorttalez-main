import React from 'react';
import { ImprovedCommentSection } from '@/components/ImprovedCommentSection';

interface UniversalCommentSystemProps {
  contentId: string;
  contentType: 'episode' | 'post';
  commentsCount: number;
  onCommentsUpdate?: (count: number) => void;
  className?: string;
  maxHeight?: string;
  showTitle?: boolean;
}

/**
 * Universal comment system component that provides Instagram-like threaded comments
 * with real-time updates, optimistic UI, and proper reply threading.
 * 
 * Features:
 * - Instagram-style reply threading
 * - Real-time comment updates
 * - Optimistic UI updates
 * - Proper mention handling in replies
 * - Visual reply indicators
 * - Responsive design
 */
export const UniversalCommentSystem: React.FC<UniversalCommentSystemProps> = (props) => {
  return <ImprovedCommentSection {...props} />;
};

// Export for backward compatibility
export { ImprovedCommentSection as CommentSection };