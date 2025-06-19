import React from 'react';
import { motion } from 'framer-motion';

interface NovaBotProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'idle';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const NovaBot: React.FC<NovaBotProps> = ({ 
  emotion = 'idle', 
  size = 'md', 
  className = '',
  animate = true
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const getEyeAnimation = () => {
    switch (emotion) {
      case 'happy':
        return {
          scaleY: [1, 0.3, 1],
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
        };
      case 'excited':
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 0.3, repeat: Infinity, repeatType: 'reverse' as const }
        };
      case 'thinking':
        return {
          x: [-2, 2, -2],
          transition: { duration: 1, repeat: Infinity }
        };
      default:
        return {
          scaleY: [1, 0.1, 1],
          transition: { duration: 2, repeat: Infinity, repeatDelay: 4 }
        };
    }
  };

  const getBodyAnimation = () => {
    if (!animate) return {};
    
    switch (emotion) {
      case 'celebrating':
        return {
          rotate: [0, -10, 10, -10, 0],
          y: [0, -5, 0],
          transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 }
        };
      case 'excited':
        return {
          y: [0, -3, 0],
          transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' as const }
        };
      default:
        return {
          y: [0, -2, 0],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        };
    }
  };

  const getEyeColor = () => {
    switch (emotion) {
      case 'happy':
      case 'celebrating':
        return '#10B981'; // Green
      case 'excited':
        return '#F59E0B'; // Amber
      case 'encouraging':
        return '#8B5CF6'; // Purple
      case 'thinking':
        return '#3B82F6'; // Blue
      default:
        return '#06B6D4'; // Cyan
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={getBodyAnimation()}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Robot Body */}
        <motion.rect
          x="25"
          y="35"
          width="50"
          height="50"
          rx="8"
          fill="url(#bodyGradient)"
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        
        {/* Robot Head */}
        <motion.rect
          x="30"
          y="15"
          width="40"
          height="30"
          rx="6"
          fill="url(#headGradient)"
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        
        {/* Antenna */}
        <motion.line
          x1="50"
          y1="15"
          x2="50"
          y2="8"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <motion.circle
          cx="50"
          cy="6"
          r="2"
          fill={getEyeColor()}
          animate={emotion === 'thinking' ? {
            scale: [1, 1.5, 1],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
        />
        
        {/* Eyes */}
        <motion.circle
          cx="42"
          cy="25"
          r="4"
          fill={getEyeColor()}
          animate={getEyeAnimation()}
        />
        <motion.circle
          cx="58"
          cy="25"
          r="4"
          fill={getEyeColor()}
          animate={getEyeAnimation()}
        />
        
        {/* Mouth */}
        <motion.path
          d={emotion === 'happy' || emotion === 'celebrating' || emotion === 'excited' 
            ? "M 42 32 Q 50 38 58 32" 
            : emotion === 'encouraging' 
            ? "M 42 34 Q 50 32 58 34"
            : "M 42 34 L 58 34"}
          stroke={getEyeColor()}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Arms */}
        <motion.rect
          x="15"
          y="45"
          width="8"
          height="20"
          rx="4"
          fill="url(#bodyGradient)"
          stroke="#E5E7EB"
          strokeWidth="1"
          animate={emotion === 'celebrating' ? {
            rotate: [0, 20, -20, 0],
            transition: { duration: 0.8, repeat: Infinity }
          } : {}}
          style={{ transformOrigin: '19px 45px' }}
        />
        <motion.rect
          x="77"
          y="45"
          width="8"
          height="20"
          rx="4"
          fill="url(#bodyGradient)"
          stroke="#E5E7EB"
          strokeWidth="1"
          animate={emotion === 'celebrating' ? {
            rotate: [0, -20, 20, 0],
            transition: { duration: 0.8, repeat: Infinity }
          } : {}}
          style={{ transformOrigin: '81px 45px' }}
        />
        
        {/* Legs */}
        <motion.rect
          x="35"
          y="85"
          width="8"
          height="15"
          rx="4"
          fill="url(#bodyGradient)"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
        <motion.rect
          x="57"
          y="85"
          width="8"
          height="15"
          rx="4"
          fill="url(#bodyGradient)"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
        
        {/* Chest Panel */}
        <motion.rect
          x="40"
          y="50"
          width="20"
          height="15"
          rx="3"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth="1"
        />
        
        {/* Chest Lights */}
        <motion.circle
          cx="45"
          cy="57"
          r="2"
          fill={getEyeColor()}
          animate={{
            opacity: [0.3, 1, 0.3],
            transition: { duration: 2, repeat: Infinity }
          }}
        />
        <motion.circle
          cx="55"
          cy="57"
          r="2"
          fill={getEyeColor()}
          animate={{
            opacity: [1, 0.3, 1],
            transition: { duration: 2, repeat: Infinity }
          }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9FAFB" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F4F6" />
          </linearGradient>
        </defs>
        
        {/* Sparkles for celebration */}
        {emotion === 'celebrating' && (
          <>
            <motion.circle
              cx="20"
              cy="20"
              r="1"
              fill="#FCD34D"
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                transition: { duration: 1, repeat: Infinity, delay: 0 }
              }}
            />
            <motion.circle
              cx="80"
              cy="30"
              r="1"
              fill="#10B981"
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                transition: { duration: 1, repeat: Infinity, delay: 0.3 }
              }}
            />
            <motion.circle
              cx="15"
              cy="70"
              r="1"
              fill="#8B5CF6"
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                transition: { duration: 1, repeat: Infinity, delay: 0.6 }
              }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
};

export default NovaBot;