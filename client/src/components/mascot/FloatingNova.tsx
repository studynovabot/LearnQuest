import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NovaMascot from './NovaMascot';
import { X, Settings } from 'lucide-react';

interface FloatingNovaProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  messages?: string[];
}

const defaultMessages = [
  "Need help with your studies? I'm here!",
  "You're doing great! Keep learning!",
  "Ready for your next challenge?",
  "Let's explore something new together!",
  "I believe in you! You've got this!",
  "Learning is an adventure - let's go!",
  "Every question is a step forward!",
  "Your curiosity is your superpower!"
];

export const FloatingNova: React.FC<FloatingNovaProps> = ({
  className = '',
  position = 'bottom-right',
  enabled = true,
  onToggle,
  messages = defaultMessages
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [emotion, setEmotion] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('idle');
  const [showMessage, setShowMessage] = useState(false);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  // Random encouraging messages
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (!isExpanded && Math.random() < 0.3) { // 30% chance every interval
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setCurrentMessage(randomMessage);
        setEmotion('encouraging');
        setShowMessage(true);
        
        // Hide message after 4 seconds
        setTimeout(() => {
          setShowMessage(false);
          setEmotion('idle');
        }, 4000);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [enabled, isExpanded, messages]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    setEmotion('happy');
    
    if (!isExpanded) {
      setCurrentMessage("Hi there! How can I help you today?");
      setShowMessage(true);
    } else {
      setShowMessage(false);
      setTimeout(() => setEmotion('idle'), 500);
    }
  };

  const handleToggle = () => {
    const newEnabled = !enabled;
    onToggle?.(newEnabled);
    if (!newEnabled) {
      setIsExpanded(false);
      setShowMessage(false);
      setEmotion('idle');
    }
  };

  if (!enabled) return null;

  return (
    <motion.div
      className={`fixed z-50 ${positionClasses[position]} ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 300,
        delay: 0.5
      }}
    >
      <div className="relative">
        {/* Speech Bubble */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-white/20">
                <p className="text-white text-sm font-medium text-center">
                  {currentMessage}
                </p>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-blue-500/90" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute bottom-full mb-4 right-0 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-white/20 min-w-48"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nova Assistant</span>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggle}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    <Settings size={12} />
                    Disable Nova
                  </button>
                </div>
                
                <p className="text-xs text-gray-500">
                  Click me anytime for help and encouragement!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Mascot Button */}
        <motion.button
          onClick={handleClick}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
        >
          {/* Floating effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-lg"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Mascot */}
          <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 shadow-xl border border-white/20">
            <NovaMascot 
              emotion={emotion}
              size="md"
              showParticles={emotion === 'encouraging'}
            />
          </div>

          {/* Notification dot */}
          <AnimatePresence>
            {!isExpanded && showMessage && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full border-2 border-white shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 400 }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Ripple effect on click */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FloatingNova;