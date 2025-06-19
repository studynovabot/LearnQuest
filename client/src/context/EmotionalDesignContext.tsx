import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useMascot } from '@/hooks/useMascot';
import { useMicroInteractions } from '@/hooks/useMicroInteractions';
// Sound functionality removed for stability

interface EmotionalDesignContextType {
  // Settings
  animationsEnabled: boolean;
  mascotEnabled: boolean;
  showWelcomeMessage: boolean;
  
  // Actions
  setAnimationsEnabled: (enabled: boolean) => void;
  setMascotEnabled: (enabled: boolean) => void;
  setWelcomeMessage: (show: boolean) => void;
  
  // Emotional responses
  celebrateCorrectAnswer: () => void;
  handleIncorrectAnswer: () => void;
  celebrateStreak: (count: number) => void;
  celebrateLevelUp: (level: number) => void;
  celebratePurchase: (item: string) => void;
  celebrateAchievement: (achievementName: string) => void;
  showEncouragement: (message?: string) => void;
  showWelcome: (isReturning?: boolean) => void;
  resetMascot: () => void;
}

interface EmotionalDesignProviderSystemsType {
  // Mascot system
  mascot: ReturnType<typeof useMascot>;
  
  // Micro-interactions
  interactions: ReturnType<typeof useMicroInteractions>;
}

interface EmotionalDesignProviderProps {
  children: ReactNode;
}

const EmotionalDesignContext = createContext<EmotionalDesignContextType | undefined>(undefined);
const EmotionalDesignSystemsContext = createContext<EmotionalDesignProviderSystemsType | undefined>(undefined);

export const EmotionalDesignProvider: React.FC<EmotionalDesignProviderProps> = ({ children }) => {
  // Settings state
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('nova-animations-enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const [mascotEnabled, setMascotEnabled] = useState(() => {
    const saved = localStorage.getItem('nova-mascot-enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Initialize systems
  const mascot = useMascot();
  const interactions = useMicroInteractions();

  // Settings handlers with persistence
  const handleSetAnimationsEnabled = useCallback((enabled: boolean) => {
    setAnimationsEnabled(enabled);
    localStorage.setItem('nova-animations-enabled', JSON.stringify(enabled));
  }, []);

  const handleSetMascotEnabled = useCallback((enabled: boolean) => {
    setMascotEnabled(enabled);
    localStorage.setItem('nova-mascot-enabled', JSON.stringify(enabled));
  }, []);

  const handleShowWelcomeMessage = useCallback((show: boolean) => {
    setShowWelcomeMessage(show);
    localStorage.setItem('nova-welcome-message', JSON.stringify(show));
  }, []);

  // Emotional response handlers
  const celebrateCorrectAnswer = useCallback(() => {
    if (animationsEnabled) {
      interactions.triggerCorrectAnswer();
    }
    if (mascotEnabled) {
      mascot.setEmotion('happy');
      mascot.showMessage('Great job! You got it right!');
    }
  }, [animationsEnabled, mascotEnabled, interactions, mascot]);

  const handleIncorrectAnswer = useCallback(() => {
    if (animationsEnabled) {
      interactions.triggerIncorrectAnswer();
    }
    if (mascotEnabled) {
      mascot.setEmotion('encouraging');
      mascot.showMessage('No worries! Learning happens through practice.');
    }
  }, [animationsEnabled, mascotEnabled, interactions, mascot]);

  const celebrateStreak = useCallback((count: number) => {
    if (animationsEnabled) {
      interactions.triggerStreakBonus(count);
    }
    if (mascotEnabled) {
      mascot.setEmotion('excited');
      mascot.showMessage(`Amazing! ${count} correct answers in a row!`);
    }
  }, [animationsEnabled, mascotEnabled, interactions, mascot]);

  const celebrateLevelUp = useCallback((level: number) => {
    if (animationsEnabled) {
      interactions.triggerLevelUp(level);
    }
    if (mascotEnabled) {
      mascot.setEmotion('celebrating');
      mascot.showMessage(`Fantastic! You've reached level ${level}!`);
    }
  }, [animationsEnabled, mascotEnabled, interactions, mascot]);

  const celebratePurchase = useCallback((item: string) => {
    if (animationsEnabled) {
      interactions.triggerPurchaseSuccess(item);
    }
    if (mascotEnabled) {
      mascot.setEmotion('excited');
      mascot.showMessage(`Awesome choice! You got ${item}!`);
    }
  }, [animationsEnabled, mascotEnabled, interactions, mascot]);

  const celebrateAchievement = useCallback((achievementName: string) => {
    if (animationsEnabled) {
      interactions.triggerAchievement(achievementName);
    }
    if (mascotEnabled) {
      mascot.setEmotion('celebrating');
      mascot.showMessage(`Achievement unlocked: ${achievementName}!`);
    }
  }, [animationsEnabled, mascotEnabled, interactions, mascot]);

  const showEncouragement = useCallback((message?: string) => {
    if (mascotEnabled) {
      mascot.setEmotion('encouraging');
      mascot.showMessage(message || 'Keep going! You\'re doing wonderfully!');
    }
  }, [mascotEnabled, mascot]);

  const showWelcome = useCallback((isReturning = false) => {
    if (mascotEnabled && showWelcomeMessage) {
      mascot.setEmotion('happy');
      const welcomeMessage = isReturning 
        ? 'Welcome back! Ready to continue your learning journey?'
        : 'Welcome to StudyNova! I\'m Nova, your AI learning companion!';
      mascot.showMessage(welcomeMessage);
    }
  }, [mascotEnabled, showWelcomeMessage, mascot]);

  const resetMascot = useCallback(() => {
    mascot.setEmotion('idle');
    mascot.hideMessage();
  }, [mascot]);

  const contextValue: EmotionalDesignContextType = {
    // Settings
    animationsEnabled,
    mascotEnabled,
    showWelcomeMessage,
    
    // Actions
    setAnimationsEnabled: handleSetAnimationsEnabled,
    setMascotEnabled: handleSetMascotEnabled,
    setWelcomeMessage: handleShowWelcomeMessage,
    
    // Emotional responses
    celebrateCorrectAnswer,
    handleIncorrectAnswer,
    celebrateStreak,
    celebrateLevelUp,
    celebratePurchase,
    celebrateAchievement,
    showEncouragement,
    showWelcome,
    resetMascot,
  };

  const systemsValue: EmotionalDesignProviderSystemsType = {
    mascot,
    interactions,
  };

  return (
    <EmotionalDesignContext.Provider value={contextValue}>
      <EmotionalDesignSystemsContext.Provider value={systemsValue}>
        {children}
      </EmotionalDesignSystemsContext.Provider>
    </EmotionalDesignContext.Provider>
  );
};

export const useEmotionalDesign = (): EmotionalDesignContextType => {
  const context = useContext(EmotionalDesignContext);
  if (!context) {
    throw new Error('useEmotionalDesign must be used within an EmotionalDesignProvider');
  }
  return context;
};

export const useEmotionalDesignSystems = (): EmotionalDesignProviderSystemsType => {
  const context = useContext(EmotionalDesignSystemsContext);
  if (!context) {
    throw new Error('useEmotionalDesignSystems must be used within an EmotionalDesignProvider');
  }
  return context;
};