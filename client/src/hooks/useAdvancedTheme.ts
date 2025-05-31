import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { themes, getThemeById, getDefaultTheme, type ThemeConfig } from "@/config/themes";

const THEME_STORAGE_KEY = 'learnquest-selected-theme';
const THEME_MODE_STORAGE_KEY = 'learnquest-theme-mode';

export function useAdvancedTheme() {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    
    if (savedTheme && getThemeById(savedTheme)) {
      setSelectedTheme(savedTheme);
    }
    
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      setNextTheme(savedMode);
    }
  }, [setNextTheme]);

  // Apply theme variables when theme or mode changes
  useEffect(() => {
    if (!mounted) return;

    const themeConfig = getThemeById(selectedTheme) || getDefaultTheme();
    const isDarkMode = resolvedTheme === 'dark';
    const variables = isDarkMode ? themeConfig.variables.dark : themeConfig.variables.light;

    // Apply CSS variables to document root
    const root = document.documentElement;
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add theme class to body for additional styling
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .concat(` theme-${selectedTheme}`);

  }, [selectedTheme, resolvedTheme, mounted]);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const isLight = mounted ? resolvedTheme === "light" : false;
  const isSystem = nextTheme === "system";

  const toggleTheme = useCallback(() => {
    setNextTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setNextTheme]);

  const setLightTheme = useCallback(() => {
    setNextTheme("light");
    localStorage.setItem(THEME_MODE_STORAGE_KEY, "light");
  }, [setNextTheme]);

  const setDarkTheme = useCallback(() => {
    setNextTheme("dark");
    localStorage.setItem(THEME_MODE_STORAGE_KEY, "dark");
  }, [setNextTheme]);

  const setSystemTheme = useCallback(() => {
    setNextTheme("system");
    localStorage.setItem(THEME_MODE_STORAGE_KEY, "system");
  }, [setNextTheme]);

  const changeTheme = useCallback(async (themeId: string) => {
    if (!getThemeById(themeId)) {
      console.warn(`Theme "${themeId}" not found`);
      return;
    }

    setIsTransitioning(true);
    
    // Add transition class to body
    document.body.classList.add('theme-transitioning');
    
    // Small delay to ensure smooth transition
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setSelectedTheme(themeId);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
  }, []);

  const getCurrentTheme = useCallback((): ThemeConfig => {
    return getThemeById(selectedTheme) || getDefaultTheme();
  }, [selectedTheme]);

  const getAvailableThemes = useCallback(() => {
    return themes;
  }, []);

  const resetToDefault = useCallback(() => {
    changeTheme('default');
    setSystemTheme();
  }, [changeTheme, setSystemTheme]);

  return {
    // Next-themes compatibility
    theme: nextTheme,
    setTheme: setNextTheme,
    resolvedTheme,
    systemTheme,
    mounted,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    
    // Advanced theme functionality
    selectedTheme,
    changeTheme,
    getCurrentTheme,
    getAvailableThemes,
    resetToDefault,
    isTransitioning,
    
    // Theme utilities
    themeConfig: getCurrentTheme(),
    availableThemes: themes,
  };
}
