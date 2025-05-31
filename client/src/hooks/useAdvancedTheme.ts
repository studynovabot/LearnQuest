import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { themes, getThemeById, getDefaultTheme, type ThemeConfig } from "@/config/themes";
import {
  themePerformanceMonitor,
  optimizeThemeVariables,
  batchDOMUpdates,
  PERFORMANCE_CONFIG
} from "@/utils/performance";
import { applyThemePersonality } from "@/utils/theme-personality";

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

  // Apply theme variables when theme or mode changes with performance optimization
  useEffect(() => {
    if (!mounted) return;

    const themeConfig = getThemeById(selectedTheme) || getDefaultTheme();
    const isDarkMode = resolvedTheme === 'dark';
    const variables = isDarkMode ? themeConfig.variables.dark : themeConfig.variables.light;

    // Optimize variables to only update changed ones
    const optimizedVariables = optimizeThemeVariables(variables);

    // Batch DOM updates for better performance
    batchDOMUpdates([
      () => {
        // Apply CSS variables to document root
        const root = document.documentElement;
        Object.entries(optimizedVariables).forEach(([property, value]) => {
          root.style.setProperty(property, value);
        });
      },
      () => {
        // Add theme class to body for additional styling
        // Only remove theme-specific classes, not all theme-related classes
        document.body.className = document.body.className
          .replace(/\btheme-(?:default|ocean-blue|forest-green|sunset-orange|purple-galaxy|minimalist-gray)\b/g, '')
          .concat(` theme-${selectedTheme}`);
      },
      () => {
        // Apply theme personality
        const themeConfig = getThemeById(selectedTheme);
        if (themeConfig?.personality) {
          applyThemePersonality(themeConfig.personality);
        }
      }
    ]);

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

    try {
      // Start performance monitoring
      themePerformanceMonitor.startTransition();

      setIsTransitioning(true);

      // Add transition class to body
      document.body.classList.add('theme-transitioning');

      // Validate current layout state before theme change
      const sidebarElement = document.getElementById('sliding-sidebar');
      const sidebarVisible = sidebarElement && window.getComputedStyle(sidebarElement).display !== 'none';

      // Small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 50));

      setSelectedTheme(themeId);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);

      // Remove transition class after animation with optimized duration
      const transitionDuration = PERFORMANCE_CONFIG.THEME_TRANSITION_DURATION;
      setTimeout(() => {
        try {
          document.body.classList.remove('theme-transitioning');
          setIsTransitioning(false);

          // Validate layout state after theme change
          const sidebarAfter = document.getElementById('sliding-sidebar');
          if (sidebarVisible && sidebarAfter && window.getComputedStyle(sidebarAfter).display === 'none') {
            console.warn('Sidebar visibility lost during theme change, restoring...');
            sidebarAfter.style.display = 'flex';
          }

          // End performance monitoring
          themePerformanceMonitor.endTransition();
        } catch (error) {
          console.error('Error during theme transition cleanup:', error);
          // Force cleanup in case of error
          document.body.classList.remove('theme-transitioning');
          setIsTransitioning(false);
        }
      }, transitionDuration);
    } catch (error) {
      console.error('Error during theme change:', error);
      // Cleanup on error
      document.body.classList.remove('theme-transitioning');
      setIsTransitioning(false);
      themePerformanceMonitor.endTransition();
    }
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

    // Performance monitoring
    performanceMetrics: themePerformanceMonitor.getMetrics(),
  };
}
