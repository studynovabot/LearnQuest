import React from "react";
import { motion } from "framer-motion";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeAwareCard, ThemeAwareButton, ThemeAwareText } from "@/components/ui/theme-aware-card";
import { PaletteIcon, RefreshCwIcon, SparklesIcon, InfoIcon, EyeIcon, ZapIcon, LayersIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const Themes = () => {
  const {
    themeConfig,
    selectedTheme,
    resetToDefault,
    isTransitioning,
    isDark,
    isLight,
    isSystem
  } = useAdvancedTheme();

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
      className="min-h-screen p-4 md:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 gradient-primary rounded-2xl shadow-glow">
              <PaletteIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Themes
              </h1>
              <p className="text-muted-foreground text-lg">
                Customize your LearnQuest experience
              </p>
            </div>
          </div>

          {/* Current Theme Info */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
            variants={itemVariants}
          >
            <span className="text-2xl">{themeConfig.icon}</span>
            <span className="font-medium">Current: {themeConfig.name}</span>
            <Badge variant="secondary" className="ml-2">
              {isDark ? 'Dark' : isLight ? 'Light' : 'System'}
            </Badge>
          </motion.div>
        </motion.div>

        {/* Theme Information */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <InfoIcon className="h-5 w-5 text-primary" />
                About Themes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Experience comprehensive visual transformations that go far beyond simple color changes.
                Each theme provides a unique personality with distinct typography, layouts, animations, and atmospheric elements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <EyeIcon className="h-4 w-4 text-primary" />
                    Visual Identity
                  </h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Unique typography styles</li>
                    <li>• Custom border radius patterns</li>
                    <li>• Theme-specific spacing</li>
                    <li>• Varied glassmorphism intensity</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ZapIcon className="h-4 w-4 text-primary" />
                    Interactions
                  </h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Custom animation speeds</li>
                    <li>• Unique transition curves</li>
                    <li>• Theme-specific hover effects</li>
                    <li>• Varied interaction feedback</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <LayersIcon className="h-4 w-4 text-primary" />
                    Atmosphere
                  </h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Background patterns</li>
                    <li>• Ambient animations</li>
                    <li>• Custom shadow styles</li>
                    <li>• Theme-aware components</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Theme Personality */}
        {themeConfig?.personality && (
          <motion.div variants={itemVariants}>
            <ThemeAwareCard variant="glass" className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">{themeConfig.icon}</span>
                  {themeConfig.name} Personality
                </CardTitle>
                <CardDescription>
                  Discover the unique characteristics of your selected theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Typography */}
                  <div className="space-y-2">
                    <ThemeAwareText variant="subtitle" className="text-primary">Typography</ThemeAwareText>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <Badge variant="outline">{themeConfig.personality.typography.fontWeight}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spacing:</span>
                        <Badge variant="outline">{themeConfig.personality.typography.letterSpacing}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Height:</span>
                        <Badge variant="outline">{themeConfig.personality.typography.lineHeight}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Layout */}
                  <div className="space-y-2">
                    <ThemeAwareText variant="subtitle" className="text-primary">Layout</ThemeAwareText>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Radius:</span>
                        <Badge variant="outline">{themeConfig.personality.layout.borderRadius}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spacing:</span>
                        <Badge variant="outline">{themeConfig.personality.layout.spacing}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Density:</span>
                        <Badge variant="outline">{themeConfig.personality.layout.density}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Effects */}
                  <div className="space-y-2">
                    <ThemeAwareText variant="subtitle" className="text-primary">Effects</ThemeAwareText>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Glass:</span>
                        <Badge variant="outline">{themeConfig.personality.effects.glassmorphism}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shadows:</span>
                        <Badge variant="outline">{themeConfig.personality.effects.shadows}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Animations:</span>
                        <Badge variant="outline">{themeConfig.personality.effects.animations}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Atmosphere */}
                  <div className="space-y-2">
                    <ThemeAwareText variant="subtitle" className="text-primary">Atmosphere</ThemeAwareText>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pattern:</span>
                        <Badge variant="outline">{themeConfig.personality.atmosphere.backgroundPattern}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Animation:</span>
                        <Badge variant="outline">{themeConfig.personality.atmosphere.ambientAnimation}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Feedback:</span>
                        <Badge variant="outline">{themeConfig.personality.atmosphere.interactionFeedback}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ThemeAwareCard>
          </motion.div>
        )}

        {/* Theme Selector */}
        <motion.div variants={itemVariants}>
          <ThemeSelector
            className={cn(
              "transition-opacity duration-300",
              isTransitioning && "opacity-50 pointer-events-none"
            )}
          />
        </motion.div>

        {/* Reset Section */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Reset Themes</CardTitle>
              <CardDescription>
                Restore the default LearnQuest theme and system mode preference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={resetToDefault}
                disabled={isTransitioning || (selectedTheme === 'default' && isSystem)}
                className="flex items-center gap-2"
              >
                <RefreshCwIcon className={cn(
                  "h-4 w-4",
                  isTransitioning && "animate-spin"
                )} />
                Reset to Default
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme Preview Section */}
        <motion.div variants={itemVariants}>
          <ThemeAwareCard variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <CardDescription>
                Experience your selected theme's personality across different components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme-Aware Components */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample Card */}
                <ThemeAwareCard variant="glass" className="p-4">
                  <ThemeAwareText variant="subtitle" className="mb-2">Theme-Aware Card</ThemeAwareText>
                  <ThemeAwareText variant="body" className="text-muted-foreground mb-3">
                    This card adapts to your theme's personality with custom spacing, borders, and effects.
                  </ThemeAwareText>
                  <ThemeAwareButton variant="primary" size="sm" className="w-full">
                    Interactive Button
                  </ThemeAwareButton>
                </ThemeAwareCard>

                {/* Typography Showcase */}
                <ThemeAwareCard variant="glass" className="p-4">
                  <ThemeAwareText variant="subtitle" className="mb-2">Typography</ThemeAwareText>
                  <div className="space-y-2">
                    <ThemeAwareText variant="title" as="h3">Title Text</ThemeAwareText>
                    <ThemeAwareText variant="subtitle">Subtitle Text</ThemeAwareText>
                    <ThemeAwareText variant="body">Body text with theme-specific font weight and spacing.</ThemeAwareText>
                    <ThemeAwareText variant="caption">Caption text for details</ThemeAwareText>
                  </div>
                </ThemeAwareCard>

                {/* Interactive Elements */}
                <ThemeAwareCard variant="glass" className="p-4">
                  <ThemeAwareText variant="subtitle" className="mb-3">Interactions</ThemeAwareText>
                  <div className="space-y-3">
                    <ThemeAwareButton variant="primary" className="w-full">
                      Primary Action
                    </ThemeAwareButton>
                    <ThemeAwareButton variant="secondary" className="w-full">
                      Secondary Action
                    </ThemeAwareButton>
                    <ThemeAwareButton variant="ghost" className="w-full">
                      Ghost Button
                    </ThemeAwareButton>
                  </div>
                </ThemeAwareCard>
              </div>

              {/* Gradient and Effects Preview */}
              <div className="space-y-4">
                <ThemeAwareText variant="subtitle">Visual Effects</ThemeAwareText>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gradients */}
                  <div className="space-y-2">
                    <ThemeAwareText variant="caption">Theme Gradients</ThemeAwareText>
                    <div className="flex gap-2 h-12 rounded-lg overflow-hidden">
                      <div className="flex-1 gradient-primary"></div>
                      <div className="flex-1 gradient-secondary"></div>
                    </div>
                  </div>

                  {/* Glassmorphism Intensity */}
                  <div className="space-y-2">
                    <ThemeAwareText variant="caption">Glassmorphism Levels</ThemeAwareText>
                    <div className="flex gap-2 h-12">
                      <div className="flex-1 theme-glass-subtle bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">Subtle</span>
                      </div>
                      <div className="flex-1 theme-glass-medium bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">Medium</span>
                      </div>
                      <div className="flex-1 theme-glass-intense bg-primary/10 rounded border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">Intense</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personality Demonstration */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                <ThemeAwareText variant="subtitle" className="mb-2">Theme Personality in Action</ThemeAwareText>
                <ThemeAwareText variant="body" className="text-muted-foreground">
                  Notice how this theme's unique personality affects every aspect of the interface - from typography rendering
                  to animation speeds, border radius styles, and interaction feedback. Each theme creates a completely
                  different visual and interactive experience.
                </ThemeAwareText>
              </div>
            </CardContent>
          </ThemeAwareCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Themes;
