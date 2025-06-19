import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useUserContext } from '@/context/UserContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useMascot } from '@/hooks/useMascot';
import { Zap, Award, Star, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnimatedXPSystemProps {
  showXPGain?: boolean;
  xpGained?: number;
  onXPAnimationComplete?: () => void;
}

const AnimatedXPSystem: React.FC<AnimatedXPSystemProps> = ({
  showXPGain = false,
  xpGained = 0,
  onXPAnimationComplete
}) => {
  const { user } = useUserContext();
  const { getDailySPCap, getSPMultiplier } = useFeatureAccess();
  const { celebrateLevelUp } = useMascot();
  
  const [animatingXP, setAnimatingXP] = useState(false);
  const [displayXP, setDisplayXP] = useState(user?.studyPoints || 0);
  const [levelUpEffect, setLevelUpEffect] = useState(false);
  
  // Calculate user level and progress
  const studyPoints = user?.studyPoints || 0;
  const level = Math.floor(studyPoints / 500) + 1;
  const nextLevelPoints = level * 500;
  const pointsToNextLevel = nextLevelPoints - studyPoints;
  const progress = (studyPoints % 500) / 500 * 100;
  const previousLevel = Math.floor(displayXP / 500) + 1;
  
  const spMultiplier = getSPMultiplier();
  const dailySPCap = getDailySPCap();
  const dailySPEarned = user?.dailySPEarned || 0;

  // Animate XP gain
  useEffect(() => {
    if (showXPGain && xpGained > 0) {
      setAnimatingXP(true);
      
      // Animate the XP counter
      const startXP = displayXP;
      const endXP = studyPoints;
      const duration = 1000;
      const startTime = Date.now();
      
      const animateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentXP = Math.floor(startXP + (endXP - startXP) * easeOutQuart);
        setDisplayXP(currentXP);
        
        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        } else {
          setAnimatingXP(false);
          onXPAnimationComplete?.();
          
          // Check for level up
          if (level > previousLevel) {
            setLevelUpEffect(true);
            celebrateLevelUp(level);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF']
            });
            setTimeout(() => setLevelUpEffect(false), 3000);
          }
        }
      };
      
      animateCounter();
    }
  }, [showXPGain, xpGained, studyPoints, displayXP, level, previousLevel, celebrateLevelUp, onXPAnimationComplete]);

  const getLevelIcon = (currentLevel: number) => {
    if (currentLevel >= 50) return Crown;
    if (currentLevel >= 25) return Award;
    if (currentLevel >= 10) return Star;
    return Zap;
  };

  const getLevelColor = (currentLevel: number) => {
    if (currentLevel >= 50) return 'from-purple-500 to-pink-500';
    if (currentLevel >= 25) return 'from-amber-400 to-orange-500';
    if (currentLevel >= 10) return 'from-blue-400 to-blue-600';
    return 'from-green-400 to-green-600';
  };

  const LevelIcon = getLevelIcon(level);

  return (
    <div className="relative">
      <Card className="overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          {/* Level Up Effect */}
          <AnimatePresence>
            {levelUpEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center z-10 rounded-lg"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0] 
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="text-4xl font-bold text-purple-600 dark:text-purple-300 flex items-center"
                >
                  <Crown className="mr-2 h-8 w-8" />
                  LEVEL {level}!
                  <Sparkles className="ml-2 h-8 w-8" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main XP Display */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <motion.div
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${getLevelColor(level)} flex items-center justify-center text-white shadow-lg`}
                animate={animatingXP ? { 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 4px 6px rgba(0,0,0,0.1)',
                    '0 8px 25px rgba(34,197,94,0.3)',
                    '0 4px 6px rgba(0,0,0,0.1)'
                  ]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <LevelIcon className="h-8 w-8" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-2">
                  <motion.span 
                    className="text-2xl font-bold text-slate-800 dark:text-slate-200"
                    animate={animatingXP ? { scale: [1, 1.2, 1] } : {}}
                  >
                    {displayXP.toLocaleString()}
                  </motion.span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">SP</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Level {level} • {pointsToNextLevel} to next level
                </div>
              </div>
            </div>

            {/* Multiplier Badge */}
            {spMultiplier > 1 && (
              <motion.div
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 2px 4px rgba(0,0,0,0.1)',
                    '0 4px 15px rgba(245,158,11,0.4)',
                    '0 2px 4px rgba(0,0,0,0.1)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {spMultiplier}x GOAT
              </motion.div>
            )}
          </div>

          {/* Animated Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Progress to Level {level + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Today's SP</span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {dailySPEarned.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                {dailySPCap - dailySPEarned} remaining
              </div>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Daily Cap</span>
                <Award className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {dailySPCap.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                {Math.round((dailySPEarned / dailySPCap) * 100)}% used
              </div>
            </motion.div>
          </div>

          {/* XP Gain Animation */}
          <AnimatePresence>
            {showXPGain && xpGained > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 1 }}
                animate={{ opacity: 1, y: -50, scale: 1.2 }}
                exit={{ opacity: 0, y: -100, scale: 0.8 }}
                className="absolute top-4 right-4 z-20"
              >
                <motion.div
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1"
                  animate={{ 
                    boxShadow: [
                      '0 4px 6px rgba(0,0,0,0.1)',
                      '0 8px 25px rgba(34,197,94,0.4)',
                      '0 4px 6px rgba(0,0,0,0.1)'
                    ]
                  }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>+{xpGained} SP</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimatedXPSystem;