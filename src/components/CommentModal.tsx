import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImprovedCommentSection } from '@/components/ImprovedCommentSection';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'episode' | 'post';
  contentTitle: string;
  commentsCount: number;
  onCommentsUpdate?: (count: number) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle,
  commentsCount,
  onCommentsUpdate,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {contentTitle}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ImprovedCommentSection
            contentId={contentId}
            contentType={contentType}
            commentsCount={commentsCount}
            onCommentsUpdate={onCommentsUpdate}
            showTitle={false}
            maxHeight="max-h-full"
            className="h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};