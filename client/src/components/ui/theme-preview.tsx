import * as React from "react";
import { motion } from "framer-motion";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { ThemeConfig } from "@/config/themes";

interface ThemePreviewProps {
  theme: ThemeConfig;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showDescription?: boolean;
  interactive?: boolean;
  className?: string;
}

export function ThemePreview({ 
  theme, 
  size = "md", 
  showName = true, 
  showDescription = false,
  interactive = true,
  className 
}: ThemePreviewProps) {
  const { selectedTheme, changeTheme, isTransitioning } = useAdvancedTheme();
  const isSelected = selectedTheme === theme.id;

  const handleSelect = () => {
    if (interactive && !isTransitioning && !isSelected) {
      changeTheme(theme.id);
    }
  };

  const sizeClasses = {
    sm: "w-16 h-12",
    md: "w-24 h-16", 
    lg: "w-32 h-20"
  };

  const iconSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <motion.div
      className={cn(
        "relative group",
        interactive && "cursor-pointer",
        isTransitioning && "pointer-events-none",
        className
      )}
      onClick={handleSelect}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      <Card className={cn(
        "transition-all duration-300",
        isSelected && interactive
          ? "ring-2 ring-primary shadow-glow" 
          : "hover:shadow-md",
        !interactive && "pointer-events-none"
      )}>
        <CardContent className="p-3">
          {/* Theme Icon and Name */}
          {(showName || theme.icon) && (
            <div className="flex items-center gap-2 mb-2">
              <span className={iconSizes[size]}>{theme.icon}</span>
              {showName && (
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{theme.name}</h3>
                  {showDescription && (
                    <p className="text-xs text-muted-foreground truncate">
                      {theme.description}
                    </p>
                  )}
                </div>
              )}
              {isSelected && interactive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-primary"
                >
                  <CheckIcon className="h-4 w-4" />
                </motion.div>
              )}
            </div>
          )}
          
          {/* Color Preview */}
          <div className={cn(
            "flex gap-1 rounded-md overflow-hidden",
            sizeClasses[size]
          )}>
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

interface ThemePreviewGridProps {
  themes?: ThemeConfig[];
  columns?: number;
  size?: "sm" | "md" | "lg";
  showNames?: boolean;
  showDescriptions?: boolean;
  interactive?: boolean;
  className?: string;
}

export function ThemePreviewGrid({
  themes,
  columns = 3,
  size = "md",
  showNames = true,
  showDescriptions = false,
  interactive = true,
  className
}: ThemePreviewGridProps) {
  const { availableThemes } = useAdvancedTheme();
  const themesToShow = themes || availableThemes;

  return (
    <div className={cn(
      "grid gap-3",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-4",
      columns === 5 && "grid-cols-5",
      columns === 6 && "grid-cols-6",
      className
    )}>
      {themesToShow.map((theme) => (
        <ThemePreview
          key={theme.id}
          theme={theme}
          size={size}
          showName={showNames}
          showDescription={showDescriptions}
          interactive={interactive}
        />
      ))}
    </div>
  );
}

interface CurrentThemeDisplayProps {
  showIcon?: boolean;
  showMode?: boolean;
  className?: string;
}

export function CurrentThemeDisplay({ 
  showIcon = true, 
  showMode = true, 
  className 
}: CurrentThemeDisplayProps) {
  const { themeConfig, isDark, isLight, isSystem } = useAdvancedTheme();

  const modeText = isDark ? 'Dark' : isLight ? 'Light' : 'System';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <span className="text-lg">{themeConfig.icon}</span>
      )}
      <div className="flex items-center gap-2">
        <span className="font-medium">{themeConfig.name}</span>
        {showMode && (
          <Badge variant="secondary" className="text-xs">
            {modeText}
          </Badge>
        )}
      </div>
    </div>
  );
}
