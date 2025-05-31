import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";

interface PremiumProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "gradient" | "glow";
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  animated?: boolean;
  label?: string;
}

const PremiumProgress: React.FC<PremiumProgressProps> = ({
  value,
  max = 100,
  className,
  variant = "gradient",
  color = "primary",
  size = "md",
  showValue = true,
  animated = true,
  label
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const { selectedTheme } = useAdvancedTheme();

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  // Get theme-aware color classes
  const getThemeAwareColorClasses = () => {
    const baseColors = {
      primary: {
        gradient: getThemeAwareGradient(selectedTheme, "primary"),
        solid: "bg-primary",
        glow: "shadow-glow-blue"
      },
      secondary: {
        gradient: getThemeAwareGradient(selectedTheme, "secondary"),
        solid: "bg-secondary",
        glow: "shadow-glow"
      },
      success: {
        gradient: getThemeAwareGradient(selectedTheme, "success"),
        solid: "bg-green-500",
        glow: "shadow-glow-green"
      },
      warning: {
        gradient: getThemeAwareGradient(selectedTheme, "warning"),
        solid: "bg-yellow-500",
        glow: "shadow-glow-orange"
      },
      danger: {
        gradient: getThemeAwareGradient(selectedTheme, "danger"),
        solid: "bg-red-500",
        glow: "shadow-glow"
      }
    };
    return baseColors[color];
  };

  const getProgressClasses = () => {
    const baseClasses = "h-full rounded-full transition-all duration-500 ease-out theme-transition";
    const themeColors = getThemeAwareColorClasses();

    switch (variant) {
      case "gradient":
        return cn(
          baseClasses,
          `bg-gradient-to-r ${themeColors.gradient}`,
          "relative overflow-hidden"
        );
      case "glow":
        return cn(
          baseClasses,
          themeColors.solid,
          themeColors.glow
        );
      default:
        return cn(baseClasses, themeColors.solid);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div className={cn(
        "w-full glass-card rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <motion.div
          className={getProgressClasses()}
          initial={{ width: 0 }}
          animate={{ width: animated ? `${percentage}%` : `${percentage}%` }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
        >
          {/* Simplified shimmer effect for gradient variant */}
          {variant === "gradient" && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

interface PremiumCircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  showValue?: boolean;
  animated?: boolean;
}

const PremiumCircularProgress: React.FC<PremiumCircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  color = "primary",
  showValue = true,
  animated = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "stroke-blue-500",
    secondary: "stroke-purple-500",
    success: "stroke-green-500",
    warning: "stroke-yellow-500",
    danger: "stroke-red-500"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={animated ? strokeDasharray : strokeDashoffset}
          className={cn(colorClasses[color], "drop-shadow-sm")}
          animate={{
            strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset
          }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
        />
      </svg>

      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: animated ? 1 : 0, duration: 0.5 }}
        >
          <span className="text-2xl font-bold text-foreground">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      )}
    </div>
  );
};

interface PremiumProgressCardProps {
  title: string;
  value: number;
  max?: number;
  description?: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  variant?: "linear" | "circular";
  className?: string;
}

const PremiumProgressCard: React.FC<PremiumProgressCardProps> = ({
  title,
  value,
  max = 100,
  description,
  icon,
  color = "primary",
  variant = "linear",
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className={cn(
        "glass-card p-6 rounded-2xl hover:shadow-premium transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>

      {variant === "circular" ? (
        <div className="flex justify-center">
          <PremiumCircularProgress
            value={value}
            max={max}
            color={color}
            size={100}
          />
        </div>
      ) : (
        <PremiumProgress
          value={value}
          max={max}
          color={color}
          variant="gradient"
          size="lg"
          showValue={true}
        />
      )}
    </motion.div>
  );
};

// Theme-aware gradient function
const getThemeAwareGradient = (theme: string, colorType: string): string => {
  const gradients = {
    'ocean-blue': {
      primary: "from-blue-400 to-blue-600",
      secondary: "from-blue-300 to-cyan-500",
      success: "from-teal-400 to-blue-500",
      warning: "from-blue-400 to-yellow-500",
      danger: "from-blue-400 to-red-500"
    },
    'forest-green': {
      primary: "from-green-400 to-green-600",
      secondary: "from-green-300 to-emerald-500",
      success: "from-emerald-400 to-green-600",
      warning: "from-green-400 to-yellow-500",
      danger: "from-green-400 to-red-500"
    },
    'sunset-orange': {
      primary: "from-orange-400 to-orange-600",
      secondary: "from-orange-300 to-yellow-500",
      success: "from-yellow-400 to-orange-500",
      warning: "from-orange-400 to-red-500",
      danger: "from-orange-400 to-red-600"
    },
    'purple-galaxy': {
      primary: "from-purple-400 to-purple-600",
      secondary: "from-purple-300 to-pink-500",
      success: "from-indigo-400 to-purple-500",
      warning: "from-purple-400 to-yellow-500",
      danger: "from-purple-400 to-red-500"
    },
    'minimalist-gray': {
      primary: "from-gray-400 to-gray-600",
      secondary: "from-gray-300 to-slate-500",
      success: "from-slate-400 to-gray-500",
      warning: "from-gray-400 to-yellow-500",
      danger: "from-gray-400 to-red-500"
    },
    'default': {
      primary: "from-blue-500 to-purple-600",
      secondary: "from-purple-500 to-pink-600",
      success: "from-green-500 to-emerald-600",
      warning: "from-yellow-500 to-orange-600",
      danger: "from-red-500 to-pink-600"
    }
  };

  return gradients[theme as keyof typeof gradients]?.[colorType as keyof typeof gradients.default] ||
         gradients.default[colorType as keyof typeof gradients.default];
};

export {
  PremiumProgress,
  PremiumCircularProgress,
  PremiumProgressCard,
};
