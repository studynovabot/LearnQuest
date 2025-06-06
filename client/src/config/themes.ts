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

// Helper function to add sidebar variables to theme variables
const addSidebarVariables = (variables: Record<string, string>, isDark: boolean = false): Record<string, string> => {
  const sidebarVars = isDark ? {
    '--sidebar-background': variables['--card'] || variables['--background'],
    '--sidebar-foreground': variables['--foreground'],
    '--sidebar-primary': variables['--primary'],
    '--sidebar-primary-foreground': variables['--primary-foreground'],
    '--sidebar-accent': variables['--secondary'] || variables['--accent'],
    '--sidebar-accent-foreground': variables['--secondary-foreground'] || variables['--accent-foreground'],
    '--sidebar-border': variables['--border'],
    '--sidebar-ring': variables['--ring'],
  } : {
    '--sidebar-background': variables['--card'] || variables['--background'],
    '--sidebar-foreground': variables['--foreground'],
    '--sidebar-primary': variables['--primary'],
    '--sidebar-primary-foreground': variables['--primary-foreground'],
    '--sidebar-accent': variables['--muted'] || variables['--accent'],
    '--sidebar-accent-foreground': variables['--foreground'],
    '--sidebar-border': variables['--border'],
    '--sidebar-ring': variables['--ring'],
  };
  
  return { ...variables, ...sidebarVars };
};

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
      light: addSidebarVariables({
        '--background': '300 100% 99%',
        '--foreground': '222.2 84% 4.9%',
        '--card': '300 100% 97%',
        '--card-foreground': '222.2 84% 4.9%',
        '--popover': '300 100% 97%',
        '--popover-foreground': '222.2 84% 4.9%',
        '--primary': '221 83% 53%',
        '--primary-foreground': '300 100% 99%',
        '--secondary': '43 96% 56%',
        '--secondary-foreground': '222.2 84% 4.9%',
        '--muted': '210 40% 96%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '300 100% 99%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '300 100% 99%',
        '--border': '214.3 31.8% 91.4%',
        '--input': '214.3 31.8% 91.4%',
        '--ring': '221 83% 53%',
        '--sidebar-background': '300 100% 97%',
        '--sidebar-foreground': '222.2 84% 4.9%',
        '--sidebar-primary': '221 83% 53%',
        '--sidebar-primary-foreground': '300 100% 99%',
        '--sidebar-accent': '210 40% 96%',
        '--sidebar-accent-foreground': '222.2 84% 4.9%',
        '--sidebar-border': '214.3 31.8% 91.4%',
        '--sidebar-ring': '221 83% 53%',
        '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        '--glass-bg': 'rgba(102, 126, 234, 0.1)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '222.2 84% 4.9%',
        '--foreground': '300 100% 99%',
        '--card': '222.2 84% 6%',
        '--card-foreground': '300 100% 99%',
        '--popover': '222.2 84% 6%',
        '--popover-foreground': '300 100% 99%',
        '--primary': '221 83% 53%',
        '--primary-foreground': '300 100% 99%',
        '--secondary': '43 96% 56%',
        '--secondary-foreground': '222.2 84% 4.9%',
        '--muted': '220 13% 18%',
        '--muted-foreground': '215 16% 75%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '300 100% 99%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '300 100% 99%',
        '--border': '220 13% 18%',
        '--input': '220 13% 18%',
        '--ring': '221 83% 53%',
        '--sidebar-background': '222.2 84% 6%',
        '--sidebar-foreground': '300 100% 99%',
        '--sidebar-primary': '221 83% 53%',
        '--sidebar-primary-foreground': '300 100% 99%',
        '--sidebar-accent': '250 50% 50%',
        '--sidebar-accent-foreground': '300 100% 99%',
        '--sidebar-border': '220 13% 18%',
        '--sidebar-ring': '221 83% 53%',
        '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        '--glass-bg': 'rgba(102, 126, 234, 0.15)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '204 100% 97%',
        '--foreground': '213 31% 9%',
        '--card': '204 100% 95%',
        '--card-foreground': '213 31% 9%',
        '--popover': '204 100% 95%',
        '--popover-foreground': '213 31% 9%',
        '--primary': '213 94% 68%',
        '--primary-foreground': '204 100% 97%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '213 31% 9%',
        '--muted': '204 40% 90%',
        '--muted-foreground': '213 16% 40%',
        '--accent': '24 95% 53%',
        '--accent-foreground': '204 100% 97%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '204 100% 97%',
        '--border': '204 31.8% 85%',
        '--input': '204 31.8% 85%',
        '--ring': '213 94% 68%',
        '--sidebar-background': '204 100% 95%',
        '--sidebar-foreground': '213 31% 9%',
        '--sidebar-primary': '213 94% 68%',
        '--sidebar-primary-foreground': '204 100% 97%',
        '--sidebar-accent': '204 40% 90%',
        '--sidebar-accent-foreground': '213 31% 9%',
        '--sidebar-border': '204 31.8% 85%',
        '--sidebar-ring': '213 94% 68%',
        '--gradient-primary': 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
        '--glass-bg': 'rgba(30, 64, 175, 0.1)',
        '--glass-border': 'rgba(6, 182, 212, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '213 31% 9%',
        '--foreground': '204 100% 97%',
        '--card': '213 31% 12%',
        '--card-foreground': '204 100% 97%',
        '--popover': '213 31% 12%',
        '--popover-foreground': '204 100% 97%',
        '--primary': '213 94% 68%',
        '--primary-foreground': '213 31% 9%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '213 31% 9%',
        '--muted': '213 13% 18%',
        '--muted-foreground': '204 16% 75%',
        '--accent': '24 95% 53%',
        '--accent-foreground': '213 31% 9%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '204 100% 97%',
        '--border': '213 13% 18%',
        '--input': '213 13% 18%',
        '--ring': '213 94% 68%',
        '--sidebar-background': '213 31% 12%',
        '--sidebar-foreground': '204 100% 97%',
        '--sidebar-primary': '213 94% 68%',
        '--sidebar-primary-foreground': '213 31% 9%',
        '--sidebar-accent': '188 95% 43%',
        '--sidebar-accent-foreground': '213 31% 9%',
        '--sidebar-border': '213 13% 18%',
        '--sidebar-ring': '213 94% 68%',
        '--gradient-primary': 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
        '--glass-bg': 'rgba(30, 64, 175, 0.15)',
        '--glass-border': 'rgba(6, 182, 212, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '151 81% 96%',
        '--foreground': '151 55% 9%',
        '--card': '151 81% 94%',
        '--card-foreground': '151 55% 9%',
        '--popover': '151 81% 94%',
        '--popover-foreground': '151 55% 9%',
        '--primary': '160 84% 39%',
        '--primary-foreground': '151 81% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '151 81% 96%',
        '--muted': '151 40% 88%',
        '--muted-foreground': '151 16% 40%',
        '--accent': '48 96% 53%',
        '--accent-foreground': '151 55% 9%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '151 81% 96%',
        '--border': '151 31.8% 82%',
        '--input': '151 31.8% 82%',
        '--ring': '160 84% 39%',
        '--gradient-primary': 'linear-gradient(135deg, #059669 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #eab308 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(5, 150, 105, 0.1)',
        '--glass-border': 'rgba(234, 179, 8, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '151 55% 9%',
        '--foreground': '151 81% 96%',
        '--card': '151 55% 12%',
        '--card-foreground': '151 81% 96%',
        '--popover': '151 55% 12%',
        '--popover-foreground': '151 81% 96%',
        '--primary': '160 84% 39%',
        '--primary-foreground': '151 81% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '151 81% 96%',
        '--muted': '151 13% 18%',
        '--muted-foreground': '151 16% 75%',
        '--accent': '48 96% 53%',
        '--accent-foreground': '151 55% 9%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '151 81% 96%',
        '--border': '151 13% 18%',
        '--input': '151 13% 18%',
        '--ring': '160 84% 39%',
        '--gradient-primary': 'linear-gradient(135deg, #059669 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #eab308 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(5, 150, 105, 0.15)',
        '--glass-border': 'rgba(234, 179, 8, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '48 100% 96%',
        '--foreground': '45 29% 9%',
        '--card': '48 100% 94%',
        '--card-foreground': '45 29% 9%',
        '--popover': '48 100% 94%',
        '--popover-foreground': '45 29% 9%',
        '--primary': '20 91% 48%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '15 75% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--muted': '48 40% 88%',
        '--muted-foreground': '45 16% 40%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '48 100% 96%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '48 100% 96%',
        '--border': '48 31.8% 82%',
        '--input': '48 31.8% 82%',
        '--ring': '20 91% 48%',
        '--gradient-primary': 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        '--glass-bg': 'rgba(234, 88, 12, 0.1)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '45 29% 9%',
        '--foreground': '48 100% 96%',
        '--card': '45 29% 12%',
        '--card-foreground': '48 100% 96%',
        '--popover': '45 29% 12%',
        '--popover-foreground': '48 100% 96%',
        '--primary': '20 91% 48%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '15 75% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--muted': '45 13% 18%',
        '--muted-foreground': '48 16% 75%',
        '--accent': '330 81% 60%',
        '--accent-foreground': '45 29% 9%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '48 100% 96%',
        '--border': '45 13% 18%',
        '--input': '45 13% 18%',
        '--ring': '20 91% 48%',
        '--gradient-primary': 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        '--glass-bg': 'rgba(234, 88, 12, 0.15)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '270 100% 98%',
        '--foreground': '270 15% 9%',
        '--card': '270 100% 96%',
        '--card-foreground': '270 15% 9%',
        '--popover': '270 100% 96%',
        '--popover-foreground': '270 15% 9%',
        '--primary': '262 83% 58%',
        '--primary-foreground': '270 100% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '270 100% 98%',
        '--muted': '270 40% 90%',
        '--muted-foreground': '270 16% 40%',
        '--accent': '322 87% 68%',
        '--accent-foreground': '270 15% 9%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '270 100% 98%',
        '--border': '270 31.8% 85%',
        '--input': '270 31.8% 85%',
        '--ring': '262 83% 58%',
        '--gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
        '--glass-bg': 'rgba(124, 58, 237, 0.1)',
        '--glass-border': 'rgba(244, 114, 182, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '270 15% 9%',
        '--foreground': '270 100% 98%',
        '--card': '270 15% 12%',
        '--card-foreground': '270 100% 98%',
        '--popover': '270 15% 12%',
        '--popover-foreground': '270 100% 98%',
        '--primary': '262 83% 58%',
        '--primary-foreground': '270 100% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '270 15% 9%',
        '--muted': '270 13% 18%',
        '--muted-foreground': '270 16% 75%',
        '--accent': '322 87% 68%',
        '--accent-foreground': '270 15% 9%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '270 100% 98%',
        '--border': '270 13% 18%',
        '--input': '270 13% 18%',
        '--ring': '262 83% 58%',
        '--gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
        '--glass-bg': 'rgba(124, 58, 237, 0.15)',
        '--glass-border': 'rgba(244, 114, 182, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '210 20% 98%',
        '--foreground': '220 9% 9%',
        '--card': '210 20% 96%',
        '--card-foreground': '220 9% 9%',
        '--popover': '210 20% 96%',
        '--popover-foreground': '220 9% 9%',
        '--primary': '220 9% 46%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '210 20% 98%',
        '--muted': '210 40% 92%',
        '--muted-foreground': '220 16% 40%',
        '--accent': '160 84% 39%',
        '--accent-foreground': '210 20% 98%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 20% 98%',
        '--border': '210 31.8% 88%',
        '--input': '210 31.8% 88%',
        '--ring': '220 9% 46%',
        '--gradient-primary': 'linear-gradient(135deg, #6b7280 0%, #3b82f6 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        '--glass-bg': 'rgba(107, 114, 128, 0.1)',
        '--glass-border': 'rgba(59, 130, 246, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '220 9% 9%',
        '--foreground': '210 20% 98%',
        '--card': '220 9% 12%',
        '--card-foreground': '210 20% 98%',
        '--popover': '220 9% 12%',
        '--popover-foreground': '210 20% 98%',
        '--primary': '220 9% 46%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '213 94% 68%',
        '--secondary-foreground': '220 9% 9%',
        '--muted': '220 13% 18%',
        '--muted-foreground': '210 16% 75%',
        '--accent': '160 84% 39%',
        '--accent-foreground': '220 9% 9%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '210 20% 98%',
        '--border': '220 13% 18%',
        '--input': '220 13% 18%',
        '--ring': '220 9% 46%',
        '--gradient-primary': 'linear-gradient(135deg, #6b7280 0%, #3b82f6 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        '--glass-bg': 'rgba(107, 114, 128, 0.15)',
        '--glass-border': 'rgba(59, 130, 246, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '25 100% 97%',
        '--foreground': '15 25% 15%',
        '--card': '25 100% 95%',
        '--card-foreground': '15 25% 15%',
        '--popover': '25 100% 95%',
        '--popover-foreground': '15 25% 15%',
        '--primary': '0 84% 70%',
        '--primary-foreground': '25 100% 97%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '25 100% 97%',
        '--muted': '25 40% 90%',
        '--muted-foreground': '15 16% 40%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '25 100% 97%',
        '--border': '25 31.8% 85%',
        '--input': '25 31.8% 85%',
        '--ring': '0 84% 70%',
        '--gradient-primary': 'linear-gradient(135deg, #ff6b6b 0%, #0891b2 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(255, 107, 107, 0.1)',
        '--glass-border': 'rgba(8, 145, 178, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '15 25% 15%',
        '--foreground': '25 100% 97%',
        '--card': '15 25% 18%',
        '--card-foreground': '25 100% 97%',
        '--popover': '15 25% 18%',
        '--popover-foreground': '25 100% 97%',
        '--primary': '0 84% 70%',
        '--primary-foreground': '15 25% 15%',
        '--secondary': '188 95% 43%',
        '--secondary-foreground': '15 25% 15%',
        '--muted': '15 13% 22%',
        '--muted-foreground': '25 16% 75%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '25 100% 97%',
        '--border': '15 13% 22%',
        '--input': '15 13% 22%',
        '--ring': '0 84% 70%',
        '--gradient-primary': 'linear-gradient(135deg, #ff6b6b 0%, #0891b2 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(255, 107, 107, 0.15)',
        '--glass-border': 'rgba(8, 145, 178, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '210 40% 98%',
        '--foreground': '222 47% 11%',
        '--card': '210 40% 96%',
        '--card-foreground': '222 47% 11%',
        '--popover': '210 40% 96%',
        '--popover-foreground': '222 47% 11%',
        '--primary': '215 28% 17%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '160 84% 39%',
        '--secondary-foreground': '210 40% 98%',
        '--muted': '210 40% 92%',
        '--muted-foreground': '222 16% 40%',
        '--accent': '262 83% 58%',
        '--accent-foreground': '210 40% 98%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '210 31.8% 85%',
        '--input': '210 31.8% 85%',
        '--ring': '215 28% 17%',
        '--gradient-primary': 'linear-gradient(135deg, #1e293b 0%, #10b981 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        '--glass-bg': 'rgba(30, 41, 59, 0.1)',
        '--glass-border': 'rgba(16, 185, 129, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '222 47% 11%',
        '--foreground': '210 40% 98%',
        '--card': '222 47% 14%',
        '--card-foreground': '210 40% 98%',
        '--popover': '222 47% 14%',
        '--popover-foreground': '210 40% 98%',
        '--primary': '215 28% 17%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '160 84% 39%',
        '--secondary-foreground': '222 47% 11%',
        '--muted': '222 13% 18%',
        '--muted-foreground': '210 16% 75%',
        '--accent': '262 83% 58%',
        '--accent-foreground': '222 47% 11%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '222 13% 18%',
        '--input': '222 13% 18%',
        '--ring': '215 28% 17%',
        '--gradient-primary': 'linear-gradient(135deg, #1e293b 0%, #10b981 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        '--glass-bg': 'rgba(30, 41, 59, 0.15)',
        '--glass-border': 'rgba(16, 185, 129, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '48 100% 96%',
        '--foreground': '30 100% 9%',
        '--card': '48 100% 94%',
        '--card-foreground': '30 100% 9%',
        '--popover': '48 100% 94%',
        '--popover-foreground': '30 100% 9%',
        '--primary': '32 95% 44%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--muted': '48 40% 88%',
        '--muted-foreground': '30 16% 40%',
        '--accent': '0 84% 60%',
        '--accent-foreground': '48 100% 96%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '48 100% 96%',
        '--border': '48 31.8% 82%',
        '--input': '48 31.8% 82%',
        '--ring': '32 95% 44%',
        '--gradient-primary': 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        '--glass-bg': 'rgba(217, 119, 6, 0.1)',
        '--glass-border': 'rgba(220, 38, 38, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '30 100% 9%',
        '--foreground': '48 100% 96%',
        '--card': '30 100% 12%',
        '--card-foreground': '48 100% 96%',
        '--popover': '30 100% 12%',
        '--popover-foreground': '48 100% 96%',
        '--primary': '32 95% 44%',
        '--primary-foreground': '48 100% 96%',
        '--secondary': '30 100% 28%',
        '--secondary-foreground': '48 100% 96%',
        '--muted': '30 13% 18%',
        '--muted-foreground': '48 16% 75%',
        '--accent': '0 84% 60%',
        '--accent-foreground': '30 100% 9%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '48 100% 96%',
        '--border': '30 13% 18%',
        '--input': '30 13% 18%',
        '--ring': '32 95% 44%',
        '--gradient-primary': 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        '--glass-bg': 'rgba(217, 119, 6, 0.15)',
        '--glass-border': 'rgba(220, 38, 38, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '0 0% 98%',
        '--foreground': '222 47% 11%',
        '--card': '0 0% 96%',
        '--card-foreground': '222 47% 11%',
        '--popover': '0 0% 96%',
        '--popover-foreground': '222 47% 11%',
        '--primary': '199 89% 48%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '330 81% 60%',
        '--secondary-foreground': '0 0% 98%',
        '--muted': '0 0% 92%',
        '--muted-foreground': '222 16% 40%',
        '--accent': '142 76% 36%',
        '--accent-foreground': '0 0% 98%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '0 0% 85%',
        '--input': '0 0% 85%',
        '--ring': '199 89% 48%',
        '--gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(14, 165, 233, 0.1)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '222 47% 11%',
        '--foreground': '0 0% 100%',
        '--card': '222 47% 14%',
        '--card-foreground': '0 0% 100%',
        '--popover': '222 47% 14%',
        '--popover-foreground': '0 0% 100%',
        '--primary': '199 89% 48%',
        '--primary-foreground': '222 47% 11%',
        '--secondary': '330 81% 60%',
        '--secondary-foreground': '222 47% 11%',
        '--muted': '222 13% 18%',
        '--muted-foreground': '0 16% 75%',
        '--accent': '142 76% 36%',
        '--accent-foreground': '222 47% 11%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '0 0% 100%',
        '--border': '222 13% 18%',
        '--input': '222 13% 18%',
        '--ring': '199 89% 48%',
        '--gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        '--glass-bg': 'rgba(14, 165, 233, 0.15)',
        '--glass-border': 'rgba(236, 72, 153, 0.2)',
      }, true)
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
      light: addSidebarVariables({
        '--background': '25 100% 97%',
        '--foreground': '15 25% 15%',
        '--card': '25 100% 95%',
        '--card-foreground': '15 25% 15%',
        '--popover': '25 100% 95%',
        '--popover-foreground': '15 25% 15%',
        '--primary': '322 87% 68%',
        '--primary-foreground': '25 100% 97%',
        '--secondary': '84 81% 44%',
        '--secondary-foreground': '25 100% 97%',
        '--muted': '25 40% 90%',
        '--muted-foreground': '15 16% 40%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '25 100% 97%',
        '--border': '25 31.8% 85%',
        '--input': '25 31.8% 85%',
        '--ring': '322 87% 68%',
        '--gradient-primary': 'linear-gradient(135deg, #f472b6 0%, #65a30d 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(244, 114, 182, 0.1)',
        '--glass-border': 'rgba(101, 163, 13, 0.2)',
      }),
      dark: addSidebarVariables({
        '--background': '15 25% 15%',
        '--foreground': '25 100% 97%',
        '--card': '15 25% 18%',
        '--card-foreground': '25 100% 97%',
        '--popover': '15 25% 18%',
        '--popover-foreground': '25 100% 97%',
        '--primary': '322 87% 68%',
        '--primary-foreground': '15 25% 15%',
        '--secondary': '84 81% 44%',
        '--secondary-foreground': '15 25% 15%',
        '--muted': '15 13% 22%',
        '--muted-foreground': '25 16% 75%',
        '--accent': '43 96% 56%',
        '--accent-foreground': '15 25% 15%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '25 100% 97%',
        '--border': '15 13% 22%',
        '--input': '15 13% 22%',
        '--ring': '322 87% 68%',
        '--gradient-primary': 'linear-gradient(135deg, #f472b6 0%, #65a30d 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        '--glass-bg': 'rgba(244, 114, 182, 0.15)',
        '--glass-border': 'rgba(101, 163, 13, 0.2)',
      }, true)
    }
  },
];

export const getThemeById = (id: string): ThemeConfig | undefined => {
  return themes.find(theme => theme.id === id);
};

export const getDefaultTheme = (): ThemeConfig => {
  return themes[0]; // Default theme
};
