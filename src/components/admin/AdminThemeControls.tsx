import React, { useState } from 'react';
import { Palette, Check, Save, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

export const AdminThemeControls: React.FC = () => {
  const { currentTheme, setGlobalTheme, themes, isAdmin } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState<string>(currentTheme.id);
  const [isUpdating, setIsUpdating] = useState(false);

  // Don't show if not admin
  if (!isAdmin) {
    return null;
  }

  // Sync selected theme when current theme changes
  React.useEffect(() => {
    setSelectedThemeId(currentTheme.id);
  }, [currentTheme.id]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleUpdateGlobalTheme = async () => {
    if (!isAdmin || selectedThemeId === currentTheme.id) return;
    
    setIsUpdating(true);
    
    try {
      await setGlobalTheme(selectedThemeId);
      
      const selectedTheme = themes.find(t => t.id === selectedThemeId);
      toast({
        title: "Global Theme Updated! 🎨",
        description: `All users will now see the ${selectedTheme?.name} theme.`,
      });
      
    } catch (error) {
      console.error('Failed to update global theme:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update global theme",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = selectedThemeId !== currentTheme.id;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Admin Theme Control</CardTitle>
        </div>
        <CardDescription>
          Choose the global theme for all users. Changes will apply immediately to everyone.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105
                ${selectedThemeId === theme.id 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {/* Selection indicator */}
              {selectedThemeId === theme.id && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Current theme indicator */}
              {theme.id === currentTheme.id && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 text-xs bg-green-500/10 text-green-600 border-green-500/20"
                >
                  Active
                </Badge>
              )}

              {/* Theme preview */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-sm">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
                </div>
                
                {/* Color palette preview */}
                <div className="flex justify-center gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: `hsl(${theme.colors.light.primary})` }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: `hsl(${theme.colors.light.secondary})` }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: `hsl(${theme.colors.light.accent})` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleUpdateGlobalTheme}
              disabled={isUpdating}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUpdating ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Updating Global Theme...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Global Theme for All Users
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>⚠️ Theme changes will apply to all users immediately</p>
        </div>
      </CardContent>
    </Card>
  );
};