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
    description: 'Elegant purple and gold harmony for focused learning',
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
      secondary: '#f59e0b',
      background: '#fefbff',
      accent: '#ec4899'
    },
    variables: {
      light: {
        '--background': '300 100% 99%',
        '--foreground': '222.2 84% 4.9%',
        '--primary': '221 83% 53%',
        '--primary-foreground': '300 100% 99%',
        '--secondary': '43 96% 56%',
        '--secondary-foreground': '222.2 84% 4.9%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '300 100% 99%',
        '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        '--glass-bg': 'rgba(102, 126, 234, 0.1)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      },
      dark: {
        '--background': '222.2 84% 4.9%',
        '--foreground': '300 100% 99%',
        '--primary': '221 83% 53%',
        '--primary-foreground': '300 100% 99%',
        '--secondary': '43 96% 56%',
        '--secondary-foreground': '222.2 84% 4.9%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '300 100% 99%',
        '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        '--glass-bg': 'rgba(102, 126, 234, 0.15)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }
    }
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Deep ocean blues with coral and seafoam accents',
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
      primary: '#1e40af',
      secondary: '#06b6d4',
      background: '#f0f9ff',
      accent: '#f97316'
    },
    variables: {
      light: {
        '--background': '204 100% 97%',
        '--foreground': '213 31% 9%',
        '--primary': '213 94% 68%',
        '--primary-foreground': '204 100% 97%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '213 31% 9%',
        '--accent': '24 95% 53%',
        '--accent-foreground': '204 100% 97%',
        '--gradient-primary': 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
        '--glass-bg': 'rgba(30, 64, 175, 0.1)',
        '--glass-border': 'rgba(6, 182, 212, 0.2)',
      },
      dark: {
        '--background': '213 31% 9%',
        '--foreground': '204 100% 97%',
        '--primary': '213 94% 68%',
        '--primary-foreground': '204 100% 97%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '213 31% 9%',
        '--accent': '24 95% 53%',
        '--accent-foreground': '204 100% 97%',
        '--gradient-primary': 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
        '--glass-bg': 'rgba(30, 64, 175, 0.15)',
        '--glass-border': 'rgba(6, 182, 212, 0.2)',
      }
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Rich forest greens with earthy browns and golden highlights',
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
      primary: '#059669',
      secondary: '#92400e',
      background: '#f0fdf4',
      accent: '#eab308'
    },
    variables: {
      light: {
        '--background': '151 81% 96%',
        '--foreground': '151 55% 9%',
        '--primary': '160 84% 39%',
        '--primary-foreground': '151 81% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '151 81% 96%',
        '--accent': '48 96% 53%',
        '--accent-foreground': '151 55% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #059669 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #eab308 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(5, 150, 105, 0.1)',
        '--glass-border': 'rgba(234, 179, 8, 0.2)',
      },
      dark: {
        '--background': '151 55% 9%',
        '--foreground': '151 81% 96%',
        '--primary': '160 84% 39%',
        '--primary-foreground': '151 81% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '151 81% 96%',
        '--accent': '48 96% 53%',
        '--accent-foreground': '151 55% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #059669 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #eab308 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(5, 150, 105, 0.15)',
        '--glass-border': 'rgba(234, 179, 8, 0.2)',
      }
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Vibrant sunset oranges with deep purples and warm pinks',
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
      primary: '#ea580c',
      secondary: '#7c2d12',
      background: '#fffbeb',
      accent: '#ec4899'
    },
    variables: {
      light: {
        '--background': '48 100% 96%',
        '--foreground': '45 29% 9%',
        '--primary': '20 91% 48%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '15 75% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '48 100% 96%',
        '--gradient-primary': 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        '--glass-bg': 'rgba(234, 88, 12, 0.1)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      },
      dark: {
        '--background': '45 29% 9%',
        '--foreground': '48 100% 96%',
        '--primary': '20 91% 48%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '15 75% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '48 100% 96%',
        '--gradient-primary': 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        '--glass-bg': 'rgba(234, 88, 12, 0.15)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }
    }
  },
  {
    id: 'purple-galaxy',
    name: 'Purple Galaxy',
    description: 'Cosmic purples with stellar blues and nebula pinks',
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
      primary: '#7c3aed',
      secondary: '#1e40af',
      background: '#faf5ff',
      accent: '#f472b6'
    },
    variables: {
      light: {
        '--background': '270 100% 98%',
        '--foreground': '270 15% 9%',
        '--primary': '262 83% 58%',
        '--primary-foreground': '270 100% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '270 100% 98%',
        '--accent': '322 87% 68%',
        '--accent-foreground': '270 15% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
        '--glass-bg': 'rgba(124, 58, 237, 0.1)',
        '--glass-border': 'rgba(244, 114, 182, 0.2)',
      },
      dark: {
        '--background': '270 15% 9%',
        '--foreground': '270 100% 98%',
        '--primary': '262 83% 58%',
        '--primary-foreground': '270 100% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '270 100% 98%',
        '--accent': '322 87% 68%',
        '--accent-foreground': '270 15% 9%',
        '--gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
        '--glass-bg': 'rgba(124, 58, 237, 0.15)',
        '--glass-border': 'rgba(244, 114, 182, 0.2)',
      }
    }
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    description: 'Clean grays with subtle blue and green accents',
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
      secondary: '#3b82f6',
      background: '#f9fafb',
      accent: '#10b981'
    },
    variables: {
      light: {
        '--background': '210 20% 98%',
        '--foreground': '220 9% 9%',
        '--primary': '220 9% 46%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '210 20% 98%',
        '--accent': '160 84% 39%',
        '--accent-foreground': '210 20% 98%',
        '--gradient-primary': 'linear-gradient(135deg, #6b7280 0%, #3b82f6 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        '--glass-bg': 'rgba(107, 114, 128, 0.1)',
        '--glass-border': 'rgba(59, 130, 246, 0.2)',
      },
      dark: {
        '--background': '220 9% 9%',
        '--foreground': '210 20% 98%',
        '--primary': '220 9% 46%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '210 20% 98%',
        '--accent': '160 84% 39%',
        '--accent-foreground': '210 20% 98%',
        '--gradient-primary': 'linear-gradient(135deg, #6b7280 0%, #3b82f6 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        '--glass-bg': 'rgba(107, 114, 128, 0.15)',
        '--glass-border': 'rgba(59, 130, 246, 0.2)',
      }
    }
  },
  {
    id: 'coral-reef',
    name: 'Coral Reef',
    description: 'Vibrant coral with teal depths and golden highlights',
    icon: '🪸',
    personality: {
      typography: {
        fontWeight: 'medium',
        letterSpacing: 'normal',
        lineHeight: 'relaxed',
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
        backgroundPattern: 'waves',
        ambientAnimation: 'gentle',
        cursorStyle: 'default',
        interactionFeedback: 'enhanced'
      }
    },
    preview: {
      primary: '#ff6b6b',
      secondary: '#0891b2',
      background: '#fef7f0',
      accent: '#fbbf24'
    },
    variables: {
      light: {
        '--background': '25 100% 97%',
        '--foreground': '15 25% 15%',
        '--primary': '0 84% 70%',
        '--primary-foreground': '25 100% 97%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '25 100% 97%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--gradient-primary': 'linear-gradient(135deg, #ff6b6b 0%, #0891b2 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(255, 107, 107, 0.1)',
        '--glass-border': 'rgba(8, 145, 178, 0.2)',
      },
      dark: {
        '--background': '15 25% 15%',
        '--foreground': '25 100% 97%',
        '--primary': '0 84% 70%',
        '--primary-foreground': '25 100% 97%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '25 100% 97%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--gradient-primary': 'linear-gradient(135deg, #ff6b6b 0%, #0891b2 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(255, 107, 107, 0.15)',
        '--glass-border': 'rgba(8, 145, 178, 0.2)',
      }
    }
  },
  {
    id: 'midnight-aurora',
    name: 'Midnight Aurora',
    description: 'Deep midnight blues with aurora greens and cosmic purples',
    icon: '🌌',
    personality: {
      typography: {
        fontWeight: 'normal',
        letterSpacing: 'wide',
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
      primary: '#1e293b',
      secondary: '#10b981',
      background: '#0f172a',
      accent: '#8b5cf6'
    },
    variables: {
      light: {
        '--background': '222 47% 11%',
        '--foreground': '210 40% 98%',
        '--primary': '215 28% 17%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '160 84% 39%',
        '--secondary-foreground': '222 47% 11%',
        '--accent': '262 83% 58%',
        '--accent-foreground': '210 40% 98%',
        '--gradient-primary': 'linear-gradient(135deg, #1e293b 0%, #10b981 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        '--glass-bg': 'rgba(30, 41, 59, 0.1)',
        '--glass-border': 'rgba(16, 185, 129, 0.2)',
      },
      dark: {
        '--background': '222 47% 11%',
        '--foreground': '210 40% 98%',
        '--primary': '215 28% 17%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '160 84% 39%',
        '--secondary-foreground': '222 47% 11%',
        '--accent': '262 83% 58%',
        '--accent-foreground': '210 40% 98%',
        '--gradient-primary': 'linear-gradient(135deg, #1e293b 0%, #10b981 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        '--glass-bg': 'rgba(30, 41, 59, 0.15)',
        '--glass-border': 'rgba(16, 185, 129, 0.2)',
      }
    }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm golds with rich browns and sunset crimsons',
    icon: '🌇',
    personality: {
      typography: {
        fontWeight: 'semibold',
        letterSpacing: 'normal',
        lineHeight: 'normal',
        textRendering: 'crisp'
      },
      layout: {
        borderRadius: 'rounded',
        spacing: 'compact',
        density: 'normal',
        cardStyle: 'elevated'
      },
      effects: {
        glassmorphism: 'medium',
        shadows: 'dramatic',
        animations: 'smooth',
        transitions: 'quick'
      },
      atmosphere: {
        backgroundPattern: 'grid',
        ambientAnimation: 'subtle',
        cursorStyle: 'default',
        interactionFeedback: 'enhanced'
      }
    },
    preview: {
      primary: '#d97706',
      secondary: '#92400e',
      background: '#fffbeb',
      accent: '#dc2626'
    },
    variables: {
      light: {
        '--background': '48 100% 96%',
        '--foreground': '30 100% 9%',
        '--primary': '32 95% 44%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--accent': '0 84% 60%',
        '--accent-foreground': '48 100% 96%',
        '--gradient-primary': 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        '--glass-bg': 'rgba(217, 119, 6, 0.1)',
        '--glass-border': 'rgba(220, 38, 38, 0.2)',
      },
      dark: {
        '--background': '30 100% 9%',
        '--foreground': '48 100% 96%',
        '--primary': '32 95% 44%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--accent': '0 84% 60%',
        '--accent-foreground': '48 100% 96%',
        '--gradient-primary': 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        '--glass-bg': 'rgba(217, 119, 6, 0.15)',
        '--glass-border': 'rgba(220, 38, 38, 0.2)',
      }
    }
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Electric blues with hot pinks and neon greens',
    icon: '🌃',
    personality: {
      typography: {
        fontWeight: 'bold',
        letterSpacing: 'wide',
        lineHeight: 'tight',
        textRendering: 'geometric'
      },
      layout: {
        borderRadius: 'sharp',
        spacing: 'compact',
        density: 'dense',
        cardStyle: 'flat'
      },
      effects: {
        glassmorphism: 'intense',
        shadows: 'glow',
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
      primary: '#0ea5e9',
      secondary: '#ec4899',
      background: '#0f172a',
      accent: '#22c55e'
    },
    variables: {
      light: {
        '--background': '222 47% 11%',
        '--foreground': '0 0% 100%',
        '--primary': '199 89% 48%',
        '--primary-foreground': '222 47% 11%',
        '--secondary': '330 81% 60%',
        '--secondary-foreground': '222 47% 11%',
        '--accent': '142 76% 36%',
        '--accent-foreground': '222 47% 11%',
        '--gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(14, 165, 233, 0.1)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      },
      dark: {
        '--background': '222 47% 11%',
        '--foreground': '0 0% 100%',
        '--primary': '199 89% 48%',
        '--primary-foreground': '222 47% 11%',
        '--secondary': '330 81% 60%',
        '--secondary-foreground': '222 47% 11%',
        '--accent': '142 76% 36%',
        '--accent-foreground': '222 47% 11%',
        '--gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(14, 165, 233, 0.15)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }
    }
  },
  {
    id: 'sakura-bloom',
    name: 'Sakura Bloom',
    description: 'Soft cherry blossoms with spring greens and warm creams',
    icon: '🌸',
    personality: {
      typography: {
        fontWeight: 'light',
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
        glassmorphism: 'subtle',
        shadows: 'soft',
        animations: 'smooth',
        transitions: 'flowing'
      },
      atmosphere: {
        backgroundPattern: 'dots',
        ambientAnimation: 'gentle',
        cursorStyle: 'default',
        interactionFeedback: 'standard'
      }
    },
    preview: {
      primary: '#f472b6',
      secondary: '#65a30d',
      background: '#fef7f0',
      accent: '#fbbf24'
    },
    variables: {
      light: {
        '--background': '25 100% 97%',
        '--foreground': '15 25% 15%',
        '--primary': '322 87% 68%',
        '--primary-foreground': '25 100% 97%',
        '--secondary': '84 81% 44%',
        '--secondary-foreground': '25 100% 97%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--gradient-primary': 'linear-gradient(135deg, #f472b6 0%, #65a30d 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(244, 114, 182, 0.1)',
        '--glass-border': 'rgba(101, 163, 13, 0.2)',
      },
      dark: {
        '--background': '15 25% 15%',
        '--foreground': '25 100% 97%',
        '--primary': '322 87% 68%',
        '--primary-foreground': '25 100% 97%',
        '--secondary': '84 81% 44%',
        '--secondary-foreground': '25 100% 97%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--gradient-primary': 'linear-gradient(135deg, #f472b6 0%, #65a30d 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(244, 114, 182, 0.15)',
        '--glass-border': 'rgba(101, 163, 13, 0.2)',
      }
    }
  },
];

export const getThemeById = (id: string): ThemeConfig | undefined => {
  return themes.find(theme => theme.id === id);
};

export const getDefaultTheme = (): ThemeConfig => {
  return themes[0]; // Default theme
};
