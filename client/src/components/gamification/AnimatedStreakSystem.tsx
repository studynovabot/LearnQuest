import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/UserContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

import { Flame, Shield, Calendar, AlertTriangle, Sparkles, Crown, Zap } from 'lucide-react';
import FeatureAccess from '@/components/subscription/FeatureAccess';


interface AnimatedStreakSystemProps {
  onStreakUpdate?: (newStreak: number) => void;
  showStreakGain?: boolean;
}

const AnimatedStreakSystem: React.FC<AnimatedStreakSystemProps> = ({
  onStreakUpdate,
  showStreakGain = false
}) => {
  const { user } = useUserContext();
  const { getStreakInsurance } = useFeatureAccess();

  
  const [streak, setStreak] = useState(user?.streak || 0);
  const [isStreakAnimating, setIsStreakAnimating] = useState(false);
  const [showMilestoneEffect, setShowMilestoneEffect] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState(0);
  
  const streakInsurance = user?.streakInsurance || getStreakInsurance();

  // Calculate streak multiplier
  const getStreakMultiplier = (streakDays: number) => {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 14) return 1.7;
    if (streakDays >= 7) return 1.5;
    if (streakDays >= 3) return 1.2;
    return 1.0;
  };

  const streakMultiplier = getStreakMultiplier(streak);

  // Get streak flame intensity
  const getFlameIntensity = (streakDays: number) => {
    if (streakDays >= 30) return 'from-purple-500 to-pink-500';
    if (streakDays >= 14) return 'from-orange-500 to-red-500';
    if (streakDays >= 7) return 'from-yellow-500 to-orange-500';
    if (streakDays >= 3) return 'from-amber-400 to-yellow-500';
    return 'from-gray-400 to-gray-500';
  };

  // Get flame particles count
  const getFlameParticles = (streakDays: number) => {
    if (streakDays >= 30) return 12;
    if (streakDays >= 14) return 8;
    if (streakDays >= 7) return 6;
    if (streakDays >= 3) return 4;
    return 2;
  };

  // Generate the last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - 6 + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    const isCompleted = i < Math.min(streak, 7);
    return { day: dayName, date, isCompleted };
  });

  // Check for milestone achievements
  useEffect(() => {
    if (showStreakGain && streak > 0) {
      const milestones = [3, 7, 14, 30, 50, 100];
      const reachedMilestone = milestones.find(m => m === streak);
      
      if (reachedMilestone) {
        setMilestoneReached(reachedMilestone);
        setShowMilestoneEffect(true);

        
        setTimeout(() => setShowMilestoneEffect(false), 4000);
      }
      
      setIsStreakAnimating(true);
      setTimeout(() => setIsStreakAnimating(false), 1000);
    }
  }, [showStreakGain, streak]);

  // Streak benefits configuration
  const streakBenefits = [
    { days: 3, multiplier: 1.2, unlocked: streak >= 3 },
    { days: 7, multiplier: 1.5, unlocked: streak >= 7 },
    { days: 14, multiplier: 1.7, unlocked: streak >= 14 },
    { days: 30, multiplier: 2.0, unlocked: streak >= 30 },
  ];

  return (
    <div className="relative">
      <Card className="h-full overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2 border-orange-100 dark:border-orange-900">
        <CardHeader>
          <CardTitle className="flex items-center">
            <motion.div
              animate={isStreakAnimating ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : streak > 0 ? {
                scale: [1, 1.05, 1],
                transition: { duration: 2, repeat: Infinity }
              } : {}}
            >
              <Flame className="mr-2 h-5 w-5 text-orange-500" />
            </motion.div>
            Streak System
          </CardTitle>
          <CardDescription>Build and maintain your daily study streak</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Milestone Achievement Effect */}
          <AnimatePresence>
            {showMilestoneEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center z-10 rounded-lg"
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
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-orange-600 dark:text-orange-300 flex items-center justify-center mb-2">
                    <Crown className="mr-2 h-8 w-8" />
                    {milestoneReached} DAY MILESTONE!
                    <Sparkles className="ml-2 h-8 w-8" />
                  </div>
                  <div className="text-lg text-orange-500 dark:text-orange-400">
                    {getStreakMultiplier(milestoneReached)}x Study Points Unlocked!
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Streak Display */}
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
              {/* Animated Flame Background */}
              <motion.div
                className={`w-32 h-32 rounded-full bg-gradient-to-r ${getFlameIntensity(streak)} flex items-center justify-center text-white shadow-lg relative overflow-hidden`}
                animate={isStreakAnimating ? { 
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 4px 6px rgba(0,0,0,0.1)',
                    '0 8px 25px rgba(251,146,60,0.4)',
                    '0 4px 6px rgba(0,0,0,0.1)'
                  ]
                } : streak > 0 ? {
                  boxShadow: [
                    '0 4px 6px rgba(0,0,0,0.1)',
                    '0 6px 15px rgba(251,146,60,0.3)',
                    '0 4px 6px rgba(0,0,0,0.1)'
                  ],
                  transition: { duration: 2, repeat: Infinity }
                } : {}}
              >
                {/* Flame Particles */}
                {Array.from({ length: getFlameParticles(streak) }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    animate={{
                      y: [0, -20, 0],
                      x: [Math.sin(i) * 10, Math.sin(i + 1) * 15, Math.sin(i) * 10],
                      opacity: [1, 0.5, 1],
                      scale: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 1.5 + i * 0.2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                    style={{
                      left: `${40 + Math.sin(i * 2) * 20}%`,
                      top: `${60 + Math.cos(i * 2) * 20}%`
                    }}
                  />
                ))}
                
                <motion.div 
                  className="text-3xl font-bold z-10 relative"
                  animate={isStreakAnimating ? { scale: [1, 1.3, 1] } : {}}
                >
                  {streak}
                </motion.div>
              </motion.div>
              
              {/* Multiplier Badge */}
              {streakMultiplier > 1 && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 2px 4px rgba(0,0,0,0.1)',
                      '0 4px 15px rgba(34,197,94,0.4)',
                      '0 2px 4px rgba(0,0,0,0.1)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {streakMultiplier}x SP
                </motion.div>
              )}
            </div>
            
            <motion.h3 
              className="text-xl font-bold mb-2"
              animate={isStreakAnimating ? { scale: [1, 1.1, 1] } : {}}
            >
              {streak === 0 ? 'Start Your Streak!' : `${streak} Day Streak`}
            </motion.h3>
            <p className="text-muted-foreground mb-4">
              {streak === 0 
                ? 'Begin your learning journey today!' 
                : streak >= 30 
                ? "You're a streak legend! 🔥👑" 
                : streak >= 7 
                ? "You're on fire! Keep it up! 🔥" 
                : "Great start! Keep going! 💪"}
            </p>
            
            {/* 7-Day Calendar */}
            <div className="grid grid-cols-7 gap-2 w-full mb-6">
              {last7Days.map((day, i) => (
                <motion.div 
                  key={i}
                  className={`h-12 rounded-md flex items-center justify-center font-medium transition-all duration-300 ${
                    day.isCompleted 
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  animate={day.isCompleted && isStreakAnimating ? { 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 2px 4px rgba(0,0,0,0.1)',
                      '0 4px 15px rgba(251,146,60,0.4)',
                      '0 2px 4px rgba(0,0,0,0.1)'
                    ]
                  } : {}}
                >
                  {day.day}
                  {day.isCompleted && (
                    <motion.div
                      className="absolute"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Sparkles className="h-3 w-3 text-yellow-300" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Streak Insurance */}
            <FeatureAccess featureKey="streak_insurance">
              <motion.div 
                className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center w-full border border-slate-200 dark:border-slate-700 shadow-inner"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Streak Insurance
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  You have {streakInsurance} insurance token{streakInsurance !== 1 ? 's' : ''}
                </div>
                <Button variant="outline" size="sm" className="transition-all hover:shadow-md">
                  Use Insurance
                </Button>
              </motion.div>
            </FeatureAccess>
          </div>
          
          {/* Streak Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Zap className="mr-2 h-5 w-5 text-amber-500" />
              Streak Benefits
            </h3>
            
            <div className="space-y-2">
              {streakBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.days}
                  className={`p-3 rounded-lg flex justify-between items-center transition-all duration-300 ${
                    benefit.unlocked 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 shadow-sm' 
                      : 'bg-muted border border-transparent'
                  }`}
                  animate={benefit.unlocked && isStreakAnimating ? {
                    scale: [1, 1.02, 1],
                    borderColor: ['#16a34a', '#22c55e', '#16a34a']
                  } : {}}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        benefit.unlocked 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}
                      animate={benefit.unlocked ? {
                        boxShadow: [
                          '0 0 0 0 rgba(34, 197, 94, 0.4)',
                          '0 0 0 10px rgba(34, 197, 94, 0)',
                        ]
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="font-bold text-xs">{benefit.days}</span>
                    </motion.div>
                    <span className="font-medium">
                      {benefit.days}-Day Streak
                      {benefit.unlocked && <span className="ml-2 text-green-600 dark:text-green-400">✓</span>}
                    </span>
                  </div>
                  <motion.div 
                    className={`text-sm font-bold ${benefit.unlocked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                    animate={benefit.unlocked && isStreakAnimating ? { scale: [1, 1.1, 1] } : {}}
                  >
                    {benefit.multiplier}x SP
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* No Insurance Warning */}
          {streakInsurance === 0 && (
            <motion.div 
              className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center text-amber-800 dark:text-amber-300 mb-2">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <h3 className="font-medium">No Streak Insurance</h3>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                Upgrade to Pro or GOAT to get streak insurance tokens and protect your streak!
              </p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg"
              >
                <a href="/subscription">Upgrade Now</a>
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimatedStreakSystem;