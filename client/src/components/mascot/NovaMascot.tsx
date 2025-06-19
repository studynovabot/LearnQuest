import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NovaMascotProps {
  emotion?: 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'confused' | 'proud' | 'sleepy' | 'focused';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  animate?: boolean;
  showParticles?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const NovaMascot: React.FC<NovaMascotProps> = ({ 
  emotion = 'idle', 
  size = 'md', 
  className = '',
  animate = true,
  showParticles = true,
  intensity = 'medium'
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    xxl: 'w-48 h-48'
  };

  const getEmotionColors = () => {
    switch (emotion) {
      case 'happy':
        return {
          primary: '#3B82F6', // Blue
          secondary: '#FCD34D', // Gold
          accent: '#10B981', // Green
          glow: '#60A5FA'
        };
      case 'excited':
        return {
          primary: '#8B5CF6', // Purple
          secondary: '#F59E0B', // Amber
          accent: '#EC4899', // Pink
          glow: '#A78BFA'
        };
      case 'celebrating':
        return {
          primary: '#10B981', // Green
          secondary: '#FCD34D', // Gold
          accent: '#F59E0B', // Orange
          glow: '#34D399'
        };
      case 'thinking':
        return {
          primary: '#1E40AF', // Dark Blue
          secondary: '#60A5FA', // Light Blue
          accent: '#3B82F6', // Blue
          glow: '#93C5FD'
        };
      case 'encouraging':
        return {
          primary: '#7C3AED', // Violet
          secondary: '#FCD34D', // Gold
          accent: '#A78BFA', // Light Purple
          glow: '#C4B5FD'
        };
      case 'confused':
        return {
          primary: '#6B7280', // Gray
          secondary: '#F59E0B', // Amber
          accent: '#9CA3AF', // Light Gray
          glow: '#D1D5DB'
        };
      case 'proud':
        return {
          primary: '#DC2626', // Red
          secondary: '#FCD34D', // Gold
          accent: '#F59E0B', // Orange
          glow: '#FCA5A5'
        };
      case 'sleepy':
        return {
          primary: '#4338CA', // Indigo
          secondary: '#A78BFA', // Light Purple
          accent: '#6366F1', // Indigo
          glow: '#C7D2FE'
        };
      case 'focused':
        return {
          primary: '#059669', // Emerald
          secondary: '#34D399', // Light Green
          accent: '#10B981', // Green
          glow: '#6EE7B7'
        };
      default: // idle
        return {
          primary: '#1E40AF', // Deep Blue
          secondary: '#FCD34D', // Gold
          accent: '#3B82F6', // Blue
          glow: '#60A5FA'
        };
    }
  };

  const colors = getEmotionColors();

  const getBodyAnimation = () => {
    if (!animate) return {};
    
    const baseIntensity = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1;
    
    switch (emotion) {
      case 'celebrating':
        return {
          y: [0, -8 * baseIntensity, 0],
          rotate: [0, -5 * baseIntensity, 5 * baseIntensity, 0],
          scale: [1, 1.05 * baseIntensity, 1],
          transition: { 
            duration: 0.8, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeInOut"
          }
        };
      case 'excited':
        return {
          y: [0, -4 * baseIntensity, 0],
          scale: [1, 1.02 * baseIntensity, 1],
          transition: { 
            duration: 0.6, 
            repeat: Infinity, 
            repeatType: 'reverse' as const,
            ease: "easeInOut"
          }
        };
      case 'thinking':
        return {
          rotate: [0, 2 * baseIntensity, -2 * baseIntensity, 0],
          transition: { 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'sleepy':
        return {
          y: [0, 1 * baseIntensity, 0],
          transition: { 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'happy':
        return {
          y: [0, -2 * baseIntensity, 0],
          transition: { 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      default:
        return {
          y: [0, -3 * baseIntensity, 0],
          transition: { 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut"
          }
        };
    }
  };

  const getStarAnimation = () => {
    if (!animate) return {};
    
    switch (emotion) {
      case 'celebrating':
        return {
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          transition: { duration: 2, repeat: Infinity, ease: "linear" }
        };
      case 'excited':
        return {
          rotate: [0, 15, -15, 0],
          transition: { duration: 0.5, repeat: Infinity }
        };
      case 'thinking':
        return {
          rotate: [0, 5, -5, 0],
          transition: { duration: 3, repeat: Infinity }
        };
      default:
        return {
          rotate: [0, 360],
          transition: { duration: 20, repeat: Infinity, ease: "linear" }
        };
    }
  };

  const getEyeAnimation = () => {
    if (!animate) return {};
    
    switch (emotion) {
      case 'happy':
      case 'celebrating':
        return {
          scaleY: [1, 0.3, 1],
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
        };
      case 'excited':
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 0.4, repeat: Infinity, repeatType: 'reverse' as const }
        };
      case 'thinking':
        return {
          x: [-1, 1, -1],
          transition: { duration: 1.5, repeat: Infinity }
        };
      case 'sleepy':
        return {
          scaleY: [1, 0.1, 1],
          transition: { duration: 1, repeat: Infinity, repeatDelay: 2 }
        };
      case 'confused':
        return {
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.8, repeat: Infinity }
        };
      default:
        return {
          scaleY: [1, 0.2, 1],
          transition: { duration: 3, repeat: Infinity, repeatDelay: 4 }
        };
    }
  };

  const getGlowIntensity = () => {
    switch (emotion) {
      case 'celebrating':
        return 0.8;
      case 'excited':
        return 0.6;
      case 'happy':
        return 0.5;
      case 'thinking':
        return 0.4;
      case 'sleepy':
        return 0.2;
      default:
        return 0.3;
    }
  };

  const getMouthPath = () => {
    switch (emotion) {
      case 'happy':
      case 'celebrating':
      case 'excited':
        return "M 35 65 Q 50 75 65 65"; // Happy smile
      case 'thinking':
        return "M 45 67 L 55 67"; // Neutral line
      case 'confused':
        return "M 35 67 Q 50 60 65 67"; // Confused frown
      case 'sleepy':
        return "M 45 65 Q 50 68 55 65"; // Small yawn
      case 'proud':
        return "M 35 63 Q 50 72 65 63"; // Big proud smile
      case 'encouraging':
        return "M 38 65 Q 50 72 62 65"; // Encouraging smile
      default:
        return "M 45 67 Q 50 70 55 67"; // Slight smile
    }
  };

  const renderParticles = () => {
    if (!showParticles || !animate) return null;
    
    const particleCount = emotion === 'celebrating' ? 12 : emotion === 'excited' ? 8 : 4;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (360 / particleCount) * i;
      const delay = i * 0.1;
      
      particles.push(
        <motion.circle
          key={i}
          cx={50 + Math.cos(angle * Math.PI / 180) * 35}
          cy={50 + Math.sin(angle * Math.PI / 180) * 35}
          r="1"
          fill={i % 3 === 0 ? colors.secondary : i % 3 === 1 ? colors.accent : colors.primary}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, Math.cos(angle * Math.PI / 180) * 10, 0],
            y: [0, Math.sin(angle * Math.PI / 180) * 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: delay,
            ease: "easeOut"
          }}
        />
      );
    }
    
    return particles;
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Main mascot */}
      <motion.div
        className="w-full h-full"
        animate={getBodyAnimation()}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glow effect */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.secondary} />
              <stop offset="70%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.primary} />
            </radialGradient>
            <radialGradient id="bodyGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={colors.glow} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.primary} />
            </radialGradient>
          </defs>

          {/* Outer glow */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill={colors.glow}
            opacity={getGlowIntensity()}
            filter="url(#glow)"
            animate={animate ? {
              scale: [1, 1.1, 1],
              opacity: [getGlowIntensity(), getGlowIntensity() * 1.5, getGlowIntensity()]
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Star-shaped head */}
          <motion.path
            d="M50 10 L55 25 L70 25 L58 35 L63 50 L50 40 L37 50 L42 35 L30 25 L45 25 Z"
            fill="url(#starGradient)"
            stroke={colors.primary}
            strokeWidth="1.5"
            filter="url(#glow)"
            animate={getStarAnimation()}
          />

          {/* Inner star details */}
          <motion.path
            d="M50 18 L52 28 L62 28 L54 34 L57 44 L50 38 L43 44 L46 34 L38 28 L48 28 Z"
            fill={colors.glow}
            opacity="0.6"
            animate={getStarAnimation()}
          />

          {/* Eyes */}
          <motion.ellipse
            cx="44"
            cy="32"
            rx="3"
            ry="4"
            fill="#FFFFFF"
            animate={getEyeAnimation()}
          />
          <motion.ellipse
            cx="56"
            cy="32"
            rx="3"
            ry="4"
            fill="#FFFFFF"
            animate={getEyeAnimation()}
          />

          {/* Eye pupils */}
          <motion.circle
            cx="44"
            cy="33"
            r="2"
            fill={colors.primary}
            animate={getEyeAnimation()}
          />
          <motion.circle
            cx="56"
            cy="33"
            r="2"
            fill={colors.primary}
            animate={getEyeAnimation()}
          />

          {/* Eye highlights */}
          <motion.circle
            cx="45"
            cy="32"
            r="0.8"
            fill="#FFFFFF"
            animate={getEyeAnimation()}
          />
          <motion.circle
            cx="57"
            cy="32"
            r="0.8"
            fill="#FFFFFF"
            animate={getEyeAnimation()}
          />

          {/* Mouth */}
          <motion.path
            d={getMouthPath()}
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={emotion === 'happy' || emotion === 'celebrating' ? {
              d: [getMouthPath(), "M 35 65 Q 50 78 65 65", getMouthPath()]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />

          {/* Body */}
          <motion.circle
            cx="50"
            cy="75"
            r="15"
            fill="url(#bodyGradient)"
            stroke={colors.primary}
            strokeWidth="1.5"
            opacity="0.9"
          />

          {/* Body highlight */}
          <motion.ellipse
            cx="50"
            cy="70"
            rx="8"
            ry="5"
            fill={colors.glow}
            opacity="0.4"
          />

          {/* Energy core */}
          <motion.circle
            cx="50"
            cy="75"
            r="3"
            fill={colors.secondary}
            animate={animate ? {
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Particles */}
          {renderParticles()}
        </svg>
      </motion.div>

      {/* Additional celebration effects */}
      <AnimatePresence>
        {emotion === 'celebrating' && animate && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: i % 2 === 0 ? colors.secondary : colors.accent,
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 80],
                  y: [0, (Math.random() - 0.5) * 80],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NovaMascot;