import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Play, User, LogIn, MessageSquare, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MobileOptimizedButton } from '@/components/MobileOptimizedButton';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useAdmin } from '@/hooks/useAdmin';
import { ImpactStyle } from '@capacitor/haptics';

const BottomNavigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('');
  const [animatingTab, setAnimatingTab] = useState<string>('');
  const { t } = useLanguage();
  const { isMobile, isIOS, isAndroid } = useMobileOptimization();
  const { isAdmin } = useAdmin();

  // Stop animations after 5 seconds
  useEffect(() => {
    if (animatingTab) {
      const timer = setTimeout(() => {
        setAnimatingTab('');
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [animatingTab]);

  const handleTabClick = (href: string, label: string) => {
    if (location.pathname !== href) {
      setActiveTab(href);
      setAnimatingTab(href);
      navigate(href);
    }
  };

  const getNavItems = () => {
    const baseItems = [
      {
        icon: Home,
        label: t('bottom_nav.home', 'navigation'),
        href: '/home',
        gradient: 'from-[hsl(9_100%_50%)] to-[hsl(348_83%_47%)]'
      },
      {
        icon: Play,
        label: t('bottom_nav.videos', 'navigation'),
        href: '/videos',
        gradient: 'from-[hsl(356_80%_34%)] to-[hsl(345_75%_25%)]'
      },
      {
        icon: MessageSquare,
        label: t('bottom_nav.feed', 'navigation'),
        href: '/feed',
        gradient: 'from-[hsl(354_70%_57%)] to-[hsl(9_100%_50%)]'
      },
    ];

    if (user) {
      // For logged-in users, show profile
      baseItems.push({
        icon: User,
        label: t('bottom_nav.profile', 'navigation'),
        href: '/profile',
        gradient: 'from-[hsl(348_83%_47%)] to-[hsl(356_80%_34%)]'
      });

      // If admin, add dashboard option
      if (isAdmin) {
        baseItems.push({
          icon: Shield,
          label: t('bottom_nav.admin', 'navigation'),
          href: '/dashboard',
          gradient: 'from-[hsl(240_100%_50%)] to-[hsl(220_83%_47%)]'
        });
      }
    } else {
      // For non-logged-in users, show login
      baseItems.push({
        icon: LogIn,
        label: t('bottom_nav.login', 'navigation'),
        href: '/auth',
        gradient: 'from-[hsl(348_83%_47%)] to-[hsl(356_80%_34%)]'
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-gray-200/30 dark:border-gray-700/30 shadow-lg ${isIOS ? 'safe-bottom' : ''} touch-optimized`} style={{ backgroundColor: '#001a33' }}>
      {/* Animated gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 animate-gradient-shift" style={{ backgroundColor: '#001a33' }}></div>
      
      <div className="max-w-screen-sm mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <MobileOptimizedButton
                key={item.href}
                onClick={() => handleTabClick(item.href, item.label)}
                hapticStyle={ImpactStyle.Medium}
                variant="ghost"
                className={cn(
                  'relative flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 group min-h-[60px] min-w-[60px]',
                  'hover:scale-110 hover:rotate-3 hover:shadow-lg hover:animate-jello'
                )}
              >
                {/* Background glow effect */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 rounded-2xl blur-sm animate-pulse-glow`}></div>
                )}
                
                {/* Icon container */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={cn(
                    'p-2 rounded-xl transition-all duration-300',
                    isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${animatingTab === item.href ? 'animate-heartbeat' : ''}` 
                      : 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20'
                  )}>
                     <item.icon 
                       className="w-6 h-6 transition-all duration-300" 
                     />
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    'text-xs font-medium mt-1 transition-all duration-300',
                    isActive 
                      ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent font-bold`
                      : 'text-white/70 font-medium'
                  )}>
                    {item.label}
                  </span>
                </div>
              </MobileOptimizedButton>
            );
          })}
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-twinkle opacity-40" 
            style={{
              background: 'linear-gradient(to right, #ffffff, #001a33)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;