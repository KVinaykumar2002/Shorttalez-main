import { motion } from "framer-motion";
import { Home, Search, PlusCircle, MessageCircle, User, Zap, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  activeTab: 'home' | 'discover' | 'upload' | 'inbox' | 'profile';
  onTabChange: (tab: 'home' | 'discover' | 'upload' | 'inbox' | 'profile') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home', color: 'text-white' },
    { id: 'discover', icon: Search, label: 'Discover', color: 'text-pink-400' },
    { id: 'upload', icon: PlusCircle, label: 'Create', color: 'text-cyan-400', special: true },
    { id: 'inbox', icon: MessageCircle, label: 'Inbox', color: 'text-primary' },
    { id: 'profile', icon: User, label: 'Profile', color: 'text-purple-400' },
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between px-4 py-2 safe-area-padding-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              className={`flex-1 flex flex-col items-center gap-1 p-3 relative ${
                tab.special ? 'mx-2' : ''
              }`}
              onClick={() => onTabChange(tab.id as any)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Special Create Button */}
              {tab.special ? (
                <motion.div
                  className="relative"
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? 180 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 p-[2px] shadow-neon">
                    <div className="w-full h-full bg-black/80 rounded-xl flex items-center justify-center">
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      className="absolute -inset-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-30 blur-xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="relative flex flex-col items-center gap-1"
                  animate={{ 
                    y: isActive ? -2 : 0,
                    scale: isActive ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`relative p-2 rounded-full ${
                    isActive ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20' : ''
                  }`}>
                    <Icon 
                      size={24} 
                      className={`${
                        isActive 
                          ? tab.color || 'text-white'
                          : 'text-white/60'
                      } transition-colors duration-300`}
                    />
                    
                    {/* Active glow effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 opacity-20 blur-sm"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-white opacity-100' 
                      : 'text-white/60 opacity-80'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full"
                      layoutId="activeTab"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              )}
              
              {/* Ripple effect on tap */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/10"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 2, opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}