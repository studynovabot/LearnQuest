import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { getComponentPersonalityClasses } from "@/utils/theme-personality";

interface ThemeAwareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "premium";
  animate?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

export const ThemeAwareCard = React.forwardRef<HTMLDivElement, ThemeAwareCardProps>(
  ({ className, variant = "default", animate = true, hover = true, children, ...props }, ref) => {
    const { themeConfig } = useAdvancedTheme();
    
    // Get personality-based classes
    const personalityClasses = themeConfig?.personality 
      ? getComponentPersonalityClasses(themeConfig.personality, 'card')
      : '';

    const baseClasses = "relative overflow-hidden transition-all duration-300";
    
    const variantClasses = {
      default: "bg-card border border-border shadow-sm",
      glass: "glass-card",
      premium: "premium-card"
    };

    const hoverClasses = hover ? "hover-lift hover-shadow" : "";

    const cardContent = (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          personalityClasses,
          hoverClasses,
          className
        )}
        {...props}
      >
        {/* Theme-specific shine effect */}
        {variant !== "default" && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Atmospheric overlay based on theme personality */}
        {themeConfig?.personality.atmosphere.backgroundPattern !== 'none' && (
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className={`w-full h-full ${getAtmosphericOverlay(themeConfig.personality.atmosphere.backgroundPattern)}`} />
          </div>
        )}
      </div>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: getAnimationDuration(themeConfig?.personality.effects.transitions),
            ease: getAnimationEasing(themeConfig?.personality.effects.animations)
          }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);

ThemeAwareCard.displayName = "ThemeAwareCard";

// Helper functions for theme personality
function getAtmosphericOverlay(pattern: string): string {
  switch (pattern) {
    case 'dots':
      return 'bg-[radial-gradient(circle,_currentColor_1px,_transparent_1px)] bg-[length:20px_20px]';
    case 'grid':
      return 'bg-[linear-gradient(currentColor_1px,_transparent_1px),_linear-gradient(90deg,_currentColor_1px,_transparent_1px)] bg-[length:20px_20px]';
    case 'waves':
      return 'bg-[radial-gradient(ellipse_at_top,_currentColor_0%,_transparent_50%)]';
    case 'particles':
      return 'bg-[radial-gradient(circle_at_20%_20%,_currentColor_2px,_transparent_2px)] bg-[length:50px_50px]';
    default:
      return '';
  }
}

function getAnimationDuration(transition?: string): number {
  switch (transition) {
    case 'instant': return 0;
    case 'quick': return 0.15;
    case 'smooth': return 0.3;
    case 'flowing': return 0.5;
    default: return 0.3;
  }
}

function getAnimationEasing(animation?: string): string {
  switch (animation) {
    case 'minimal': return 'linear';
    case 'smooth': return 'easeOut';
    case 'playful': return [0.68, -0.55, 0.265, 1.55] as any;
    case 'dynamic': return [0.4, 0, 0.2, 1] as any;
    default: return 'easeOut';
  }
}

// Theme-aware button component
interface ThemeAwareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const ThemeAwareButton = React.forwardRef<HTMLButtonElement, ThemeAwareButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const { themeConfig } = useAdvancedTheme();
    
    const personalityClasses = themeConfig?.personality 
      ? getComponentPersonalityClasses(themeConfig.personality, 'button')
      : '';

    const baseClasses = "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      default: "bg-background border border-border hover:bg-accent hover:text-accent-foreground",
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground"
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg"
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          personalityClasses,
          className
        )}
        whileHover={{ 
          scale: getHoverScale(themeConfig?.personality.atmosphere.interactionFeedback),
          y: getHoverTranslateY(themeConfig?.personality.atmosphere.interactionFeedback)
        }}
        whileTap={{ 
          scale: getTapScale(themeConfig?.personality.atmosphere.interactionFeedback) 
        }}
        transition={{ 
          duration: getAnimationDuration(themeConfig?.personality.effects.transitions),
          ease: getAnimationEasing(themeConfig?.personality.effects.animations)
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

ThemeAwareButton.displayName = "ThemeAwareButton";

// Helper functions for interaction feedback
function getHoverScale(feedback?: string): number {
  switch (feedback) {
    case 'minimal': return 1;
    case 'standard': return 1.02;
    case 'enhanced': return 1.05;
    case 'immersive': return 1.08;
    default: return 1.02;
  }
}

function getHoverTranslateY(feedback?: string): number {
  switch (feedback) {
    case 'minimal': return 0;
    case 'standard': return -1;
    case 'enhanced': return -2;
    case 'immersive': return -3;
    default: return -1;
  }
}

function getTapScale(feedback?: string): number {
  switch (feedback) {
    case 'minimal': return 1;
    case 'standard': return 0.98;
    case 'enhanced': return 0.95;
    case 'immersive': return 0.92;
    default: return 0.98;
  }
}

// Theme-aware text component
interface ThemeAwareTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  children: React.ReactNode;
}

export const ThemeAwareText = React.forwardRef<HTMLElement, ThemeAwareTextProps>(
  ({ className, as: Component = 'p', variant = 'body', children, ...props }, ref) => {
    const { themeConfig } = useAdvancedTheme();
    
    const personalityClasses = themeConfig?.personality 
      ? getComponentPersonalityClasses(themeConfig.personality, 'text')
      : '';

    const variantClasses = {
      title: "text-2xl font-bold",
      subtitle: "text-lg font-semibold",
      body: "text-base",
      caption: "text-sm text-muted-foreground"
    };

    return (
      <Component
        ref={ref as any}
        className={cn(
          variantClasses[variant],
          personalityClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ThemeAwareText.displayName = "ThemeAwareText";
