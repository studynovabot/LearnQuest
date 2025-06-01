import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "./icons";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";

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
    const { selectedTheme } = useAdvancedTheme();
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Stable event handlers to prevent re-renders and focus loss
    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    }, [props.onFocus]);

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    }, [props.onBlur]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    }, [props.onChange]);

    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    const getThemeAwareVariantClasses = () => {
      const baseClasses = {
        default: "bg-background border border-input",
        glass: `glass-card border-glass-border-strong ${getThemeAwareGlassClasses(selectedTheme)}`,
        gradient: `bg-gradient-to-r ${getThemeAwareFormGradient(selectedTheme)} border ${getThemeAwareBorderColor(selectedTheme)}`
      };
      return baseClasses;
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
          <input
            ref={inputRef}
            type={inputType}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 theme-transition",
              "focus:outline-none focus:ring-2",
              "placeholder:text-muted-foreground",
              getThemeAwareVariantClasses()[variant],
              icon && "pl-10",
              (isPasswordType || floatingLabel) && "pr-10",
              isFocused && variant === "glass" && getThemeAwareFocusGlow(selectedTheme),
              getThemeAwareFocusRing(selectedTheme),
              error && "border-red-500 focus:ring-red-500/50"
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
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
    const { selectedTheme } = useAdvancedTheme();

    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    const getThemeAwareSelectVariantClasses = () => {
      const baseClasses = {
        default: "bg-background border border-input text-foreground",
        glass: `glass-card border-glass-border-strong text-foreground ${getThemeAwareGlassClasses(selectedTheme)}`,
        gradient: `bg-gradient-to-r text-foreground ${getThemeAwareFormGradient(selectedTheme)} border ${getThemeAwareBorderColor(selectedTheme)}`
      };
      return baseClasses;
    };

    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <motion.select
            ref={ref}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 theme-transition",
              "focus:outline-none focus:ring-2",
              "appearance-none cursor-pointer",
              "text-foreground", // Ensure text is visible in both themes
              "[&>option]:text-foreground [&>option]:bg-background", // Style options for visibility
              "[&>option]:dark:text-white [&>option]:dark:bg-gray-800", // Dark mode option styling
              "[&>option]:light:text-gray-900 [&>option]:light:bg-white", // Light mode option styling
              getThemeAwareSelectVariantClasses()[variant],
              isFocused && variant === "glass" && getThemeAwareFocusGlow(selectedTheme),
              getThemeAwareFocusRing(selectedTheme),
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
            {!hasValue && (
              <option
                value=""
                className="text-foreground bg-background dark:text-white dark:bg-gray-800"
              >
                Select an option
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-foreground bg-background dark:text-white dark:bg-gray-800"
              >
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
    const { selectedTheme } = useAdvancedTheme();

    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    const getThemeAwareTextareaVariantClasses = () => {
      const baseClasses = {
        default: "bg-background border border-input",
        glass: `glass-card border-glass-border-strong ${getThemeAwareGlassClasses(selectedTheme)}`,
        gradient: `bg-gradient-to-r ${getThemeAwareFormGradient(selectedTheme)} border ${getThemeAwareBorderColor(selectedTheme)}`
      };
      return baseClasses;
    };

    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <motion.textarea
            ref={ref}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 theme-transition",
              "focus:outline-none focus:ring-2",
              "placeholder:text-muted-foreground resize-none",
              getThemeAwareTextareaVariantClasses()[variant],
              isFocused && variant === "glass" && getThemeAwareFocusGlow(selectedTheme),
              getThemeAwareFocusRing(selectedTheme),
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

// Theme-aware styling functions for forms
const getThemeAwareGlassClasses = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'hover:bg-blue-500/5 focus-within:bg-blue-500/5';
    case 'forest-green':
      return 'hover:bg-green-500/5 focus-within:bg-green-500/5';
    case 'sunset-orange':
      return 'hover:bg-orange-500/5 focus-within:bg-orange-500/5';
    case 'purple-galaxy':
      return 'hover:bg-purple-500/5 focus-within:bg-purple-500/5';
    case 'minimalist-gray':
      return 'hover:bg-gray-500/5 focus-within:bg-gray-500/5';
    default:
      return 'hover:bg-primary/5 focus-within:bg-primary/5';
  }
};

const getThemeAwareFormGradient = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'from-blue-500/5 to-cyan-500/5';
    case 'forest-green':
      return 'from-green-500/5 to-emerald-500/5';
    case 'sunset-orange':
      return 'from-orange-500/5 to-yellow-500/5';
    case 'purple-galaxy':
      return 'from-purple-500/5 to-pink-500/5';
    case 'minimalist-gray':
      return 'from-gray-500/5 to-slate-500/5';
    default:
      return 'from-primary/5 to-secondary/5';
  }
};

const getThemeAwareBorderColor = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'border-blue-500/20';
    case 'forest-green':
      return 'border-green-500/20';
    case 'sunset-orange':
      return 'border-orange-500/20';
    case 'purple-galaxy':
      return 'border-purple-500/20';
    case 'minimalist-gray':
      return 'border-gray-500/20';
    default:
      return 'border-primary/20';
  }
};

const getThemeAwareFocusGlow = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'shadow-glow-blue';
    case 'forest-green':
      return 'shadow-glow-green';
    case 'sunset-orange':
      return 'shadow-glow-orange';
    case 'purple-galaxy':
      return 'shadow-glow';
    case 'minimalist-gray':
      return 'shadow-md';
    default:
      return 'shadow-glow';
  }
};

const getThemeAwareFocusRing = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'focus:ring-blue-500/50';
    case 'forest-green':
      return 'focus:ring-green-500/50';
    case 'sunset-orange':
      return 'focus:ring-orange-500/50';
    case 'purple-galaxy':
      return 'focus:ring-purple-500/50';
    case 'minimalist-gray':
      return 'focus:ring-gray-500/50';
    default:
      return 'focus:ring-primary/50';
  }
};

export {
  PremiumInput,
  PremiumSelect,
  PremiumTextarea,
};
