import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Comment {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentsCount: number;
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: {
      username: 'Daniel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel'
    },
    text: 'To do such a movement, I trained for more than a year!',
    timeAgo: '3d',
    likes: 861,
    isLiked: false
  },
  {
    id: '2',
    user: {
      username: 'Alisia_bugatti',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alisia'
    },
    text: 'I mastered these moves in 8 months',
    timeAgo: '2d',
    likes: 58,
    isLiked: false
  },
  {
    id: '3',
    user: {
      username: 'Lorena',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lorena'
    },
    text: 'Yes, this is the level of professional sports! Cool!',
    timeAgo: '1d',
    likes: 2,
    isLiked: false
  },
  {
    id: '4',
    user: {
      username: 'Your_pink_dream',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pink'
    },
    text: 'It looks great! I can\'t stop watching this video! I want to repeat this 🔥',
    timeAgo: '2d',
    likes: 15,
    isLiked: false
  }
];

const emojiReactions = ['🔥', '👏', '😍', '❤️', '🔥', '😊', '💯', '😱'];

export default function CommentsModal({ isOpen, onClose, commentsCount }: CommentsModalProps) {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');

  const handleLikeComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              isLiked: !comment.isLiked, 
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 
            }
          : comment
      )
    );
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          username: 'You',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'
        },
        text: newComment,
        timeAgo: 'now',
        likes: 0,
        isLiked: false
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Comments Panel */}
          <motion.div
            className="relative w-full h-[75vh] bg-gradient-to-t from-gray-900/95 via-gray-800/90 to-gray-700/85 backdrop-blur-xl rounded-t-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">
                  {commentsCount} COMMENTS
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[45vh]">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Avatar className="w-10 h-10 border border-white/20">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {comment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">
                        {comment.user.username}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {comment.timeAgo}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {comment.likes} likes
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white text-xs p-0 h-auto"
                      >
                        Reply
                      </Button>
                    </div>
                    
                    <p className="text-white text-sm leading-relaxed mb-2">
                      {comment.text}
                    </p>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeComment(comment.id)}
                      className={`p-1 h-auto ${
                        comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        size={14} 
                        fill={comment.isLiked ? 'currentColor' : 'none'} 
                      />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Emoji Reactions Bar */}
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex gap-2 justify-center">
                {emojiReactions.map((emoji, index) => (
                  <motion.button
                    key={index}
                    className="w-10 h-10 bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-lg hover:bg-gray-600/50 transition-colors"
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add comment"
                    className="bg-muted/50 border-border/20 text-foreground placeholder-muted-foreground pr-12 py-3 rounded-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-2"
                  >
                    <Smile size={18} />
                  </Button>
                </div>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-3 disabled:opacity-50"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}