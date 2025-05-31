/**
 * Performance optimization utilities for LearnQuest theme system
 * Ensures smooth transitions and optimal rendering across all devices
 */

// Debounce utility for theme changes
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Check if device supports backdrop-filter
export function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined') return false;
  
  const testElement = document.createElement('div');
  testElement.style.backdropFilter = 'blur(1px)';
  (testElement.style as any).webkitBackdropFilter = 'blur(1px)';

  return !!(
    testElement.style.backdropFilter ||
    (testElement.style as any).webkitBackdropFilter
  );
}

// Check if device prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Check if device is mobile/touch
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Get optimal animation duration based on device capabilities
export function getOptimalAnimationDuration(baseMs: number = 300): number {
  if (prefersReducedMotion()) return 0;
  if (isTouchDevice()) return Math.max(baseMs * 0.7, 150); // Faster on mobile
  return baseMs;
}

// Optimize glassmorphism effects based on device capabilities
export function getOptimalGlassmorphismConfig() {
  const supportsBackdrop = supportsBackdropFilter();
  const isTouch = isTouchDevice();
  const reducedMotion = prefersReducedMotion();
  
  return {
    backdropBlur: supportsBackdrop ? (isTouch ? 8 : 12) : 0,
    borderOpacity: supportsBackdrop ? 0.2 : 0.4,
    backgroundOpacity: supportsBackdrop ? 0.1 : 0.8,
    animationDuration: reducedMotion ? 0 : (isTouch ? 200 : 300),
    shadowIntensity: isTouch ? 0.15 : 0.25,
  };
}

// Performance monitoring for theme transitions
export class ThemePerformanceMonitor {
  private startTime: number = 0;
  private metrics: Array<{ duration: number; timestamp: number }> = [];
  
  startTransition() {
    this.startTime = performance.now();
  }
  
  endTransition() {
    if (this.startTime === 0) return;
    
    const duration = performance.now() - this.startTime;
    this.metrics.push({
      duration,
      timestamp: Date.now(),
    });
    
    // Keep only last 10 measurements
    if (this.metrics.length > 10) {
      this.metrics.shift();
    }
    
    this.startTime = 0;
    
    // Log warning if transition is too slow
    if (duration > 500) {
      console.warn(`Slow theme transition detected: ${duration.toFixed(2)}ms`);
    }
  }
  
  getAverageTransitionTime(): number {
    if (this.metrics.length === 0) return 0;
    
    const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / this.metrics.length;
  }
  
  getMetrics() {
    return {
      averageTime: this.getAverageTransitionTime(),
      totalTransitions: this.metrics.length,
      lastTransition: this.metrics[this.metrics.length - 1]?.duration || 0,
    };
  }
}

// Global performance monitor instance
export const themePerformanceMonitor = new ThemePerformanceMonitor();

// CSS-in-JS optimization for dynamic theme variables
export function optimizeThemeVariables(variables: Record<string, string>) {
  const optimized: Record<string, string> = {};
  
  // Only include variables that have actually changed
  Object.entries(variables).forEach(([key, value]) => {
    const currentValue = getComputedStyle(document.documentElement)
      .getPropertyValue(key)
      .trim();
    
    if (currentValue !== value) {
      optimized[key] = value;
    }
  });
  
  return optimized;
}

// Batch DOM updates for better performance
export function batchDOMUpdates(updates: Array<() => void>) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Memory cleanup for theme resources
export function cleanupThemeResources() {
  // Remove any cached theme-related data that's no longer needed
  const themeCache = sessionStorage.getItem('theme-cache');
  if (themeCache) {
    try {
      const cache = JSON.parse(themeCache);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      
      // Remove cache entries older than 1 hour
      const cleanedCache = Object.entries(cache).reduce((acc, [key, value]: [string, any]) => {
        if (value.timestamp > oneHourAgo) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      sessionStorage.setItem('theme-cache', JSON.stringify(cleanedCache));
    } catch (error) {
      // If cache is corrupted, clear it
      sessionStorage.removeItem('theme-cache');
    }
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  // Clean up theme resources on page load
  cleanupThemeResources();
  
  // Set up periodic cleanup
  setInterval(cleanupThemeResources, 30 * 60 * 1000); // Every 30 minutes
  
  // Add performance observer for long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const longTasks = list.getEntries().filter(entry => entry.duration > 50);
        if (longTasks.length > 0) {
          console.warn('Long tasks detected during theme operations:', longTasks);
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // PerformanceObserver not supported or failed to initialize
      console.debug('PerformanceObserver not available');
    }
  }
}

// Export performance configuration
export const PERFORMANCE_CONFIG = {
  THEME_TRANSITION_DURATION: getOptimalAnimationDuration(300),
  DEBOUNCE_DELAY: 150,
  THROTTLE_LIMIT: 100,
  GLASSMORPHISM: getOptimalGlassmorphismConfig(),
} as const;
