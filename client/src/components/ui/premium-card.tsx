import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glass-strong" | "gradient";
  gradient?: "primary" | "secondary" | "success" | "purple" | "blue" | "green" | "orange";
  glow?: boolean;
  glowColor?: "default" | "blue" | "green" | "orange";
  animate?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({
    className,
    variant = "default",
    gradient,
    glow = false,
    glowColor = "default",
    animate = true,
    hover = true,
    children,
    ...props
  }, ref) => {
    const baseClasses = "rounded-2xl transition-all duration-300 ease-out";

    const variantClasses = {
      default: "bg-card border border-border shadow-premium",
      glass: "glass-card",
      "glass-strong": "glass-card-strong",
      gradient: gradient ? `gradient-${gradient} text-white border-0` : "gradient-primary text-white border-0"
    };

    const glowClasses = glow ? {
      default: "glow",
      blue: "glow glow-blue",
      green: "glow glow-green",
      orange: "glow glow-orange"
    }[glowColor] : "";

    const hoverClasses = hover ? "hover:shadow-premium-lg hover:-translate-y-1 hover:scale-[1.02]" : "";

    const cardContent = (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          glowClasses,
          hoverClasses,
          "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Premium shine effect */}
        {variant !== "default" && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Animated background for glass variants */}
        {(variant === "glass" || variant === "glass-strong") && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 animate-pulse-subtle" />
          </div>
        )}
      </div>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          whileHover={hover ? { y: -2 } : undefined}
          className="w-full"
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);

PremiumCard.displayName = "PremiumCard";

interface PremiumCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const PremiumCardHeader = React.forwardRef<HTMLDivElement, PremiumCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);

PremiumCardHeader.displayName = "PremiumCardHeader";

interface PremiumCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const PremiumCardTitle = React.forwardRef<HTMLParagraphElement, PremiumCardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);

PremiumCardTitle.displayName = "PremiumCardTitle";

interface PremiumCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const PremiumCardDescription = React.forwardRef<HTMLParagraphElement, PremiumCardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  )
);

PremiumCardDescription.displayName = "PremiumCardDescription";

interface PremiumCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const PremiumCardContent = React.forwardRef<HTMLDivElement, PremiumCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
);

PremiumCardContent.displayName = "PremiumCardContent";

interface PremiumCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const PremiumCardFooter = React.forwardRef<HTMLDivElement, PremiumCardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
);

PremiumCardFooter.displayName = "PremiumCardFooter";

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardTitle,
  PremiumCardDescription,
  PremiumCardContent,
  PremiumCardFooter,
};
