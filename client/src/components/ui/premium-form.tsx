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
    variant = "default",
    floatingLabel = false,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const { theme: memoizedTheme } = useAdvancedTheme();

    const inputType = type === "password" && showPassword ? "text" : type;
    const showToggle = type === "password";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className={cn("relative w-full", className)}>
        {label && !floatingLabel && (
          <label className="block text-sm font-medium mb-1 text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full px-4 py-3 rounded-lg border bg-background text-foreground",
              "focus:outline-none focus:ring-2 transition-all duration-200",
              "placeholder:text-muted-foreground/50",
              icon ? "pl-10" : "pl-4",
              showToggle ? "pr-10" : "pr-4",
              variant === "glass" && getThemeAwareGlassClasses(memoizedTheme),
              variant === "gradient" && getThemeAwareFormGradient(memoizedTheme),
              isFocused && variant === "glass" && getThemeAwareFocusGlow(memoizedTheme),
              getThemeAwareFocusRing(memoizedTheme),
              error && "border-red-500 focus:ring-red-500/50",
              className
            )}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
            onChange={handleChange}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
          {floatingLabel && label && (
            <label
              className={cn(
                "absolute left-3 px-1 transition-all duration-200 pointer-events-none",
                hasValue || isFocused
                  ? "-top-2.5 text-xs bg-background text-primary"
                  : "top-1/2 -translate-y-1/2 text-muted-foreground",
                icon ? "left-10" : "left-3"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

interface PremiumSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value: string;
  variant?: "default" | "glass" | "gradient";
  floatingLabel?: boolean;
}

const PremiumSelect = React.forwardRef<HTMLSelectElement, PremiumSelectProps>(
  ({
    className,
    label,
    error,
    options,
    variant = "default",
    floatingLabel = false,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value);
    const { theme: memoizedTheme } = useAdvancedTheme();

    React.useEffect(() => {
      setHasValue(!!props.value);
    }, [props.value]);

    const getThemeAwareSelectVariantClasses = {
      default: "bg-background border-border",
      glass: cn(
        "backdrop-blur-md bg-white/10 border-white/20",
        "hover:bg-white/15 focus:bg-white/15"
      ),
      gradient: cn(
        "bg-gradient-to-r from-primary/5 to-secondary/5",
        "border-primary/20 hover:border-primary/30"
      )
    };

    return (
      <div className={cn("relative w-full", className)}>
        {label && !floatingLabel && (
          <label className="block text-sm font-medium mb-1 text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-3 pr-10 rounded-lg border bg-background text-foreground",
              "focus:outline-none focus:ring-2",
              "appearance-none cursor-pointer",
              "text-foreground",
              "[&>option]:text-foreground [&>option]:bg-background",
              "[&>option]:dark:text-white [&>option]:dark:bg-gray-800",
              "[&>option]:light:text-gray-900 [&>option]:light:bg-white",
              getThemeAwareSelectVariantClasses[variant],
              isFocused && variant === "glass" && getThemeAwareFocusGlow(memoizedTheme),
              getThemeAwareFocusRing(memoizedTheme),
              error && "border-red-500 focus:ring-red-500/50"
            )}
            onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setHasValue(!!e.target.value);
              if (props.onChange) props.onChange(e);
            }}
            {...props}
          >
            {!hasValue && (
              <option value="" className="text-foreground bg-background dark:text-white dark:bg-gray-800">
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
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {floatingLabel && label && (
            <label
              className={cn(
                "absolute left-3 px-1 transition-all duration-200 pointer-events-none",
                hasValue || isFocused
                  ? "-top-2.5 text-xs bg-background text-primary"
                  : "top-1/2 -translate-y-1/2 text-muted-foreground"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

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
    variant = "default",
    floatingLabel = false,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const { theme: memoizedTheme } = useAdvancedTheme();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(!!e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className={cn("relative w-full", className)}>
        {label && !floatingLabel && (
          <label className="block text-sm font-medium mb-1 text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            className={cn(
              "w-full px-4 py-3 rounded-lg border bg-background text-foreground min-h-[100px]",
              "focus:outline-none focus:ring-2 transition-all duration-200",
              "placeholder:text-muted-foreground/50 resize-y",
              variant === "glass" && getThemeAwareGlassClasses(memoizedTheme),
              variant === "gradient" && getThemeAwareFormGradient(memoizedTheme),
              isFocused && variant === "glass" && getThemeAwareFocusGlow(memoizedTheme),
              getThemeAwareFocusRing(memoizedTheme),
              error && "border-red-500 focus:ring-red-500/50"
            )}
            onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
            onChange={handleChange}
            {...props}
          />
          {floatingLabel && label && (
            <label
              className={cn(
                "absolute left-3 px-1 transition-all duration-200 pointer-events-none",
                hasValue || isFocused
                  ? "-top-2.5 text-xs bg-background text-primary"
                  : "top-3 text-muted-foreground"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

// Theme-aware styling functions for forms
const getThemeAwareGlassClasses = (theme: string | undefined): string => {
  return cn(
    "backdrop-blur-md border-white/20",
    !theme || theme === "dark"
      ? "bg-white/5 hover:bg-white/10 focus:bg-white/10"
      : "bg-black/5 hover:bg-black/10 focus:bg-black/10"
  );
};

const getThemeAwareFormGradient = (theme: string | undefined): string => {
  return cn(
    "bg-gradient-to-r from-primary/5 to-secondary/5",
    !theme || theme === "dark"
      ? "border-primary/20 hover:border-primary/30"
      : "border-primary/30 hover:border-primary/40"
  );
};

const getThemeAwareBorderColor = (theme: string | undefined): string => {
  return !theme || theme === "dark"
    ? "border-white/10"
    : "border-gray-200";
};

const getThemeAwareFocusGlow = (theme: string | undefined): string => {
  return cn(
    "shadow-glow",
    !theme || theme === "dark"
      ? "shadow-blue-500/20"
      : "shadow-blue-400/30"
  );
};

const getThemeAwareFocusRing = (theme: string | undefined): string => {
  return cn(
    "focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
    !theme || theme === "dark"
      ? "focus:ring-blue-500/50"
      : "focus:ring-blue-400/50"
  );
};

export {
  PremiumInput,
  PremiumSelect,
  PremiumTextarea,
  getThemeAwareGlassClasses,
  getThemeAwareFormGradient,
  getThemeAwareBorderColor,
  getThemeAwareFocusGlow,
  getThemeAwareFocusRing,
};
