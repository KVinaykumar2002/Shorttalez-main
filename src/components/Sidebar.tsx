import React from 'react';
import { Home, TrendingUp, User, Upload, BarChart3, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Home Feed', url: '/home', icon: Home },
  { title: 'Trending', url: '/trending', icon: TrendingUp },
  { title: 'My Profile', url: '/profile', icon: User },
  { title: 'Upload', url: '/upload', icon: Upload },
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <SidebarPrimitive className={`${collapsed ? 'w-14' : 'w-64'} transition-all duration-300`}>
      <SidebarContent className="bg-gradient-to-b from-card/50 to-card/30 backdrop-blur-sm">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'block text-primary font-semibold'}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-primary text-primary-foreground shadow-lg btn-glow' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="font-medium animate-slide-fade-in">
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="p-4 mt-auto">
            <div className="p-4 rounded-lg bg-gradient-primary text-primary-foreground">
              <h3 className="font-semibold mb-2">Create Your Series</h3>
              <p className="text-sm opacity-90 mb-3">
                Share your stories with millions of viewers
              </p>
              <NavLink to="/upload">
                <button className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors">
                  Start Creating
                </button>
              </NavLink>
            </div>
          </div>
        )}
      </SidebarContent>
    </SidebarPrimitive>
  );
};