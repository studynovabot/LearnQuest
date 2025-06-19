import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NovaBot from './NovaBot';

interface MascotDialogueProps {
  trigger?: 'login' | 'correct' | 'wrong' | 'streak' | 'purchase' | 'levelup' | 'encouragement' | 'reminder';
  userName?: string;
  context?: {
    streak?: number;
    xp?: number;
    level?: number;
    itemName?: string;
  };
  onClose?: () => void;
  duration?: number;
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
}

export const MascotDialogue: React.FC<MascotDialogueProps> = ({
  trigger = 'encouragement',
  userName = 'Scholar',
  context = {},
  onClose,
  duration = 4000,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [emotion, setEmotion] = useState<'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'idle'>('idle');

  const messages = {
    login: [
      `Welcome back, ${userName}! Ready to unlock some knowledge? 🚀`,
      `Hey there, ${userName}! Let's make today legendary! ⭐`,
      `${userName}! Your brain is my favorite playground! 🧠✨`,
      `Ready to level up, ${userName}? I've got some amazing challenges for you! 🎯`,
    ],
    correct: [
      "Brilliant! You're absolutely crushing it! 🎉",
      "That's the way to do it! Your brain is on fire! 🔥",
      "Perfect! You're becoming unstoppable! 💪",
      "Yes! Another victory for Team Smart! 🏆",
      "Incredible! You're making this look easy! ⚡",
    ],
    wrong: [
      "Hey, no worries! Every mistake is a step toward mastery! 💪",
      "Close one! Your thinking process is spot on - let's try again! 🎯",
      "That's how we learn! Even Einstein made mistakes! 🧠",
      "Great effort! You're building those brain muscles! 💪",
      "Almost there! Your persistence will pay off! 🌟",
    ],
    streak: [
      `${context.streak} days in a row! You're becoming a legend! 🔥`,
      `Streak power: ${context.streak}! You're unstoppable! ⚡`,
      `${context.streak} days of pure dedication! I'm so proud! 🏆`,
      `Your ${context.streak}-day streak is inspiring me! Keep going! 🚀`,
    ],
    purchase: [
      `New ${context.itemName}! You're going to love this upgrade! ✨`,
      `${context.itemName} unlocked! Time to level up your style! 🎭`,
      `Sweet choice! ${context.itemName} suits you perfectly! 👑`,
      `${context.itemName} acquired! You're looking more legendary already! ⭐`,
    ],
    levelup: [
      `LEVEL ${context.level}! You're officially a knowledge warrior! ⚔️`,
      `Level ${context.level} achieved! Your brain just got an upgrade! 🧠⬆️`,
      `Welcome to Level ${context.level}! You're entering elite territory! 👑`,
      `Level ${context.level}! You're rewriting the rules of awesome! 📚✨`,
    ],
    encouragement: [
      "You've got this! Every expert was once a beginner! 🌱",
      "Your potential is unlimited! Keep pushing forward! 🚀",
      "Believe in yourself - I certainly do! 💫",
      "Every challenge is an opportunity to grow stronger! 💪",
      "You're closer to your goals than you think! Keep going! 🎯",
    ],
    reminder: [
      "Just a friendly reminder - your future self will thank you! ⏰",
      "Time to feed that brilliant brain of yours! 🧠🍎",
      "Your study streak misses you! Let's get back to it! 📚",
      "Ready for another learning adventure? I am! 🗺️",
    ]
  };

  const getEmotion = () => {
    switch (trigger) {
      case 'correct':
      case 'purchase':
      case 'levelup':
        return 'celebrating';
      case 'login':
      case 'streak':
        return 'excited';
      case 'wrong':
      case 'encouragement':
      case 'reminder':
        return 'encouraging';
      default:
        return 'happy';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'top-right':
        return 'top-4 right-4';
      default: // bottom-right
        return 'bottom-4 right-4';
    }
  };

  useEffect(() => {
    const messageList = messages[trigger] || messages.encouragement;
    const randomMessage = messageList[Math.floor(Math.random() * messageList.length)];
    setCurrentMessage(randomMessage);
    setEmotion(getEmotion());

    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, context, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`fixed ${getPositionClasses()} z-50 flex items-end space-x-3 max-w-sm`}
        >
          {/* Mascot */}
          <NovaBot emotion={emotion} size="lg" />
          
          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs"
          >
            {/* Speech bubble tail */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
              <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white dark:border-r-gray-800"></div>
            </div>
            
            <p className="text-sm font-medium leading-relaxed">
              {currentMessage}
            </p>
            
            {/* Close button */}
            {onClose && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(), 300);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center text-xs transition-colors"
              >
                ×
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MascotDialogue;