import { useState, useCallback } from 'react';

type MascotEmotion = 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'confused' | 'proud' | 'sleepy' | 'focused';

interface MascotState {
  emotion: MascotEmotion;
  message: string;
  isVisible: boolean;
  showMessage: boolean;
  position: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
}

export const useMascot = () => {
  const [mascotState, setMascotState] = useState<MascotState>({
    emotion: 'idle',
    message: '',
    isVisible: false,
    showMessage: false,
    position: 'bottom-right'
  });

  const setEmotion = useCallback((emotion: MascotEmotion) => {
    setMascotState(prev => ({ ...prev, emotion }));
  }, []);

  const showMessage = useCallback((message: string, emotion: MascotEmotion = 'happy') => {
    setMascotState(prev => ({
      ...prev,
      emotion,
      message,
      showMessage: true,
      isVisible: true
    }));

    // Auto-hide message after 5 seconds
    setTimeout(() => {
      setMascotState(prev => ({ ...prev, showMessage: false }));
    }, 5000);
  }, []);

  const hideMessage = useCallback(() => {
    setMascotState(prev => ({ ...prev, showMessage: false, message: '' }));
  }, []);

  const showMascot = useCallback((
    emotion: MascotEmotion = 'happy',
    message: string = '',
    position: MascotState['position'] = 'bottom-right'
  ) => {
    setMascotState({
      emotion,
      message,
      isVisible: true,
      showMessage: message.length > 0,
      position
    });
  }, []);

  const hideMascot = useCallback(() => {
    setMascotState(prev => ({ ...prev, isVisible: false, showMessage: false }));
  }, []);

  // Specific helper functions for backwards compatibility
  const celebrateCorrectAnswer = useCallback(() => {
    showMessage('Great job! You got it right!', 'happy');
  }, [showMessage]);

  const encourageWrongAnswer = useCallback(() => {
    showMessage('No worries! Learning happens through practice.', 'encouraging');
  }, [showMessage]);

  const celebrateStreak = useCallback((streak: number) => {
    showMessage(`Amazing! ${streak} correct answers in a row!`, 'excited');
  }, [showMessage]);

  const celebratePurchase = useCallback((itemName: string) => {
    showMessage(`Awesome choice! You got ${itemName}!`, 'excited');
  }, [showMessage]);

  const celebrateLevelUp = useCallback((level: number) => {
    showMessage(`Fantastic! You've reached level ${level}!`, 'celebrating');
  }, [showMessage]);

  const welcomeUser = useCallback(() => {
    showMessage('Welcome to StudyNova! I\'m Nova, your AI learning companion!', 'happy');
  }, [showMessage]);

  const encourageUser = useCallback(() => {
    showMessage('Keep going! You\'re doing wonderfully!', 'encouraging');
  }, [showMessage]);

  const remindUser = useCallback(() => {
    showMessage('Ready to continue your learning journey?', 'thinking');
  }, [showMessage]);

  return {
    // State
    mascotState,
    emotion: mascotState.emotion,
    message: mascotState.message,
    isVisible: mascotState.isVisible,
    showingMessage: mascotState.showMessage,
    
    // Core functions
    setEmotion,
    showMessage,
    hideMessage,
    showMascot,
    hideMascot,
    
    // Helper functions for backwards compatibility
    celebrateCorrectAnswer,
    encourageWrongAnswer,
    celebrateStreak,
    celebratePurchase,
    celebrateLevelUp,
    welcomeUser,
    encourageUser,
    remindUser
  };
};

export default useMascot;