import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const colorClasses = {
    primary: {
      gradient: "from-blue-500 to-purple-600",
      solid: "bg-primary",
      glow: "shadow-glow-blue"
    },
    secondary: {
      gradient: "from-purple-500 to-pink-600",
      solid: "bg-secondary",
      glow: "shadow-glow"
    },
    success: {
      gradient: "from-green-500 to-emerald-600",
      solid: "bg-green-500",
      glow: "shadow-glow-green"
    },
    warning: {
      gradient: "from-yellow-500 to-orange-600",
      solid: "bg-yellow-500",
      glow: "shadow-glow-orange"
    },
    danger: {
      gradient: "from-red-500 to-pink-600",
      solid: "bg-red-500",
      glow: "shadow-glow"
    }
  };

  const getProgressClasses = () => {
    const baseClasses = "h-full rounded-full transition-all duration-500 ease-out";
    
    switch (variant) {
      case "gradient":
        return cn(
          baseClasses,
          `bg-gradient-to-r ${colorClasses[color].gradient}`,
          "relative overflow-hidden"
        );
      case "glow":
        return cn(
          baseClasses,
          colorClasses[color].solid,
          colorClasses[color].glow
        );
      default:
        return cn(baseClasses, colorClasses[color].solid);
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
          {/* Shimmer effect for gradient variant */}
          {variant === "gradient" && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
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
      whileHover={{ y: -2, scale: 1.02 }}
      className={cn(
        "glass-card p-6 rounded-2xl hover:shadow-premium transition-all duration-300",
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

export {
  PremiumProgress,
  PremiumCircularProgress,
  PremiumProgressCard,
};
