import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "./icons";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: "default" | "glass" | "gradient";
  floatingLabel?: boolean;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ 
    className, 
    type = "text", 
    label, 
    error, 
    icon, 
    variant = "glass",
    floatingLabel = true,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    const variantClasses = {
      default: "bg-background border border-input",
      glass: "glass-card border-glass-border-strong",
      gradient: "bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
    };

    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
              {icon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "placeholder:text-muted-foreground",
              variantClasses[variant],
              icon && "pl-10",
              (isPasswordType || floatingLabel) && "pr-10",
              isFocused && variant === "glass" && "shadow-glow",
              error && "border-red-500 focus:ring-red-500/50"
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            {...props}
            placeholder={floatingLabel ? "" : props.placeholder}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              className={cn(
                "absolute left-3 pointer-events-none transition-all duration-300",
                "text-muted-foreground",
                icon && "left-10",
                (isFocused || hasValue)
                  ? "top-0 text-xs bg-background px-2 text-primary font-medium"
                  : "top-1/2 transform -translate-y-1/2 text-sm"
              )}
              animate={{
                y: (isFocused || hasValue) ? -12 : 0,
                scale: (isFocused || hasValue) ? 0.85 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}

          {/* Regular Label */}
          {!floatingLabel && label && (
            <label className="block text-sm font-medium text-foreground mb-2">
              {label}
            </label>
          )}

          {/* Password Toggle */}
          {isPasswordType && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-red-500"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

interface PremiumSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  variant?: "default" | "glass" | "gradient";
  floatingLabel?: boolean;
}

const PremiumSelect = React.forwardRef<HTMLSelectElement, PremiumSelectProps>(
  ({ 
    className, 
    label, 
    error, 
    options, 
    variant = "glass",
    floatingLabel = true,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    const variantClasses = {
      default: "bg-background border border-input",
      glass: "glass-card border-glass-border-strong",
      gradient: "bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
    };

    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <motion.select
            ref={ref}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "appearance-none cursor-pointer",
              variantClasses[variant],
              isFocused && variant === "glass" && "shadow-glow",
              error && "border-red-500 focus:ring-red-500/50"
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          >
            {!hasValue && <option value="">Select an option</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </motion.select>

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              className={cn(
                "absolute left-3 pointer-events-none transition-all duration-300",
                "text-muted-foreground",
                (isFocused || hasValue)
                  ? "top-0 text-xs bg-background px-2 text-primary font-medium"
                  : "top-1/2 transform -translate-y-1/2 text-sm"
              )}
              animate={{
                y: (isFocused || hasValue) ? -12 : 0,
                scale: (isFocused || hasValue) ? 0.85 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}

          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-red-500"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PremiumSelect.displayName = "PremiumSelect";

interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: "default" | "glass" | "gradient";
  floatingLabel?: boolean;
}

const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    variant = "glass",
    floatingLabel = true,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    const variantClasses = {
      default: "bg-background border border-input",
      glass: "glass-card border-glass-border-strong",
      gradient: "bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
    };

    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <motion.textarea
            ref={ref}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "placeholder:text-muted-foreground resize-none",
              variantClasses[variant],
              isFocused && variant === "glass" && "shadow-glow",
              error && "border-red-500 focus:ring-red-500/50"
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            {...props}
            placeholder={floatingLabel ? "" : props.placeholder}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              className={cn(
                "absolute left-3 pointer-events-none transition-all duration-300",
                "text-muted-foreground",
                (isFocused || hasValue)
                  ? "top-0 text-xs bg-background px-2 text-primary font-medium"
                  : "top-4 text-sm"
              )}
              animate={{
                y: (isFocused || hasValue) ? -12 : 0,
                scale: (isFocused || hasValue) ? 0.85 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-red-500"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PremiumTextarea.displayName = "PremiumTextarea";

export {
  PremiumInput,
  PremiumSelect,
  PremiumTextarea,
};
