import React, { createContext, useContext, useState, useCallback } from 'react';
import { useMascot } from '@/hooks/useMascot';
import { useMicroInteractions } from '@/hooks/useMicroInteractions';
import { useSound } from '@/hooks/useSound';

interface EmotionalDesignContextType {
  // Settings
  soundEnabled: boolean;
  animationsEnabled: boolean;
  mascotEnabled: boolean;
  
  // Actions
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setMascotEnabled: (enabled: boolean) => void;
  
  // Combined interaction methods
  celebrateCorrectAnswer: (position?: { x: number; y: number }) => void;
  handleIncorrectAnswer: (position?: { x: number; y: number }) => void;
  celebrateStreak: (days: number) => void;
  celebrateLevelUp: (level: number) => void;
  celebratePurchase: (itemName: string) => void;
  celebrateAchievement: (name: string) => void;
  showWelcomeMessage: () => void;
  showEncouragement: () => void;
  showReminder: () => void;
  
  // Mascot system
  mascot: ReturnType<typeof useMascot>;
  
  // Micro-interactions
  interactions: ReturnType<typeof useMicroInteractions>;
  
  // Sound system
  sound: ReturnType<typeof useSound>;
}

const EmotionalDesignContext = createContext<EmotionalDesignContextType | undefined>(undefined);

export const useEmotionalDesign = () => {
  const context = useContext(EmotionalDesignContext);
  if (!context) {
    throw new Error('useEmotionalDesign must be used within an EmotionalDesignProvider');
  }
  return context;
};

interface EmotionalDesignProviderProps {
  children: React.ReactNode;
}

export const EmotionalDesignProvider: React.FC<EmotionalDesignProviderProps> = ({ children }) => {
  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('nova-sound-enabled');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('nova-animations-enabled');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [mascotEnabled, setMascotEnabled] = useState(() => {
    const saved = localStorage.getItem('nova-mascot-enabled');
    return saved ? JSON.parse(saved) : true;
  });

  // Initialize systems
  const mascot = useMascot();
  const interactions = useMicroInteractions();
  const sound = useSound();

  // Settings handlers with persistence
  const handleSetSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('nova-sound-enabled', JSON.stringify(enabled));
  }, []);

  const handleSetAnimationsEnabled = useCallback((enabled: boolean) => {
    setAnimationsEnabled(enabled);
    localStorage.setItem('nova-animations-enabled', JSON.stringify(enabled));
    
    // Optionally reduce motion for accessibility
    if (!enabled) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  }, []);

  const handleSetMascotEnabled = useCallback((enabled: boolean) => {
    setMascotEnabled(enabled);
    localStorage.setItem('nova-mascot-enabled', JSON.stringify(enabled));
    
    if (!enabled) {
      mascot.hideMascot();
    }
  }, [mascot]);

  // Combined celebration methods
  const celebrateCorrectAnswer = useCallback((position?: { x: number; y: number }) => {
    if (animationsEnabled) {
      interactions.triggerCorrectAnswer(position, 25);
    }
    if (mascotEnabled) {
      mascot.celebrateCorrectAnswer();
    }
    if (soundEnabled) {
      sound.playSound('correct');
    }
  }, [animationsEnabled, mascotEnabled, soundEnabled, interactions, mascot, sound]);

  const handleIncorrectAnswer = useCallback((position?: { x: number; y: number }) => {
    if (animationsEnabled) {
      interactions.triggerIncorrectAnswer(position);
    }
    if (mascotEnabled) {
      mascot.encourageWrongAnswer();
    }
    if (soundEnabled) {
      sound.playSound('incorrect');
    }
  }, [animationsEnabled, mascotEnabled, soundEnabled, interactions, mascot, sound]);

  const celebrateStreak = useCallback((days: number) => {
    if (animationsEnabled) {
      interactions.triggerStreakBonus(days);
    }
    if (mascotEnabled) {
      mascot.celebrateStreak(days);
    }
    if (soundEnabled) {
      sound.playSound('streak');
    }
  }, [animationsEnabled, mascotEnabled, soundEnabled, interactions, mascot, sound]);

  const celebrateLevelUp = useCallback((level: number) => {
    if (animationsEnabled) {
      interactions.triggerLevelUp(level);
    }
    if (mascotEnabled) {
      mascot.celebrateLevelUp(level);
    }
    if (soundEnabled) {
      sound.playLevelUpSound();
    }
  }, [animationsEnabled, mascotEnabled, soundEnabled, interactions, mascot, sound]);

  const celebratePurchase = useCallback((itemName: string) => {
    if (animationsEnabled) {
      interactions.triggerPurchaseSuccess(itemName);
    }
    if (mascotEnabled) {
      mascot.celebratePurchase(itemName);
    }
    if (soundEnabled) {
      sound.playPurchaseSound();
    }
  }, [animationsEnabled, mascotEnabled, soundEnabled, interactions, mascot, sound]);

  const celebrateAchievement = useCallback((name: string) => {
    if (animationsEnabled) {
      interactions.triggerAchievement(name);
    }
    if (soundEnabled) {
      sound.playCelebrationSound();
    }
  }, [animationsEnabled, soundEnabled, interactions, sound]);

  const showWelcomeMessage = useCallback(() => {
    if (mascotEnabled) {
      mascot.welcomeUser();
    }
    if (soundEnabled) {
      sound.playSound('welcome');
    }
  }, [mascotEnabled, soundEnabled, mascot, sound]);

  const showEncouragement = useCallback(() => {
    if (mascotEnabled) {
      mascot.encourageUser();
    }
    if (soundEnabled) {
      sound.playSound('notification');
    }
  }, [mascotEnabled, soundEnabled, mascot, sound]);

  const showReminder = useCallback(() => {
    if (mascotEnabled) {
      mascot.remindUser();
    }
    if (soundEnabled) {
      sound.playSound('notification');
    }
  }, [mascotEnabled, soundEnabled, mascot, sound]);

  const value: EmotionalDesignContextType = {
    // Settings
    soundEnabled,
    animationsEnabled,
    mascotEnabled,
    
    // Settings handlers
    setSoundEnabled: handleSetSoundEnabled,
    setAnimationsEnabled: handleSetAnimationsEnabled,
    setMascotEnabled: handleSetMascotEnabled,
    
    // Combined methods
    celebrateCorrectAnswer,
    handleIncorrectAnswer,
    celebrateStreak,
    celebrateLevelUp,
    celebratePurchase,
    celebrateAchievement,
    showWelcomeMessage,
    showEncouragement,
    showReminder,
    
    // Direct access to systems
    mascot,
    interactions,
    sound
  };

  return (
    <EmotionalDesignContext.Provider value={value}>
      {children}
    </EmotionalDesignContext.Provider>
  );
};

export default EmotionalDesignProvider;