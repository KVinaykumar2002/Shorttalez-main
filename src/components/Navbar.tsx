import React, { useState } from 'react';
import { Bell, Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { useTranslation } from '@/lib/translations';
import { MobileOptimizedButton } from '@/components/MobileOptimizedButton';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import headerLogo from '@/assets/short-talez-new-header-logo.png';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { t } = useTranslation('navigation');
  const { isMobile, isIOS } = useMobileOptimization();

  return (
    <header 
      className="border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 md:px-6 touch-optimized"
      style={{
        height: 'calc(4rem + env(safe-area-inset-top))',
        paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
        marginTop: 'env(safe-area-inset-top)'
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="touch-optimized mobile-scale" />
        <Link to="/home" className="hover:opacity-90 transition-all hover:scale-105 touch-optimized flex items-center">
          <img 
            src={headerLogo} 
            alt="Short Talez" 
            className="h-14 sm:h-16 md:h-18 w-auto object-contain drop-shadow-lg"
          />
        </Link>
        {isAdmin && <ThemeSwitcher />}
      </div>

      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
        <SearchBar className="w-full" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <MobileOptimizedButton 
          variant="ghost" 
          size="icon" 
          className={`relative h-12 w-12 sm:h-14 sm:w-14 ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
        >
          <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 text-xs bg-primary text-primary-foreground">
            3
          </Badge>
        </MobileOptimizedButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MobileOptimizedButton 
              variant="ghost" 
              className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-full ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
            >
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4 sm:h-5 sm:w-5" />}
                </AvatarFallback>
              </Avatar>
            </MobileOptimizedButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg z-[100]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="touch-optimized py-3">{t('Profile')}</DropdownMenuItem>
            <DropdownMenuItem className="touch-optimized py-3">{t('Settings')}</DropdownMenuItem>
            <DropdownMenuItem className="touch-optimized py-3">{t('Analytics')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="touch-optimized py-3">
              {t('Logout cheskondi')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};