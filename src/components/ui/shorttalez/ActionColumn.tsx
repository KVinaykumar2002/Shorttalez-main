import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share, UserPlus, Bookmark, Gift, Sparkles, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { VideoItem } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { ImpactStyle } from "@capacitor/haptics";

interface ActionColumnProps {
  video: VideoItem;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onShare?: () => void;
  onFollow?: () => void;
}

export default function ActionColumn({
  video,
  onToggleLike,
  onOpenComments,
  onShare,
  onFollow,
}: ActionColumnProps) {
  const { t } = useLanguage();
  const { isMobile, triggerHaptic } = useMobileOptimization();
  
  const formatCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}${t('actions.thousand', 'ui')}`;
    return `${(count / 1000000).toFixed(1)}${t('actions.million', 'ui')}`;
  };

  const handleActionClick = async (callback?: () => void, isLike?: boolean) => {
    if (isMobile) {
      await triggerHaptic(isLike ? ImpactStyle.Medium : ImpactStyle.Light);
    }
    callback?.();
  };

  return (
    <motion.div
      className="absolute right-4 bottom-28 flex flex-col items-center gap-3 z-20"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        delay: 0.3 
      }}
    >
      {/* Creator Avatar with Follow Button */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="relative"
          animate={{ 
            rotate: video.isFollowed ? 0 : [0, -5, 5, 0],
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, repeatType: "reverse" }
          }}
        >
          <Avatar className="w-16 h-16 border-3 border-gradient-to-r from-pink-500 to-cyan-500 shadow-2xl">
            <AvatarImage src={video.creator.avatarUrl} alt={video.creator.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-xl">
              {video.creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Animated ring around avatar */}
          <motion.div
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-60"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ zIndex: -1 }}
          />
        </motion.div>
        
        {!video.isFollowed && (
          <motion.button
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-xl border-2 border-white glow-pink touch-manipulation"
            onClick={() => handleActionClick(onFollow)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(255, 20, 147, 0.6)",
                "0 0 30px rgba(255, 20, 147, 0.8)",
                "0 0 20px rgba(255, 20, 147, 0.6)"
              ]
            }}
            transition={{ 
              scale: { duration: 0.15 },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
          >
            <UserPlus size={16} className="text-white" />
          </motion.button>
        )}
      </motion.div>

      {/* Interactive Action Buttons */}
      {[
        { 
          icon: Heart, 
          count: video.likesCount || 0, 
          isActive: video.isLiked,
          onClick: onToggleLike,
          activeColor: "from-pink-500 to-red-500",
          glowColor: "glow-pink"
        },
        { 
          icon: MessageCircle, 
          count: video.commentsCount || 0, 
          onClick: onOpenComments,
          activeColor: "from-cyan-500 to-blue-500",
          glowColor: "glow-cyan"
        },
        { 
          icon: Share, 
          count: video.likesCount > 1000 ? Math.floor(video.likesCount / 10) : 8100, 
          onClick: onShare,
          activeColor: "from-yellow-500 to-orange-500"
        },
        { 
          icon: Bookmark, 
          count: Math.floor((video.likesCount || 0) / 5), 
          onClick: () => {},
          activeColor: "from-purple-500 to-indigo-500"
        }
      ].map((action, index) => (
        <motion.div 
          key={index}
          className="flex flex-col items-center gap-1"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * index }}
        >
          <motion.button
            className={`
              relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl
              glass-dark border border-white/20 hover:border-white/40 transition-all duration-300
              touch-manipulation
              ${action.isActive ? `bg-gradient-to-r ${action.activeColor} ${action.glowColor}` : ''}
            `}
            onClick={() => handleActionClick(action.onClick, action.icon === Heart)}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
            }}
            whileTap={{ scale: 0.9 }}
            animate={action.isActive ? {
              boxShadow: [
                "0 0 20px currentColor",
                "0 0 30px currentColor", 
                "0 0 20px currentColor"
              ]
            } : {}}
            transition={{ 
              scale: { duration: 0.15 },
              rotate: { duration: 0.3 },
              boxShadow: { duration: 1.5, repeat: Infinity }
            }}
          >
            <action.icon 
              size={22} 
              fill={action.isActive && action.icon === Heart ? "currentColor" : "none"}
              className={`${action.isActive ? "text-white" : "text-white/80"} transition-colors duration-300`}
            />
            
            {/* Animated background effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0, 0.3, 0] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: index * 0.2 
              }}
            />
          </motion.button>
          
          <motion.span 
            className="text-xs text-white font-bold glass-dark px-2 py-1 rounded-full border border-white/10"
            animate={{ 
              scale: action.isActive ? [1, 1.1, 1] : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            {formatCount(action.count)}
          </motion.span>
        </motion.div>
      ))}

      {/* Special Effects Button */}
      <motion.button
        className="relative w-14 h-14 rounded-2xl glass-dark border border-white/20 flex items-center justify-center text-white shadow-2xl mt-2"
        whileHover={{ 
          scale: 1.1,
          rotate: 360 
        }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          background: [
            "linear-gradient(45deg, rgba(255,20,147,0.1), rgba(0,255,255,0.1))",
            "linear-gradient(45deg, rgba(0,255,255,0.1), rgba(138,43,226,0.1))",
            "linear-gradient(45deg, rgba(138,43,226,0.1), rgba(255,20,147,0.1))"
          ]
        }}
        transition={{ 
          scale: { duration: 0.15 },
          rotate: { duration: 0.8 },
          background: { duration: 3, repeat: Infinity }
        }}
      >
        <Sparkles size={22} className="text-white/80" />
        
        {/* Floating particles */}
        <AnimatePresence>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full"
              initial={{ 
                opacity: 0,
                x: 0,
                y: 0 
              }}
              animate={{ 
                opacity: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 40],
                y: [0, (Math.random() - 0.5) * 40],
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}