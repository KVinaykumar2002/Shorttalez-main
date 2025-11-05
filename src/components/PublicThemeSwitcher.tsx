import React, { useState } from 'react';
import { Palette, Check, Sparkles, Crown, Award, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

export const PublicThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState<string>(currentTheme.id);
  const [isChanging, setIsChanging] = useState(false);

  // Sync selected theme when current theme changes (e.g., from header switcher)
  React.useEffect(() => {
    setSelectedThemeId(currentTheme.id);
  }, [currentTheme.id]);

  const hasChanges = selectedThemeId !== currentTheme.id;

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleSaveChanges = async () => {
    setIsChanging(true);
    
    try {
      // Apply the theme
      setTheme(selectedThemeId);
      
      // Show success toast
      const selectedTheme = themes.find(t => t.id === selectedThemeId);
      toast({
        title: "Theme Applied Successfully! 🎨",
        description: `Switched to ${selectedTheme?.name}. Your preference has been saved.`,
      });
      
      // Small delay for better UX
      setTimeout(() => {
        setIsChanging(false);
      }, 500);
      
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast({
        title: "Failed to Save Theme",
        description: "Please try again.",
        variant: "destructive",
      });
      setIsChanging(false);
    }
  };

  const handleReset = () => {
    setSelectedThemeId(currentTheme.id);
  };

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'main':
        return <Sparkles className="w-5 h-5" />;
      case 'golden':
        return <Crown className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const getThemeGradient = (theme: any) => {
    return {
      background: `linear-gradient(135deg, hsl(${theme.colors.light.primary}), hsl(${theme.colors.light.secondary}), hsl(${theme.colors.light.accent}))`
    };
  };

  return (
    <Card className="w-full bg-card/95 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Palette className="w-6 h-6 text-primary" />
          Choose Your Theme
        </CardTitle>
        <CardDescription>
          Customize your viewing experience with our beautiful themes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const isActive = currentTheme.id === theme.id;
            const isSelected = selectedThemeId === theme.id;
            
            return (
              <div
                key={theme.id}
                className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isSelected
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : isActive && !hasChanges
                    ? 'border-primary/60 shadow-md ring-1 ring-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                {/* Theme Preview */}
                <div 
                  className="h-16 rounded-t-lg relative overflow-hidden"
                  style={getThemeGradient(theme)}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-2 left-2 text-white">
                    {getThemeIcon(theme.id)}
                  </div>
                  
                  {isSelected && hasChanges && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary/90 text-primary-foreground border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Selected
                      </Badge>
                    </div>
                  )}
                  
                  {isActive && !hasChanges && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-accent/90 text-accent-foreground border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Theme Info */}
                <div className="p-4 bg-card rounded-b-lg">
                  <h3 className="font-semibold text-lg">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {theme.description}
                  </p>
                  
                  {/* Color Preview */}
                  <div className="flex gap-2 mt-3">
                    <div 
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ backgroundColor: `hsl(${theme.colors.light.primary})` }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ backgroundColor: `hsl(${theme.colors.light.secondary})` }}
                      title="Secondary Color"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ backgroundColor: `hsl(${theme.colors.light.accent})` }}
                      title="Accent Color"
                    />
                  </div>
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
        
        {/* Save Changes Section */}
        {hasChanges && (
          <div className="space-y-4 pt-4 border-t border-primary/20 bg-primary/5 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Ready to switch to {themes.find(t => t.id === selectedThemeId)?.name}?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your theme preference will be saved automatically
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                disabled={isChanging}
                className="min-w-[80px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isChanging}
                size="sm"
                className="bg-gradient-primary hover:bg-gradient-secondary text-primary-foreground min-w-[120px] btn-glow"
              >
                {isChanging ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Applying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Current Theme Info */}
        {!hasChanges && (
          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Currently using <span className="font-semibold text-foreground">{currentTheme.name}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a different theme above to customize your experience
            </p>
          </div>
        )}
        
        {/* Coming Soon */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            More themes coming soon!
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};