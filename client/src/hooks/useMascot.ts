import { useState, useCallback } from 'react';

interface MascotContext {
  streak?: number;
  xp?: number;
  level?: number;
  itemName?: string;
}

interface MascotState {
  isVisible: boolean;
  trigger: 'login' | 'correct' | 'wrong' | 'streak' | 'purchase' | 'levelup' | 'encouragement' | 'reminder';
  context: MascotContext;
  position: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
}

export const useMascot = () => {
  const [mascotState, setMascotState] = useState<MascotState>({
    isVisible: false,
    trigger: 'encouragement',
    context: {},
    position: 'bottom-right'
  });

  const showMascot = useCallback((
    trigger: MascotState['trigger'],
    context: MascotContext = {},
    position: MascotState['position'] = 'bottom-right'
  ) => {
    setMascotState({
      isVisible: true,
      trigger,
      context,
      position
    });
  }, []);

  const hideMascot = useCallback(() => {
    setMascotState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Specific helper functions
  const celebrateCorrectAnswer = useCallback(() => {
    showMascot('correct');
  }, [showMascot]);

  const encourageWrongAnswer = useCallback(() => {
    showMascot('wrong');
  }, [showMascot]);

  const celebrateStreak = useCallback((streak: number) => {
    showMascot('streak', { streak });
  }, [showMascot]);

  const celebratePurchase = useCallback((itemName: string) => {
    showMascot('purchase', { itemName });
  }, [showMascot]);

  const celebrateLevelUp = useCallback((level: number) => {
    showMascot('levelup', { level }, 'center');
  }, [showMascot]);

  const welcomeUser = useCallback(() => {
    showMascot('login');
  }, [showMascot]);

  const encourageUser = useCallback(() => {
    showMascot('encouragement');
  }, [showMascot]);

  const remindUser = useCallback(() => {
    showMascot('reminder');
  }, [showMascot]);

  return {
    mascotState,
    showMascot,
    hideMascot,
    // Helper functions
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