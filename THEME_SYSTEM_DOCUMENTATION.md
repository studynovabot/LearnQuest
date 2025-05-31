# LearnQuest Multi-Theme System Documentation

## 📚 Table of Contents

1. [Overview](#overview)
2. [Theme Architecture](#theme-architecture)
3. [Available Themes](#available-themes)
4. [Usage Guide](#usage-guide)
5. [Customization](#customization)
6. [Performance](#performance)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

## 🎨 Overview

The LearnQuest Multi-Theme System is a comprehensive theming solution that provides 6 educational-focused visual themes with premium glassmorphism effects, smooth transitions, and optimal performance across all devices.

### Key Features

- **6 Educational Themes**: Carefully designed for student-friendly experiences
- **Premium Glassmorphism**: Advanced backdrop-filter effects with fallbacks
- **Smooth Transitions**: Optimized animations with performance monitoring
- **Mobile Responsive**: Touch-optimized with device-specific optimizations
- **Accessibility Compliant**: WCAG 2.1 AA standards with preference support
- **Cross-Browser Compatible**: Works across Chrome, Firefox, Safari, and Edge

## 🏗️ Theme Architecture

### Core Components

```
client/src/
├── config/
│   └── themes.ts              # Theme definitions and configurations
├── hooks/
│   └── useAdvancedTheme.ts    # Advanced theme management hook
├── components/ui/
│   ├── theme-selector.tsx     # Theme selection interface
│   ├── theme-preview.tsx      # Theme preview components
│   ├── premium-*.tsx          # Theme-aware premium components
├── utils/
│   ├── performance.ts         # Performance optimization utilities
│   ├── theme-testing.ts       # Comprehensive testing suite
│   ├── browser-compatibility.ts # Cross-browser testing
│   ├── mobile-audit.ts        # Mobile responsiveness audit
│   └── production-deployment.ts # Deployment preparation
└── pages/
    └── Themes.tsx             # Dedicated themes page
```

### Theme Structure

Each theme contains:
- **Metadata**: ID, name, description, icon
- **Preview Colors**: For theme selection interface
- **CSS Variables**: Light and dark mode configurations
- **Glassmorphism Settings**: Theme-specific glass effects

## 🎭 Available Themes

### 1. Default Theme 🎓
- **Purpose**: Classic LearnQuest experience
- **Colors**: Purple gradients with blue accents
- **Best For**: General studying and balanced visual experience

### 2. Ocean Blue 🌊
- **Purpose**: Calming blues for focused studying
- **Colors**: Blue gradients with cyan accents
- **Best For**: Long study sessions and concentration

### 3. Forest Green 🌲
- **Purpose**: Nature-inspired refreshing feel
- **Colors**: Green gradients with emerald accents
- **Best For**: Reducing eye strain and natural ambiance

### 4. Sunset Orange 🌅
- **Purpose**: Warm colors for motivation
- **Colors**: Orange gradients with yellow accents
- **Best For**: Morning study sessions and energy boost

### 5. Purple Galaxy 🌌
- **Purpose**: Deep purples for creativity
- **Colors**: Purple gradients with pink accents
- **Best For**: Creative subjects and evening study

### 6. Minimalist Gray ⚪
- **Purpose**: Clean, distraction-free design
- **Colors**: Gray gradients with minimal accents
- **Best For**: Focus-intensive tasks and minimal distractions

## 📖 Usage Guide

### Basic Theme Switching

```typescript
import { useAdvancedTheme } from '@/hooks/useAdvancedTheme';

function MyComponent() {
  const { selectedTheme, changeTheme, availableThemes } = useAdvancedTheme();
  
  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId);
  };
  
  return (
    <div>
      <p>Current theme: {selectedTheme}</p>
      {availableThemes.map(theme => (
        <button 
          key={theme.id}
          onClick={() => handleThemeChange(theme.id)}
        >
          {theme.icon} {theme.name}
        </button>
      ))}
    </div>
  );
}
```

### Theme-Aware Components

```typescript
import { useAdvancedTheme } from '@/hooks/useAdvancedTheme';

function ThemeAwareComponent() {
  const { selectedTheme, themeConfig } = useAdvancedTheme();
  
  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'ocean-blue':
        return 'bg-blue-500/10 border-blue-400/20';
      case 'forest-green':
        return 'bg-green-500/10 border-green-400/20';
      // ... other themes
      default:
        return 'bg-primary/10 border-primary/20';
    }
  };
  
  return (
    <div className={`glass-card ${getThemeClasses()}`}>
      <h2>{themeConfig.name} Theme Active</h2>
    </div>
  );
}
```

### Dark/Light Mode Integration

```typescript
function ThemeModeToggle() {
  const { 
    isDark, 
    isLight, 
    isSystem, 
    setLightTheme, 
    setDarkTheme, 
    setSystemTheme 
  } = useAdvancedTheme();
  
  return (
    <div className="flex gap-2">
      <button 
        onClick={setLightTheme}
        className={isLight ? 'active' : ''}
      >
        Light
      </button>
      <button 
        onClick={setDarkTheme}
        className={isDark ? 'active' : ''}
      >
        Dark
      </button>
      <button 
        onClick={setSystemTheme}
        className={isSystem ? 'active' : ''}
      >
        System
      </button>
    </div>
  );
}
```

## 🎨 Customization

### Adding New Themes

1. **Define Theme Configuration**:

```typescript
// In client/src/config/themes.ts
const newTheme: ThemeConfig = {
  id: 'custom-theme',
  name: 'Custom Theme',
  description: 'Your custom theme description',
  icon: '🎨',
  preview: {
    primary: '#your-primary-color',
    secondary: '#your-secondary-color',
    background: '#your-background-color',
    accent: '#your-accent-color'
  },
  variables: {
    light: {
      '--background': 'your-light-background',
      '--foreground': 'your-light-foreground',
      // ... other variables
    },
    dark: {
      '--background': 'your-dark-background',
      '--foreground': 'your-dark-foreground',
      // ... other variables
    }
  }
};

// Add to themes array
export const themes: ThemeConfig[] = [
  // ... existing themes
  newTheme
];
```

2. **Add Theme-Specific Styling**:

```css
/* In client/src/index.css */
body.theme-custom-theme {
  --theme-accent: #your-accent-color;
}
```

### Custom Component Styling

```typescript
// Create theme-aware styling functions
const getCustomThemeClasses = (theme: string): string => {
  switch (theme) {
    case 'custom-theme':
      return 'your-custom-classes';
    // ... other themes
    default:
      return 'default-classes';
  }
};
```

## ⚡ Performance

### Optimization Features

- **Batched DOM Updates**: Reduces layout thrashing
- **Optimized CSS Variables**: Only updates changed properties
- **Performance Monitoring**: Real-time transition tracking
- **Mobile Optimizations**: Reduced complexity on touch devices
- **Memory Management**: Automatic cleanup of theme resources

### Performance Monitoring

```typescript
import { useAdvancedTheme } from '@/hooks/useAdvancedTheme';

function PerformanceMonitor() {
  const { performanceMetrics } = useAdvancedTheme();
  
  return (
    <div>
      <p>Average Transition Time: {performanceMetrics.averageTime}ms</p>
      <p>Total Transitions: {performanceMetrics.totalTransitions}</p>
      <p>Last Transition: {performanceMetrics.lastTransition}ms</p>
    </div>
  );
}
```

## 🔧 Troubleshooting

### Common Issues

#### Theme Not Applying
```typescript
// Check if theme is properly selected
const { selectedTheme, mounted } = useAdvancedTheme();
console.log('Selected theme:', selectedTheme);
console.log('Component mounted:', mounted);
```

#### Glassmorphism Not Working
```typescript
// Check browser support
import { supportsBackdropFilter } from '@/utils/performance';

if (!supportsBackdropFilter()) {
  console.warn('Backdrop filter not supported, using fallback');
}
```

#### Slow Theme Transitions
```typescript
// Check performance metrics
import { themePerformanceMonitor } from '@/utils/performance';

const metrics = themePerformanceMonitor.getMetrics();
if (metrics.averageTime > 300) {
  console.warn('Slow theme transitions detected');
}
```

### Browser-Specific Issues

#### Safari Glassmorphism
- Safari may require `-webkit-backdrop-filter` prefix
- Fallback to solid backgrounds if needed

#### Firefox Performance
- Some CSS properties may need `-moz-` prefixes
- Consider reduced animation complexity

#### Mobile Performance
- Automatic optimization for touch devices
- Reduced backdrop-filter values on mobile

## 📚 API Reference

### useAdvancedTheme Hook

```typescript
interface AdvancedThemeHook {
  // Theme state
  selectedTheme: string;
  themeConfig: ThemeConfig;
  availableThemes: ThemeConfig[];
  isTransitioning: boolean;
  
  // Theme actions
  changeTheme: (themeId: string) => Promise<void>;
  resetToDefault: () => void;
  getCurrentTheme: () => ThemeConfig;
  getAvailableThemes: () => ThemeConfig[];
  
  // Mode state (inherited from next-themes)
  theme: string;
  resolvedTheme: string;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  mounted: boolean;
  
  // Mode actions
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
  
  // Performance monitoring
  performanceMetrics: {
    averageTime: number;
    totalTransitions: number;
    lastTransition: number;
  };
}
```

### Theme Configuration Interface

```typescript
interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  variables: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}
```

### Performance Utilities

```typescript
// Performance monitoring
export const themePerformanceMonitor: ThemePerformanceMonitor;

// Optimization utilities
export function optimizeThemeVariables(variables: Record<string, string>): Record<string, string>;
export function batchDOMUpdates(updates: Array<() => void>): void;
export function getOptimalAnimationDuration(baseMs?: number): number;

// Device detection
export function isTouchDevice(): boolean;
export function prefersReducedMotion(): boolean;
export function supportsBackdropFilter(): boolean;
```

---

## 🚀 Getting Started

1. **Install Dependencies**: All theme dependencies are included in the main project
2. **Import Hook**: Use `useAdvancedTheme` in your components
3. **Apply Styling**: Use theme-aware classes and utilities
4. **Test Performance**: Monitor transitions and optimize as needed
5. **Deploy**: Run production deployment checks before going live

For additional support or questions, refer to the troubleshooting section or check the component implementations in the codebase.
