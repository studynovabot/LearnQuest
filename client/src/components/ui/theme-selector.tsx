import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, PaletteIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { ThemeConfig } from "@/config/themes";

interface ThemeSelectorProps {
  className?: string;
  showModeToggle?: boolean;
  compact?: boolean;
}

export function ThemeSelector({ 
  className, 
  showModeToggle = true, 
  compact = false 
}: ThemeSelectorProps) {
  const { 
    selectedTheme, 
    changeTheme, 
    availableThemes, 
    isTransitioning,
    isDark,
    isLight,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isSystem
  } = useAdvancedTheme();

  const handleThemeChange = async (themeId: string) => {
    if (themeId !== selectedTheme && !isTransitioning) {
      await changeTheme(themeId);
    }
  };

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Compact Theme Grid */}
        <div className="grid grid-cols-3 gap-2">
          {availableThemes.map((theme) => (
            <CompactThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme === theme.id}
              isTransitioning={isTransitioning}
              onSelect={() => handleThemeChange(theme.id)}
            />
          ))}
        </div>
        
        {showModeToggle && (
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={isLight ? "default" : "ghost"}
              size="sm"
              onClick={setLightTheme}
              className="flex-1 text-xs"
            >
              Light
            </Button>
            <Button
              variant={isDark ? "default" : "ghost"}
              size="sm"
              onClick={setDarkTheme}
              className="flex-1 text-xs"
            >
              Dark
            </Button>
            <Button
              variant={isSystem ? "default" : "ghost"}
              size="sm"
              onClick={setSystemTheme}
              className="flex-1 text-xs"
            >
              Auto
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Theme Mode Toggle */}
      {showModeToggle && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PaletteIcon className="h-5 w-5" />
              Theme Mode
            </CardTitle>
            <CardDescription>
              Choose between light, dark, or system preference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={isLight ? "default" : "ghost"}
                size="sm"
                onClick={setLightTheme}
                className="flex-1"
              >
                Light
              </Button>
              <Button
                variant={isDark ? "default" : "ghost"}
                size="sm"
                onClick={setDarkTheme}
                className="flex-1"
              >
                Dark
              </Button>
              <Button
                variant={isSystem ? "default" : "ghost"}
                size="sm"
                onClick={setSystemTheme}
                className="flex-1"
              >
                System
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Selection */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            Visual Themes
          </CardTitle>
          <CardDescription>
            Choose a visual theme that matches your study mood
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {availableThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedTheme === theme.id}
                  isTransitioning={isTransitioning}
                  onSelect={() => handleThemeChange(theme.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ThemeCardProps {
  theme: ThemeConfig;
  isSelected: boolean;
  isTransitioning: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, isSelected, isTransitioning, onSelect }: ThemeCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative cursor-pointer group",
        isTransitioning && "pointer-events-none"
      )}
      onClick={onSelect}
    >
      <Card className={cn(
        "transition-all duration-300 hover:shadow-premium",
        isSelected 
          ? "ring-2 ring-primary shadow-glow" 
          : "hover:shadow-lg hover:-translate-y-1"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{theme.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{theme.name}</h3>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-primary"
              >
                <CheckIcon className="h-5 w-5" />
              </motion.div>
            )}
          </div>
          
          {/* Theme Preview */}
          <div className="flex gap-1 h-8 rounded-md overflow-hidden">
            <div 
              className="flex-1 transition-all duration-300"
              style={{ backgroundColor: theme.preview.background }}
            />
            <div 
              className="flex-1 transition-all duration-300"
              style={{ backgroundColor: theme.preview.primary }}
            />
            <div 
              className="flex-1 transition-all duration-300"
              style={{ backgroundColor: theme.preview.secondary }}
            />
            <div 
              className="flex-1 transition-all duration-300"
              style={{ backgroundColor: theme.preview.accent }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CompactThemeCard({ theme, isSelected, isTransitioning, onSelect }: ThemeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative cursor-pointer",
        isTransitioning && "pointer-events-none"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "aspect-square rounded-lg p-2 transition-all duration-300",
        "border-2 hover:shadow-md",
        isSelected 
          ? "border-primary shadow-glow" 
          : "border-border hover:border-primary/50"
      )}>
        <div className="flex flex-col items-center gap-1 h-full">
          <span className="text-lg">{theme.icon}</span>
          <div className="flex gap-0.5 flex-1 w-full">
            <div 
              className="flex-1 rounded-sm"
              style={{ backgroundColor: theme.preview.primary }}
            />
            <div 
              className="flex-1 rounded-sm"
              style={{ backgroundColor: theme.preview.secondary }}
            />
          </div>
          <span className="text-xs font-medium truncate w-full text-center">
            {theme.name}
          </span>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1"
          >
            <CheckIcon className="h-3 w-3" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
