import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-premium hover:shadow-premium-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-premium",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground glass-card",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-premium",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "btn-premium text-white border-0 shadow-premium-lg",
        glass: "glass-card hover:glass-card-strong text-foreground",
        glow: "bg-primary text-primary-foreground shadow-glow hover:shadow-glow-blue",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        xl: "h-12 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
      },
      glow: {
        none: "",
        default: "shadow-glow hover:shadow-glow",
        blue: "shadow-glow-blue hover:shadow-glow-blue",
        green: "shadow-glow-green hover:shadow-glow-green",
        orange: "shadow-glow-orange hover:shadow-glow-orange",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
);

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  asChild?: boolean;
  animate?: boolean;
  shimmer?: boolean;
  gradient?: "primary" | "secondary" | "success" | "purple" | "blue" | "green" | "orange";
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    glow,
    asChild = false, 
    animate = true,
    shimmer = false,
    gradient,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const gradientClass = gradient ? `gradient-${gradient}` : "";
    const shimmerClass = shimmer ? "animate-shimmer" : "";

    const buttonContent = (
      <Comp
        className={cn(
          premiumButtonVariants({ variant, size, glow, className }),
          gradientClass,
          shimmerClass,
          variant === "gradient" && gradient && `gradient-${gradient}`
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect overlay */}
        {(variant === "gradient" || shimmer) && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        )}
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>

        {/* Glow effect for glass variants */}
        {variant === "glass" && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Comp>
    );

    if (animate) {
      return (
        <motion.div
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="inline-block"
        >
          {buttonContent}
        </motion.div>
      );
    }

    return buttonContent;
  }
);

PremiumButton.displayName = "PremiumButton";

// Specialized premium button variants
interface GradientButtonProps extends Omit<PremiumButtonProps, 'variant'> {
  gradient?: "primary" | "secondary" | "success" | "purple" | "blue" | "green" | "orange";
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ gradient = "primary", shimmer = true, ...props }, ref) => (
    <PremiumButton
      ref={ref}
      variant="gradient"
      gradient={gradient}
      shimmer={shimmer}
      {...props}
    />
  )
);

GradientButton.displayName = "GradientButton";

interface GlassButtonProps extends Omit<PremiumButtonProps, 'variant'> {}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (props, ref) => (
    <PremiumButton
      ref={ref}
      variant="glass"
      {...props}
    />
  )
);

GlassButton.displayName = "GlassButton";

interface GlowButtonProps extends Omit<PremiumButtonProps, 'variant' | 'glow'> {
  glowColor?: "default" | "blue" | "green" | "orange";
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ glowColor = "default", ...props }, ref) => (
    <PremiumButton
      ref={ref}
      variant="glow"
      glow={glowColor}
      {...props}
    />
  )
);

GlowButton.displayName = "GlowButton";

export { 
  PremiumButton, 
  GradientButton, 
  GlassButton, 
  GlowButton,
  premiumButtonVariants 
};
