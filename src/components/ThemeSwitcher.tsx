import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 sm:h-10 sm:w-10 touch-manipulation hover-bounce ripple-effect"
          title={`Current theme: ${currentTheme.name}`}
        >
          <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
          <Badge className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full p-0 text-[10px] bg-primary border-0">
            {themes.indexOf(currentTheme) + 1}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-popover/95 backdrop-blur-md border border-border/50 shadow-lg z-50" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              Choose Theme
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Current: {currentTheme.name}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{theme.name}</span>
              <span className="text-xs text-muted-foreground">
                {theme.description}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Theme preview colors */}
              <div className="flex gap-1">
                <div 
                  className="w-3 h-3 rounded-full border border-border/50"
                  style={{ backgroundColor: `hsl(${theme.colors.light.primary})` }}
                />
                <div 
                  className="w-3 h-3 rounded-full border border-border/50"
                  style={{ backgroundColor: `hsl(${theme.colors.light.secondary})` }}
                />
                <div 
                  className="w-3 h-3 rounded-full border border-border/50"
                  style={{ backgroundColor: `hsl(${theme.colors.light.accent})` }}
                />
              </div>
              
              {currentTheme.id === theme.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled className="text-xs text-muted-foreground justify-center">
          More themes coming soon...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};