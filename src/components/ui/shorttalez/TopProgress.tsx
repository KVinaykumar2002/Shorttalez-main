import { motion } from "framer-motion";

interface TopProgressProps {
  progress: number;
  buffered?: number;
}

export default function TopProgress({ progress, buffered = 0 }: TopProgressProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-black/20">
      {/* Buffered Progress */}
      {buffered > 0 && (
        <div
          className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300"
          style={{ width: `${buffered}%` }}
        />
      )}
      
      {/* Current Progress */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#C99A2E] to-[#FFD85A] shadow-lg"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "linear" }}
      />
      
      {/* Glow Effect */}
      <motion.div
        className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent via-[#FFD85A] to-transparent opacity-75 blur-sm"
        style={{ left: `${Math.max(0, progress - 2)}%` }}
        animate={{ opacity: progress > 0 ? 0.75 : 0 }}
      />
    </div>
  );
}