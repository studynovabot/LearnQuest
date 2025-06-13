import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function ThemeToggle({ 
  className, 
  size = "default", 
  variant = "outline" 
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("relative", className)}
        disabled
      >
        <SunIcon size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Force apply theme class to ensure immediate visual feedback
    if (newTheme === "dark") {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        "relative transition-all duration-300 hover:scale-105",
        className
      )}
    >
      <SunIcon 
        size={size === "sm" ? 16 : size === "lg" ? 24 : 20}
        className={cn(
          "absolute transition-all duration-300",
          resolvedTheme === "dark" 
            ? "rotate-90 scale-0 opacity-0" 
            : "rotate-0 scale-100 opacity-100"
        )}
      />
      <MoonIcon 
        size={size === "sm" ? 16 : size === "lg" ? 24 : 20}
        className={cn(
          "transition-all duration-300",
          resolvedTheme === "dark" 
            ? "rotate-0 scale-100 opacity-100" 
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
      <span className="sr-only">
        Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
      </span>
    </Button>
  );
}

// Alternative compact version for mobile
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "p-2 rounded-md transition-colors hover:bg-accent",
          className
        )}
        disabled
      >
        <SunIcon size={18} />
      </button>
    );
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Force apply theme class to ensure immediate visual feedback
    if (newTheme === "dark") {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-md transition-all duration-300 hover:bg-accent hover:scale-105",
        className
      )}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-[18px] h-[18px]">
        <SunIcon 
          size={18}
          className={cn(
            "absolute transition-all duration-300",
            resolvedTheme === "dark" 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <MoonIcon 
          size={18}
          className={cn(
            "absolute transition-all duration-300",
            resolvedTheme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
    </button>
  );
}