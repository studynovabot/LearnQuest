import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface FeedbackState {
  id: string;
  type: 'correct' | 'incorrect' | 'streak' | 'xp' | 'achievement';
  message: string;
  position: { x: number; y: number };
  value?: number;
}

export const useMicroInteractions = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackState[]>([]);

  // Show floating feedback
  const showFeedback = useCallback((
    type: FeedbackState['type'],
    message: string,
    position?: { x: number; y: number },
    value?: number
  ) => {
    const feedback: FeedbackState = {
      id: Date.now().toString(),
      type,
      message,
      position: position || { x: 50, y: 50 },
      value
    };

    setFeedbacks(prev => [...prev, feedback]);

    // Remove feedback after animation
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== feedback.id));
    }, 2500);
  }, []);

  // Remove specific feedback
  const removeFeedback = useCallback((id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  }, []);

  // Trigger confetti celebration
  const celebrateWithConfetti = useCallback((intensity: 'low' | 'medium' | 'high' = 'medium') => {
    const configs = {
      low: { particleCount: 50, spread: 45 },
      medium: { particleCount: 100, spread: 70 },
      high: { particleCount: 200, spread: 90 }
    };

    const config = configs[intensity];
    
    confetti({
      particleCount: config.particleCount,
      spread: config.spread,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    });
  }, []);

  // Specific interaction functions
  const triggerCorrectAnswer = useCallback((position?: { x: number; y: number }, xpValue?: number) => {
    showFeedback('correct', 'Correct!', position, xpValue);
    celebrateWithConfetti('low');
  }, [showFeedback, celebrateWithConfetti]);

  const triggerIncorrectAnswer = useCallback((position?: { x: number; y: number }) => {
    showFeedback('incorrect', 'Keep trying!', position);
  }, [showFeedback]);

  const triggerStreakBonus = useCallback((streakDays: number, position?: { x: number; y: number }) => {
    showFeedback('streak', `${streakDays} Day Streak!`, position);
    celebrateWithConfetti('medium');
  }, [showFeedback, celebrateWithConfetti]);

  const triggerXPGain = useCallback((xpAmount: number, position?: { x: number; y: number }) => {
    showFeedback('xp', 'XP Gained', position, xpAmount);
  }, [showFeedback]);

  const triggerAchievement = useCallback((achievementName: string, position?: { x: number; y: number }) => {
    showFeedback('achievement', `${achievementName} Unlocked!`, position);
    celebrateWithConfetti('high');
  }, [showFeedback, celebrateWithConfetti]);

  // Trigger task completion feedback
  const triggerTaskCompletion = useCallback((taskName: string, xpGained: number) => {
    showFeedback('correct', `${taskName} completed!`, { x: 50, y: 30 }, xpGained);
    celebrateWithConfetti('medium');
  }, [showFeedback, celebrateWithConfetti]);

  // Trigger level up celebration
  const triggerLevelUp = useCallback((newLevel: number) => {
    showFeedback('achievement', `Level ${newLevel} Reached!`, { x: 50, y: 50 });
    
    // Multiple confetti bursts for level up
    celebrateWithConfetti('high');
    setTimeout(() => celebrateWithConfetti('medium'), 300);
    setTimeout(() => celebrateWithConfetti('low'), 600);
  }, [showFeedback, celebrateWithConfetti]);

  // Trigger purchase success
  const triggerPurchaseSuccess = useCallback((itemName: string) => {
    showFeedback('achievement', `${itemName} purchased!`, { x: 50, y: 40 });
    celebrateWithConfetti('medium');
  }, [showFeedback, celebrateWithConfetti]);

  // Button press feedback with haptic-like effect
  const triggerButtonPress = useCallback((element?: HTMLElement) => {
    if (element) {
      // Add a subtle scale animation
      element.style.transform = 'scale(0.95)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 100);
    }
  }, []);

  // Smooth hover effects
  const triggerHoverEffect = useCallback((element?: HTMLElement, type: 'lift' | 'glow' | 'scale' = 'lift') => {
    if (!element) return;

    switch (type) {
      case 'lift':
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        break;
      case 'glow':
        element.style.boxShadow = '0 0 20px rgba(59,130,246,0.3)';
        break;
      case 'scale':
        element.style.transform = 'scale(1.02)';
        break;
    }
  }, []);

  const removeHoverEffect = useCallback((element?: HTMLElement) => {
    if (!element) return;
    
    element.style.transform = '';
    element.style.boxShadow = '';
  }, []);

  // Loading state animations
  const triggerLoadingPulse = useCallback((element?: HTMLElement) => {
    if (!element) return;
    
    element.classList.add('animate-pulse');
    return () => element.classList.remove('animate-pulse');
  }, []);

  // Success ripple effect
  const triggerSuccessRipple = useCallback((element?: HTMLElement) => {
    if (!element) return;

    const ripple = document.createElement('div');
    ripple.className = 'absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20';
    
    const parent = element.parentNode as HTMLElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(ripple);
      
      setTimeout(() => {
        parent.removeChild(ripple);
      }, 1000);
    }
  }, []);

  return {
    // State
    feedbacks,
    
    // General functions
    showFeedback,
    removeFeedback,
    celebrateWithConfetti,
    
    // Specific interactions
    triggerCorrectAnswer,
    triggerIncorrectAnswer,
    triggerStreakBonus,
    triggerXPGain,
    triggerAchievement,
    triggerTaskCompletion,
    triggerLevelUp,
    triggerPurchaseSuccess,
    
    // UI interactions
    triggerButtonPress,
    triggerHoverEffect,
    removeHoverEffect,
    triggerLoadingPulse,
    triggerSuccessRipple
  };
};

export default useMicroInteractions;