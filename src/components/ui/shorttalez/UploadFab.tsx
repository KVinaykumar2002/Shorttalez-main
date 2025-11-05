import { motion } from "framer-motion";
import { Camera, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface UploadFabProps {
  onQuickRecord: () => void;
  onOpenEditor: () => void;
  className?: string;
}

export default function UploadFab({ onQuickRecord, onOpenEditor, className }: UploadFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`fixed bottom-24 right-4 z-40 ${className}`}>
      <motion.div
        className="relative"
        initial={false}
        animate={{ scale: isExpanded ? 1.1 : 1 }}
      >
        {/* Quick Actions - Expanded State */}
        <motion.div
          className="absolute bottom-16 right-0 flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isExpanded ? 1 : 0,
            y: isExpanded ? 0 : 20,
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Quick Record */}
          <Button
            size="sm"
            className="w-12 h-12 rounded-full bg-[#C99A2E]/90 hover:bg-[#C99A2E] text-white shadow-lg backdrop-blur-sm border border-white/20"
            onClick={() => {
              onQuickRecord();
              setIsExpanded(false);
            }}
          >
            <Camera size={20} />
          </Button>
          
          {/* Open Editor */}
          <Button
            size="sm"
            className="w-12 h-12 rounded-full bg-[#C99A2E]/90 hover:bg-[#C99A2E] text-white shadow-lg backdrop-blur-sm border border-white/20"
            onClick={() => {
              onOpenEditor();
              setIsExpanded(false);
            }}
          >
            <Video size={20} />
          </Button>
        </motion.div>

        {/* Main FAB Button */}
        <motion.div
          className="relative"
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.18 }}
        >
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C99A2E] to-[#FFD85A] hover:from-[#C99A2E]/90 hover:to-[#FFD85A]/90 text-white shadow-2xl border-2 border-white/20"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={28} />
            </motion.div>
          </Button>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C99A2E] to-[#FFD85A] opacity-30 blur-lg scale-110 -z-10" />
          
          {/* Pulse Animation */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FFD85A]/50"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Backdrop for closing expanded state */}
      {isExpanded && (
        <motion.div
          className="fixed inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}