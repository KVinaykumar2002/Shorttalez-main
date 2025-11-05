import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingOverlayProps {
  show: boolean;
  onComplete: () => void;
}

export default function OnboardingOverlay({ show, onComplete }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Swipe to Navigate",
      description: "Swipe up or down to move between videos",
      icon: "👆",
      animation: "swipe",
    },
    {
      title: "Tap to Control",
      description: "Single tap to hide/show controls",
      icon: "👉",
      animation: "tap",
    },
    {
      title: "Double Tap to Like",
      description: "Double tap anywhere to like a video",
      icon: "❤️",
      animation: "doubleTap",
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-[#1a1a1a] rounded-2xl p-8 mx-4 max-w-sm w-full border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Skip Button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-white/60 hover:text-white p-2"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Step Content */}
            <div className="text-center">
              {/* Icon with Animation */}
              <motion.div
                className="text-6xl mb-6"
                animate={{
                  scale: currentStepData.animation === 'tap' ? [1, 1.2, 1] : 1,
                  rotate: currentStepData.animation === 'swipe' ? [0, -10, 10, 0] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {currentStepData.icon}
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">
                {currentStepData.title}
              </h2>

              {/* Description */}
              <p className="text-white/80 mb-8 leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? 'bg-[#C99A2E]' : 'bg-white/30'
                    }`}
                    animate={{
                      scale: index === currentStep ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>

              {/* Action Button */}
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-[#C99A2E] to-[#FFD85A] hover:from-[#C99A2E]/90 hover:to-[#FFD85A]/90 text-white font-semibold py-3 rounded-xl"
              >
                {currentStep < steps.length - 1 ? (
                  <span className="flex items-center justify-center gap-2">
                    Next
                    <ChevronRight size={18} />
                  </span>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </motion.div>

          {/* Visual Gesture Hints */}
          {currentStepData.animation === 'swipe' && (
            <motion.div
              className="fixed right-8 top-1/2 transform -translate-y-1/2 text-white/40"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-1 h-8 bg-white/40 rounded-full" />
                <span className="text-xs">Swipe</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}