import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Captions } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoItem } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";

interface CaptionBarProps {
  video: VideoItem;
  show: boolean;
}

export default function CaptionBar({ video, show }: CaptionBarProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAutoCaptions, setShowAutoCaptions] = useState(false);
  const [fontSize, setFontSize] = useState('text-sm');

  if (!video.caption && !video.autoCaptions) return null;

  const displayText = showAutoCaptions && video.autoCaptions ? video.autoCaptions : video.caption;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute bottom-20 left-4 right-16 z-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm rounded-lg p-4">
            {/* Creator Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg bg-black/20 px-2 py-1 rounded">
                  ▶ 89.5M
                </span>
              </div>
              <span className="text-white font-semibold text-base">
                @{video.creator.name}
                {' • '}
                <span className="text-white/80">{t('feed.chill_and_cheel', 'ui')}</span>
              </span>
            </div>

            {/* Caption Content */}
            <div className="relative">
              <motion.div
                className={`${fontSize} text-white leading-relaxed ${
                  !isExpanded ? 'line-clamp-2' : ''
                }`}
                layout
              >
                {displayText}
              </motion.div>

              {/* Expand/Collapse Button */}
              {displayText && displayText.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -bottom-1 right-0 text-white/80 hover:text-white p-1 h-auto"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronUp size={16} />
                  )}
                </Button>
              )}
            </div>

            {/* Donation/Support Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-bold py-2 px-4 rounded-full border-2 border-white/30">
                {t('actions.donate', 'ui')} 0.1 LEE 💎
              </Button>
              <div className="flex gap-2">
                <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                  0.5 LEE ❤️
                </span>
                <span className="text-white/80 text-sm font-bold">
                  1 LEI
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}