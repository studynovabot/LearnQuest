import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NovaMascot from './NovaMascot';

interface NovaMascotDialogueProps {
  message: string;
  emotion?: 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'confused' | 'proud' | 'sleepy' | 'focused';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  position?: 'left' | 'right' | 'center';
  className?: string;
  showMessage?: boolean;
  autoHide?: boolean;
  duration?: number;
  onComplete?: () => void;
  showParticles?: boolean;
  bubbleStyle?: 'modern' | 'classic' | 'minimal';
}

export const NovaMascotDialogue: React.FC<NovaMascotDialogueProps> = ({
  message,
  emotion = 'happy',
  size = 'lg',
  position = 'left',
  className = '',
  showMessage = true,
  autoHide = false,
  duration = 5000,
  onComplete,
  showParticles = true,
  bubbleStyle = 'modern'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!showMessage) return;
    
    setIsTyping(true);
    setCurrentMessage('');
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setCurrentMessage(message.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        
        if (autoHide) {
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, duration);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [message, showMessage, autoHide, duration, onComplete]);

  const getBubbleStyle = () => {
    const baseClasses = "relative max-w-xs p-4 rounded-2xl shadow-lg backdrop-blur-sm";
    
    switch (bubbleStyle) {
      case 'modern':
        return `${baseClasses} bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20`;
      case 'classic':
        return `${baseClasses} bg-white border border-gray-200`;
      case 'minimal':
        return `${baseClasses} bg-gray-900/80 text-white border border-gray-700`;
      default:
        return `${baseClasses} bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20`;
    }
  };

  const getBubblePosition = () => {
    switch (position) {
      case 'right':
        return 'flex-row-reverse';
      case 'center':
        return 'flex-col items-center';
      default:
        return 'flex-row';
    }
  };

  const getArrowPosition = () => {
    if (position === 'center') return 'top-full left-1/2 -translate-x-1/2';
    if (position === 'right') return 'top-4 -left-2';
    return 'top-4 -right-2';
  };

  const getArrowDirection = () => {
    if (position === 'center') return 'border-t-8 border-l-4 border-r-4 border-b-0 border-l-transparent border-r-transparent border-t-white/20';
    if (position === 'right') return 'border-r-8 border-t-4 border-b-4 border-l-0 border-t-transparent border-b-transparent border-r-white/20';
    return 'border-l-8 border-t-4 border-b-4 border-r-0 border-t-transparent border-b-transparent border-l-white/20';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`flex items-start gap-4 ${getBubblePosition()} ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: 0.6
          }}
        >
          {/* Mascot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              damping: 15, 
              stiffness: 400 
            }}
          >
            <NovaMascot 
              emotion={emotion} 
              size={size} 
              showParticles={showParticles}
              intensity={emotion === 'celebrating' ? 'high' : 'medium'}
            />
          </motion.div>

          {/* Speech Bubble */}
          {showMessage && (
            <motion.div
              className={getBubbleStyle()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {/* Arrow */}
              <div className={`absolute ${getArrowPosition()} w-0 h-0 ${getArrowDirection()}`} />
              
              {/* Message */}
              <div className="relative z-10">
                <p className="text-sm font-medium leading-relaxed">
                  {currentMessage}
                  {isTyping && (
                    <motion.span
                      className="inline-block w-0.5 h-4 bg-current ml-1"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </p>
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NovaMascotDialogue;