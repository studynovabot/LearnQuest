export interface ThemePersonality {
  typography: {
    fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    letterSpacing: 'tight' | 'normal' | 'wide';
    lineHeight: 'tight' | 'normal' | 'relaxed';
    textRendering: 'crisp' | 'smooth' | 'geometric';
  };
  layout: {
    borderRadius: 'sharp' | 'rounded' | 'pill';
    spacing: 'compact' | 'normal' | 'spacious';
    density: 'dense' | 'normal' | 'airy';
    cardStyle: 'flat' | 'elevated' | 'floating';
  };
  effects: {
    glassmorphism: 'subtle' | 'medium' | 'intense';
    shadows: 'minimal' | 'soft' | 'dramatic' | 'glow';
    animations: 'minimal' | 'smooth' | 'playful' | 'dynamic';
    transitions: 'instant' | 'quick' | 'smooth' | 'flowing';
  };
  atmosphere: {
    backgroundPattern: 'none' | 'dots' | 'grid' | 'waves' | 'particles';
    ambientAnimation: 'none' | 'subtle' | 'gentle' | 'active';
    cursorStyle: 'default' | 'precise' | 'creative' | 'playful';
    interactionFeedback: 'minimal' | 'standard' | 'enhanced' | 'immersive';
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  personality: ThemePersonality;
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

export const themes: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic LearnQuest theme with purple accents',
    icon: '🎓',
    personality: {
      typography: {
        fontWeight: 'medium',
        letterSpacing: 'normal',
        lineHeight: 'normal',
        textRendering: 'smooth'
      },
      layout: {
        borderRadius: 'rounded',
        spacing: 'normal',
        density: 'normal',
        cardStyle: 'elevated'
      },
      effects: {
        glassmorphism: 'medium',
        shadows: 'soft',
        animations: 'smooth',
        transitions: 'smooth'
      },
      atmosphere: {
        backgroundPattern: 'dots',
        ambientAnimation: 'subtle',
        cursorStyle: 'default',
        interactionFeedback: 'standard'
      }
    },
    preview: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      accent: '#f093fb'
    },
    variables: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--primary': '221 83% 53%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '210 40% 96%',
        '--secondary-foreground': '222.2 84% 4.9%',
        '--accent': '210 40% 96%',
        '--accent-foreground': '222.2 84% 4.9%',
        '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        '--glass-bg': 'rgba(255, 255, 255, 0.1)',
        '--glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      dark: {
        '--background': '226 100% 2%',
        '--foreground': '0 0% 98%',
        '--primary': '221 83% 53%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '250 50% 50%',
        '--secondary-foreground': '0 0% 98%',
        '--accent': '250 50% 50%',
        '--accent-foreground': '0 0% 98%',
        '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        '--glass-bg': 'rgba(0, 0, 0, 0.2)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)',
      }
    }
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming blue gradients for focused studying',
    icon: '🌊',
    personality: {
      typography: {
        fontWeight: 'normal',
        letterSpacing: 'normal',
        lineHeight: 'relaxed',
        textRendering: 'smooth'
      },
      layout: {
        borderRadius: 'pill',
        spacing: 'spacious',
        density: 'airy',
        cardStyle: 'floating'
      },
      effects: {
        glassmorphism: 'intense',
        shadows: 'soft',
        animations: 'smooth',
        transitions: 'flowing'
      },
      atmosphere: {
        backgroundPattern: 'waves',
        ambientAnimation: 'gentle',
        cursorStyle: 'default',
        interactionFeedback: 'enhanced'
      }
    },
    preview: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      background: '#f0f9ff',
      accent: '#0ea5e9'
    },
    variables: {
      light: {
        '--background': '204 100% 97%',
        '--foreground': '213 31% 9%',
        '--primary': '213 94% 68%',
        '--primary-foreground': '213 31% 9%',
        '--secondary': '213 27% 84%',
        '--secondary-foreground': '213 31% 9%',
        '--accent': '213 27% 84%',
        '--accent-foreground': '213 31% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        '--glass-bg': 'rgba(59, 130, 246, 0.1)',
        '--glass-border': 'rgba(59, 130, 246, 0.2)',
      },
      dark: {
        '--background': '213 31% 9%',
        '--foreground': '204 100% 97%',
        '--primary': '213 94% 68%',
        '--primary-foreground': '213 31% 9%',
        '--secondary': '213 19% 18%',
        '--secondary-foreground': '204 100% 97%',
        '--accent': '213 19% 18%',
        '--accent-foreground': '204 100% 97%',
        '--gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        '--glass-bg': 'rgba(59, 130, 246, 0.15)',
        '--glass-border': 'rgba(59, 130, 246, 0.2)',
      }
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Nature-inspired greens for a refreshing feel',
    icon: '🌲',
    personality: {
      typography: {
        fontWeight: 'medium',
        letterSpacing: 'normal',
        lineHeight: 'relaxed',
        textRendering: 'crisp'
      },
      layout: {
        borderRadius: 'rounded',
        spacing: 'normal',
        density: 'normal',
        cardStyle: 'elevated'
      },
      effects: {
        glassmorphism: 'medium',
        shadows: 'soft',
        animations: 'smooth',
        transitions: 'smooth'
      },
      atmosphere: {
        backgroundPattern: 'none',
        ambientAnimation: 'subtle',
        cursorStyle: 'default',
        interactionFeedback: 'standard'
      }
    },
    preview: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#f0fdf4',
      accent: '#34d399'
    },
    variables: {
      light: {
        '--background': '151 81% 96%',
        '--foreground': '151 55% 9%',
        '--primary': '160 84% 39%',
        '--primary-foreground': '151 55% 9%',
        '--secondary': '151 55% 91%',
        '--secondary-foreground': '151 55% 9%',
        '--accent': '151 55% 91%',
        '--accent-foreground': '151 55% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        '--glass-bg': 'rgba(16, 185, 129, 0.1)',
        '--glass-border': 'rgba(16, 185, 129, 0.2)',
      },
      dark: {
        '--background': '151 55% 9%',
        '--foreground': '151 81% 96%',
        '--primary': '160 84% 39%',
        '--primary-foreground': '151 55% 9%',
        '--secondary': '151 24% 18%',
        '--secondary-foreground': '151 81% 96%',
        '--accent': '151 24% 18%',
        '--accent-foreground': '151 81% 96%',
        '--gradient-primary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        '--glass-bg': 'rgba(16, 185, 129, 0.15)',
        '--glass-border': 'rgba(16, 185, 129, 0.2)',
      }
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm oranges and yellows for motivation',
    icon: '🌅',
    personality: {
      typography: {
        fontWeight: 'semibold',
        letterSpacing: 'normal',
        lineHeight: 'normal',
        textRendering: 'crisp'
      },
      layout: {
        borderRadius: 'sharp',
        spacing: 'compact',
        density: 'dense',
        cardStyle: 'flat'
      },
      effects: {
        glassmorphism: 'subtle',
        shadows: 'dramatic',
        animations: 'dynamic',
        transitions: 'quick'
      },
      atmosphere: {
        backgroundPattern: 'grid',
        ambientAnimation: 'active',
        cursorStyle: 'precise',
        interactionFeedback: 'immersive'
      }
    },
    preview: {
      primary: '#f59e0b',
      secondary: '#d97706',
      background: '#fffbeb',
      accent: '#fbbf24'
    },
    variables: {
      light: {
        '--background': '48 100% 96%',
        '--foreground': '45 29% 9%',
        '--primary': '43 96% 56%',
        '--primary-foreground': '45 29% 9%',
        '--secondary': '48 52% 88%',
        '--secondary-foreground': '45 29% 9%',
        '--accent': '48 52% 88%',
        '--accent-foreground': '45 29% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        '--glass-bg': 'rgba(245, 158, 11, 0.1)',
        '--glass-border': 'rgba(245, 158, 11, 0.2)',
      },
      dark: {
        '--background': '45 29% 9%',
        '--foreground': '48 100% 96%',
        '--primary': '43 96% 56%',
        '--primary-foreground': '45 29% 9%',
        '--secondary': '45 20% 18%',
        '--secondary-foreground': '48 100% 96%',
        '--accent': '45 20% 18%',
        '--accent-foreground': '48 100% 96%',
        '--gradient-primary': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        '--glass-bg': 'rgba(245, 158, 11, 0.15)',
        '--glass-border': 'rgba(245, 158, 11, 0.2)',
      }
    }
  },
  {
    id: 'purple-galaxy',
    name: 'Purple Galaxy',
    description: 'Deep purples and cosmic themes for creativity',
    icon: '🌌',
    personality: {
      typography: {
        fontWeight: 'bold',
        letterSpacing: 'wide',
        lineHeight: 'tight',
        textRendering: 'geometric'
      },
      layout: {
        borderRadius: 'pill',
        spacing: 'spacious',
        density: 'airy',
        cardStyle: 'floating'
      },
      effects: {
        glassmorphism: 'intense',
        shadows: 'glow',
        animations: 'playful',
        transitions: 'flowing'
      },
      atmosphere: {
        backgroundPattern: 'particles',
        ambientAnimation: 'active',
        cursorStyle: 'creative',
        interactionFeedback: 'immersive'
      }
    },
    preview: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      background: '#faf5ff',
      accent: '#a855f7'
    },
    variables: {
      light: {
        '--background': '270 100% 98%',
        '--foreground': '270 15% 9%',
        '--primary': '262 83% 58%',
        '--primary-foreground': '270 15% 9%',
        '--secondary': '270 24% 87%',
        '--secondary-foreground': '270 15% 9%',
        '--accent': '270 24% 87%',
        '--accent-foreground': '270 15% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
        '--glass-bg': 'rgba(139, 92, 246, 0.1)',
        '--glass-border': 'rgba(139, 92, 246, 0.2)',
      },
      dark: {
        '--background': '270 15% 9%',
        '--foreground': '270 100% 98%',
        '--primary': '262 83% 58%',
        '--primary-foreground': '270 15% 9%',
        '--secondary': '270 7% 18%',
        '--secondary-foreground': '270 100% 98%',
        '--accent': '270 7% 18%',
        '--accent-foreground': '270 100% 98%',
        '--gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
        '--glass-bg': 'rgba(139, 92, 246, 0.15)',
        '--glass-border': 'rgba(139, 92, 246, 0.2)',
      }
    }
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    description: 'Clean, distraction-free monochrome design',
    icon: '⚪',
    personality: {
      typography: {
        fontWeight: 'light',
        letterSpacing: 'tight',
        lineHeight: 'tight',
        textRendering: 'crisp'
      },
      layout: {
        borderRadius: 'sharp',
        spacing: 'spacious',
        density: 'airy',
        cardStyle: 'flat'
      },
      effects: {
        glassmorphism: 'subtle',
        shadows: 'minimal',
        animations: 'minimal',
        transitions: 'instant'
      },
      atmosphere: {
        backgroundPattern: 'none',
        ambientAnimation: 'none',
        cursorStyle: 'precise',
        interactionFeedback: 'minimal'
      }
    },
    preview: {
      primary: '#6b7280',
      secondary: '#4b5563',
      background: '#f9fafb',
      accent: '#9ca3af'
    },
    variables: {
      light: {
        '--background': '210 20% 98%',
        '--foreground': '220 9% 9%',
        '--primary': '220 9% 46%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '210 40% 96%',
        '--secondary-foreground': '220 9% 9%',
        '--accent': '210 40% 96%',
        '--accent-foreground': '220 9% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
        '--glass-bg': 'rgba(107, 114, 128, 0.1)',
        '--glass-border': 'rgba(107, 114, 128, 0.2)',
      },
      dark: {
        '--background': '220 9% 9%',
        '--foreground': '210 20% 98%',
        '--primary': '220 9% 46%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '220 13% 18%',
        '--secondary-foreground': '210 20% 98%',
        '--accent': '220 13% 18%',
        '--accent-foreground': '210 20% 98%',
        '--gradient-primary': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
        '--glass-bg': 'rgba(107, 114, 128, 0.15)',
        '--glass-border': 'rgba(107, 114, 128, 0.2)',
      }
    }
  }
];

export const getThemeById = (id: string): ThemeConfig | undefined => {
  return themes.find(theme => theme.id === id);
};

export const getDefaultTheme = (): ThemeConfig => {
  return themes[0]; // Default theme
};
