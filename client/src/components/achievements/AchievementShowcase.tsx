import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmotionalDesign } from '@/context/EmotionalDesignContext';
import { SparkleEffect, AnimatedButton } from '@/components/emotional-design';
import { 
  Award, 
  Crown, 
  Star, 
  Zap, 
  Target, 
  Flame, 
  Book, 
  Trophy, 
  Medal,
  Sparkles,
  Lock,
  CheckCircle,
  Calendar,
  TrendingUp,
  Users,
  Lightbulb,
  Heart,
  Clock,
  BarChart3
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'streak' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  requirement: string;
}

const AchievementShowcase: React.FC = () => {
  const emotionalDesign = useEmotionalDesign();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSparkles, setShowSparkles] = useState<string | null>(null);

  // Sample achievements data
  const achievements: Achievement[] = [
    {
      id: 'first-question',
      title: 'First Steps',
      description: 'Asked your first question to the AI tutor',
      icon: <Lightbulb className="h-8 w-8" />,
      category: 'learning',
      rarity: 'common',
      points: 10,
      unlocked: true,
      unlockedAt: '2024-01-15',
      requirement: 'Ask 1 question'
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintained a 7-day learning streak',
      icon: <Flame className="h-8 w-8" />,
      category: 'streak',
      rarity: 'rare',
      points: 50,
      unlocked: true,
      unlockedAt: '2024-01-20',
      requirement: 'Study for 7 consecutive days'
    },
    {
      id: 'quiz-master',
      title: 'Quiz Master',
      description: 'Scored 100% on 5 different quizzes',
      icon: <Trophy className="h-8 w-8" />,
      category: 'learning',
      rarity: 'epic',
      points: 100,
      unlocked: true,
      unlockedAt: '2024-01-25',
      requirement: 'Perfect score on 5 quizzes'
    },
    {
      id: 'streak-30',
      title: 'Dedication Legend',
      description: 'Maintained a 30-day learning streak',
      icon: <Crown className="h-8 w-8" />,
      category: 'streak',
      rarity: 'legendary',
      points: 250,
      unlocked: false,
      progress: 18,
      maxProgress: 30,
      requirement: 'Study for 30 consecutive days'
    },
    {
      id: 'social-helper',
      title: 'Community Helper',
      description: 'Helped 10 other students with their questions',
      icon: <Heart className="h-8 w-8" />,
      category: 'social',
      rarity: 'rare',
      points: 75,
      unlocked: false,
      progress: 6,
      maxProgress: 10,
      requirement: 'Help 10 students'
    },
    {
      id: 'speed-learner',
      title: 'Speed Learner',
      description: 'Completed a lesson in under 5 minutes',
      icon: <Zap className="h-8 w-8" />,
      category: 'learning',
      rarity: 'rare',
      points: 40,
      unlocked: true,
      unlockedAt: '2024-01-22',
      requirement: 'Complete lesson in under 5 minutes'
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Studied for 3 hours after 10 PM',
      icon: <Clock className="h-8 w-8" />,
      category: 'special',
      rarity: 'epic',
      points: 80,
      unlocked: false,
      progress: 1,
      maxProgress: 3,
      requirement: 'Study 3 hours after 10 PM'
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Scored 100% on 20 consecutive questions',
      icon: <Target className="h-8 w-8" />,
      category: 'learning',
      rarity: 'legendary',
      points: 200,
      unlocked: false,
      progress: 12,
      maxProgress: 20,
      requirement: '20 consecutive perfect answers'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: <Award className="h-4 w-4" /> },
    { id: 'learning', name: 'Learning', icon: <Book className="h-4 w-4" /> },
    { id: 'streak', name: 'Streaks', icon: <Flame className="h-4 w-4" /> },
    { id: 'social', name: 'Social', icon: <Users className="h-4 w-4" /> },
    { id: 'milestone', name: 'Milestones', icon: <Star className="h-4 w-4" /> },
    { id: 'special', name: 'Special', icon: <Sparkles className="h-4 w-4" /> }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-400/20';
      case 'epic': return 'border-purple-400 shadow-purple-400/20';
      case 'rare': return 'border-blue-400 shadow-blue-400/20';
      default: return 'border-gray-300 shadow-gray-300/20';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  const handleAchievementClick = (achievement: Achievement) => {
    if (achievement.unlocked) {
      setShowSparkles(achievement.id);
      // Sound functionality removed
      setTimeout(() => setShowSparkles(null), 2000);
    }
  };

  const AchievementCard: React.FC<{ achievement: Achievement; index: number }> = ({ achievement, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={achievement.unlocked ? { y: -5, scale: 1.02 } : {}}
      onClick={() => handleAchievementClick(achievement)}
      className="cursor-pointer"
    >
      <SparkleEffect
        trigger={showSparkles === achievement.id}
        onComplete={() => setShowSparkles(null)}
      >
        <Card className={`relative overflow-hidden transition-all duration-300 ${
          achievement.unlocked 
            ? `border-2 ${getRarityBorder(achievement.rarity)} shadow-lg` 
            : 'border border-gray-200 dark:border-gray-700 opacity-75'
        }`}>
          {/* Rarity Background */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)}`} />
          
          {/* Lock Overlay */}
          {!achievement.unlocked && (
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center z-10">
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
          )}

          <CardContent className="p-6">
            {/* Achievement Icon */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} ${
                achievement.unlocked ? 'text-white' : 'text-gray-400'
              }`}>
                {achievement.icon}
              </div>
              
              <div className="text-right">
                <Badge variant={achievement.unlocked ? 'default' : 'secondary'} className="mb-1">
                  {achievement.rarity}
                </Badge>
                <div className="text-sm font-semibold text-green-600">
                  +{achievement.points} XP
                </div>
              </div>
            </div>

            {/* Achievement Info */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">{achievement.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {achievement.description}
              </p>
              <p className="text-xs text-gray-500">
                {achievement.requirement}
              </p>
            </div>

            {/* Progress Bar */}
            {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>
            )}

            {/* Unlocked Date */}
            {achievement.unlocked && achievement.unlockedAt && (
              <div className="mt-4 flex items-center space-x-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </SparkleEffect>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Trophy className="mr-3 h-6 w-6" />
            Achievement Showcase
          </CardTitle>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{unlockedCount}</div>
              <div className="text-purple-100 text-sm">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{achievements.length}</div>
              <div className="text-purple-100 text-sm">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-purple-100 text-sm">Points Earned</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <AnimatedButton
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                {category.icon}
                <span>{category.name}</span>
              </AnimatedButton>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Test Achievement Button */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">Test Achievement System</h3>
          <div className="space-x-4">
            <AnimatedButton
              onClick={() => emotionalDesign.celebrateAchievement('Test Achievement')}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Trigger Achievement</span>
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              onClick={() => {
                setShowSparkles('quiz-master');
                setTimeout(() => setShowSparkles(null), 2000);
              }}
              className="flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Show Sparkles</span>
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementShowcase;