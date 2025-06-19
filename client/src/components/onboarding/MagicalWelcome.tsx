import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '@/context/UserContext';
import { useMascot } from '@/hooks/useMascot';
import NovaBot from '@/components/mascot/NovaBot';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Star, BookOpen, Target, Zap, Crown, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MagicalWelcomeProps {
  isFirstTime?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const MagicalWelcome: React.FC<MagicalWelcomeProps> = ({
  isFirstTime = false,
  onComplete,
  onSkip
}) => {
  const { user } = useUserContext();
  const { welcomeUser } = useMascot();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showParticles, setShowParticles] = useState(true);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Scholar';
  const userLevel = Math.floor((user?.studyPoints || 0) / 500) + 1;
  const userStreak = user?.streak || 0;

  // Welcome steps
  const welcomeSteps = [
    {
      title: isFirstTime ? "Welcome to Study Nova!" : `Welcome back, ${userName}!`,
      message: isFirstTime 
        ? "Your AI-powered learning companion is here to help you achieve greatness! ✨"
        : `Ready to continue your learning journey? You're doing amazing! 🚀`,
      mascotEmotion: 'excited' as const,
      particles: true,
      action: isFirstTime ? "Let's Start!" : "Continue Learning"
    },
    {
      title: isFirstTime ? "Meet Your AI Study Buddy!" : "Your Progress So Far",
      message: isFirstTime
        ? "I'm Nova, your personal AI tutor! I'll help you study smarter, not harder. Together we'll make learning an adventure! 🧠✨"
        : `You're Level ${userLevel} with a ${userStreak}-day streak! Your dedication is inspiring! 💪`,
      mascotEmotion: 'happy' as const,
      particles: false,
      action: "Awesome!"
    },
    {
      title: isFirstTime ? "Your Learning Adventure Begins" : "Today's Goals",
      message: isFirstTime
        ? "Earn Study Points, build streaks, unlock achievements, and level up your knowledge! Every question brings you closer to mastery! 🎯"
        : "Let's make today count! Complete challenges, earn XP, and maintain your incredible streak! 🔥",
      mascotEmotion: 'encouraging' as const,
      particles: true,
      action: "Let's Go!"
    }
  ];

  const currentStepData = welcomeSteps[currentStep];

  // Particle animation component
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: Math.random() * 400,
            y: Math.random() * 600,
            scale: 0,
            opacity: 0
          }}
          animate={{
            y: [Math.random() * 600, Math.random() * 600 - 100, Math.random() * 600],
            x: [Math.random() * 400, Math.random() * 400 + 50, Math.random() * 400],
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 360, 720]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          {i % 4 === 0 && <Sparkles className="h-4 w-4 text-yellow-400" />}
          {i % 4 === 1 && <Star className="h-3 w-3 text-blue-400" />}
          {i % 4 === 2 && <Zap className="h-3 w-3 text-purple-400" />}
          {i % 4 === 3 && <Crown className="h-4 w-4 text-amber-400" />}
        </motion.div>
      ))}
    </div>
  );

  // Feature highlight component
  const FeatureHighlight = ({ icon: Icon, title, description, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </motion.div>
  );

  // Handle step progression
  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    
    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
    });
    
    // Trigger mascot welcome
    setTimeout(() => {
      welcomeUser();
      onComplete?.();
    }, 500);
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  // Auto-trigger particles effect
  useEffect(() => {
    if (currentStepData.particles) {
      setShowParticles(true);
    }
  }, [currentStep, currentStepData.particles]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center p-4"
        >
          {/* Background particles */}
          {showParticles && <FloatingParticles />}
          
          {/* Welcome content */}
          <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
            
            <CardContent className="relative p-8 text-center">
              {/* Step indicator */}
              <div className="flex justify-center space-x-2 mb-6">
                {welcomeSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentStep ? 'bg-blue-500' : 
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* Mascot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <NovaBot 
                  emotion={currentStepData.mascotEmotion} 
                  size="xl" 
                  className="filter drop-shadow-lg"
                />
              </motion.div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentStepData.title}
                  </h1>

                  {/* Message */}
                  <p className="text-lg text-gray-700 leading-relaxed max-w-lg mx-auto">
                    {currentStepData.message}
                  </p>

                  {/* Feature highlights for first step */}
                  {currentStep === 0 && isFirstTime && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <FeatureHighlight
                        icon={BookOpen}
                        title="AI-Powered Learning"
                        description="Get personalized help with any topic"
                        delay={0.3}
                      />
                      <FeatureHighlight
                        icon={Target}
                        title="Smart Progress Tracking"
                        description="Watch your knowledge grow with XP and levels"
                        delay={0.4}
                      />
                      <FeatureHighlight
                        icon={Zap}
                        title="Streak Challenges"
                        description="Build habits with daily learning streaks"
                        delay={0.5}
                      />
                      <FeatureHighlight
                        icon={Crown}
                        title="Achievement System"
                        description="Unlock titles and showcase your progress"
                        delay={0.6}
                      />
                    </div>
                  )}

                  {/* Stats for returning users */}
                  {currentStep === 1 && !isFirstTime && (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg"
                      >
                        <div className="text-2xl font-bold text-blue-600">{userLevel}</div>
                        <div className="text-sm text-gray-600">Level</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg"
                      >
                        <div className="text-2xl font-bold text-orange-600">{userStreak}</div>
                        <div className="text-sm text-gray-600">Day Streak</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg"
                      >
                        <div className="text-2xl font-bold text-green-600">{user?.studyPoints || 0}</div>
                        <div className="text-sm text-gray-600">Study Points</div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                {currentStep < welcomeSteps.length - 1 && (
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="transition-all hover:shadow-md"
                  >
                    Skip Intro
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg font-semibold transition-all hover:shadow-lg flex items-center space-x-2"
                >
                  <span>{currentStepData.action}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MagicalWelcome;