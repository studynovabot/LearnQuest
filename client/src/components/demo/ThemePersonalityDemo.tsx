import React from "react";
import { motion } from "framer-motion";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { ThemeAwareCard, ThemeAwareButton, ThemeAwareText } from "@/components/ui/theme-aware-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { themes } from "@/config/themes";

/**
 * Theme Personality Demonstration Component
 * Shows how each theme creates a unique visual experience
 */
export const ThemePersonalityDemo: React.FC = () => {
  const { themeConfig, changeTheme, selectedTheme } = useAdvancedTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <ThemeAwareText variant="title" as="h1" className="text-4xl mb-4">
          🎨 Theme Personality System Demo
        </ThemeAwareText>
        <ThemeAwareText variant="body" className="text-muted-foreground max-w-2xl mx-auto">
          Experience how each theme creates a completely different visual identity and user experience.
          Notice the typography, spacing, animations, and atmospheric elements change with each theme.
        </ThemeAwareText>
      </motion.div>

      {/* Current Theme Display */}
      <motion.div variants={itemVariants}>
        <ThemeAwareCard variant="glass" className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              <span className="text-3xl">{themeConfig.icon}</span>
              <span>Current Theme: {themeConfig.name}</span>
            </CardTitle>
            <CardDescription>
              {themeConfig.description}
            </CardDescription>
          </CardHeader>
        </ThemeAwareCard>
      </motion.div>

      {/* Theme Switcher */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Try Different Themes</CardTitle>
            <CardDescription>
              Click any theme below to see instant personality transformation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {themes.map((theme) => (
                <ThemeAwareButton
                  key={theme.id}
                  variant={selectedTheme === theme.id ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => changeTheme(theme.id)}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <span className="text-lg">{theme.icon}</span>
                  <span className="text-xs">{theme.name}</span>
                </ThemeAwareButton>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personality Traits Display */}
      {themeConfig?.personality && (
        <motion.div variants={itemVariants}>
          <ThemeAwareCard variant="glass">
            <CardHeader>
              <CardTitle>Current Theme Personality</CardTitle>
              <CardDescription>
                These traits define how this theme looks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Typography */}
                <div className="space-y-3">
                  <ThemeAwareText variant="subtitle" className="text-primary">
                    Typography
                  </ThemeAwareText>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Weight:</span>
                      <Badge variant="outline">{themeConfig.personality.typography.fontWeight}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spacing:</span>
                      <Badge variant="outline">{themeConfig.personality.typography.letterSpacing}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Height:</span>
                      <Badge variant="outline">{themeConfig.personality.typography.lineHeight}</Badge>
                    </div>
                  </div>
                </div>

                {/* Layout */}
                <div className="space-y-3">
                  <ThemeAwareText variant="subtitle" className="text-primary">
                    Layout
                  </ThemeAwareText>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Radius:</span>
                      <Badge variant="outline">{themeConfig.personality.layout.borderRadius}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spacing:</span>
                      <Badge variant="outline">{themeConfig.personality.layout.spacing}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Density:</span>
                      <Badge variant="outline">{themeConfig.personality.layout.density}</Badge>
                    </div>
                  </div>
                </div>

                {/* Effects */}
                <div className="space-y-3">
                  <ThemeAwareText variant="subtitle" className="text-primary">
                    Effects
                  </ThemeAwareText>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Glass:</span>
                      <Badge variant="outline">{themeConfig.personality.effects.glassmorphism}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Shadows:</span>
                      <Badge variant="outline">{themeConfig.personality.effects.shadows}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Animations:</span>
                      <Badge variant="outline">{themeConfig.personality.effects.animations}</Badge>
                    </div>
                  </div>
                </div>

                {/* Atmosphere */}
                <div className="space-y-3">
                  <ThemeAwareText variant="subtitle" className="text-primary">
                    Atmosphere
                  </ThemeAwareText>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pattern:</span>
                      <Badge variant="outline">{themeConfig.personality.atmosphere.backgroundPattern}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Animation:</span>
                      <Badge variant="outline">{themeConfig.personality.atmosphere.ambientAnimation}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Feedback:</span>
                      <Badge variant="outline">{themeConfig.personality.atmosphere.interactionFeedback}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </ThemeAwareCard>
        </motion.div>
      )}

      {/* Interactive Demo */}
      <motion.div variants={itemVariants}>
        <ThemeAwareCard variant="glass">
          <CardHeader>
            <CardTitle>Interactive Elements Demo</CardTitle>
            <CardDescription>
              See how theme personality affects interactions and animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div className="space-y-3">
              <ThemeAwareText variant="subtitle">Buttons</ThemeAwareText>
              <div className="flex flex-wrap gap-3">
                <ThemeAwareButton variant="primary">Primary Action</ThemeAwareButton>
                <ThemeAwareButton variant="secondary">Secondary Action</ThemeAwareButton>
                <ThemeAwareButton variant="ghost">Ghost Button</ThemeAwareButton>
              </div>
            </div>

            {/* Typography Showcase */}
            <div className="space-y-3">
              <ThemeAwareText variant="subtitle">Typography</ThemeAwareText>
              <div className="space-y-2">
                <ThemeAwareText variant="title" as="h3">This is a title with theme typography</ThemeAwareText>
                <ThemeAwareText variant="body">
                  This is body text that demonstrates the theme's font weight, letter spacing, and line height.
                  Notice how different themes render text with unique characteristics.
                </ThemeAwareText>
                <ThemeAwareText variant="caption">
                  This is caption text showing smaller typography variations.
                </ThemeAwareText>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              <ThemeAwareText variant="subtitle">Cards & Effects</ThemeAwareText>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ThemeAwareCard variant="glass" className="p-4 text-center">
                  <ThemeAwareText variant="body">Glass Card</ThemeAwareText>
                  <ThemeAwareText variant="caption" className="text-muted-foreground">
                    With theme glassmorphism
                  </ThemeAwareText>
                </ThemeAwareCard>
                <ThemeAwareCard variant="premium" className="p-4 text-center">
                  <ThemeAwareText variant="body">Premium Card</ThemeAwareText>
                  <ThemeAwareText variant="caption" className="text-muted-foreground">
                    With theme shadows
                  </ThemeAwareText>
                </ThemeAwareCard>
                <ThemeAwareCard variant="default" className="p-4 text-center">
                  <ThemeAwareText variant="body">Default Card</ThemeAwareText>
                  <ThemeAwareText variant="caption" className="text-muted-foreground">
                    With theme borders
                  </ThemeAwareText>
                </ThemeAwareCard>
              </div>
            </div>
          </CardContent>
        </ThemeAwareCard>
      </motion.div>

      {/* Instructions */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="pt-6">
            <ThemeAwareText variant="body" className="text-center">
              <strong>Try switching themes above!</strong> Notice how every aspect changes - typography rendering, 
              border radius, spacing, animations, shadows, and background patterns. Each theme creates a 
              completely different visual personality and user experience.
            </ThemeAwareText>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ThemePersonalityDemo;
