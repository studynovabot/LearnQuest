import React from "react";
import { motion } from "framer-motion";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaletteIcon, RefreshCwIcon, SparklesIcon, InfoIcon } from "@/components/ui/icons";
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
                Choose from our carefully crafted themes designed specifically for students and educational platforms. 
                Each theme maintains excellent readability and accessibility while providing a unique visual experience.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-primary" />
                    Features
                  </h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Glassmorphism effects preserved</li>
                    <li>• Smooth theme transitions</li>
                    <li>• Dark/Light mode support</li>
                    <li>• Accessibility optimized</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Theme Persistence</h4>
                  <p className="text-muted-foreground">
                    Your theme preference is automatically saved and will be restored when you return to LearnQuest.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <CardDescription>
                See how your selected theme looks across different components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample UI Elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sample Card */}
                <div className="glass-card p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Sample Card</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    This is how cards will look with your selected theme.
                  </p>
                  <Button size="sm" className="w-full">
                    Primary Button
                  </Button>
                </div>

                {/* Sample Navigation */}
                <div className="glass-card p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Navigation Preview</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                      <div className="w-4 h-4 bg-primary rounded"></div>
                      <span className="text-sm">Active Item</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors">
                      <div className="w-4 h-4 bg-muted rounded"></div>
                      <span className="text-sm">Inactive Item</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient Preview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Gradient Preview</h4>
                <div className="flex gap-2 h-12 rounded-lg overflow-hidden">
                  <div className="flex-1 gradient-primary"></div>
                  <div className="flex-1 gradient-secondary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Themes;
