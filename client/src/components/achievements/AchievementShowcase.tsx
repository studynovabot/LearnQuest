import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Lock,
  CheckCircle,
  Filter
} from "lucide-react";

// Types
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: 'learning' | 'social' | 'streak' | 'quiz' | 'milestone';
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

const AchievementShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sample achievements data
  const achievements: Achievement[] = [
    {
      id: 'first-question',
      name: 'First Question',
      description: 'Asked your first question',
      icon: <Award className="h-6 w-6 text-blue-500" />,
      points: 10,
      rarity: 'Common',
      category: 'learning',
      unlocked: true,
      unlockedAt: '2024-01-15T10:30:00Z',
      requirement: 'Ask your first question'
    },
    {
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Scored 100% on 5 quizzes',
      icon: <Trophy className="h-6 w-6 text-gold-500" />,
      points: 100,
      rarity: 'Epic',
      category: 'quiz',
      unlocked: true,
      unlockedAt: '2024-01-20T14:45:00Z',
      requirement: 'Score 100% on 5 different quizzes'
    },
    {
      id: 'streak-warrior',
      name: 'Streak Warrior',
      description: 'Maintained a 30-day learning streak',
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      points: 200,
      rarity: 'Legendary',
      category: 'streak',
      unlocked: false,
      requirement: 'Study for 30 consecutive days'
    },
    {
      id: 'helpful-student',
      name: 'Helpful Student',
      description: 'Helped 10 other students',
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      points: 75,
      rarity: 'Rare',
      category: 'social',
      unlocked: true,
      unlockedAt: '2024-01-18T09:15:00Z',
      requirement: 'Answer 10 questions from other students'
    },
    {
      id: 'speed-learner',
      name: 'Speed Learner',
      description: 'Completed a lesson in under 5 minutes',
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      points: 50,
      rarity: 'Rare',
      category: 'learning',
      unlocked: false,
      requirement: 'Complete any lesson in under 5 minutes'
    },
    {
      id: 'bookworm',
      name: 'Bookworm',
      description: 'Read 50 study materials',
      icon: <Book className="h-6 w-6 text-green-500" />,
      points: 150,
      rarity: 'Epic',
      category: 'learning',
      unlocked: false,
      requirement: 'Read 50 different study materials'
    }
  ];

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All', icon: <Filter className="h-4 w-4" /> },
    { id: 'learning', name: 'Learning', icon: <Book className="h-4 w-4" /> },
    { id: 'quiz', name: 'Quiz', icon: <Target className="h-4 w-4" /> },
    { id: 'streak', name: 'Streak', icon: <Flame className="h-4 w-4" /> },
    { id: 'social', name: 'Social', icon: <Star className="h-4 w-4" /> },
    { id: 'milestone', name: 'Milestone', icon: <Medal className="h-4 w-4" /> }
  ];

  // Filter achievements
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  // Stats
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  const handleAchievementClick = (achievement: Achievement) => {
    if (achievement.unlocked) {
      console.log('Achievement clicked:', achievement.name);
    }
  };

  // Achievement Card Component
  const AchievementCard = ({ achievement, index }: { achievement: Achievement; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={achievement.unlocked ? { y: -5, scale: 1.02 } : {}}
      onClick={() => handleAchievementClick(achievement)}
      className="cursor-pointer"
    >
        <Card className={`relative overflow-hidden transition-all duration-300 ${
          achievement.unlocked 
            ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-primary/20 shadow-lg hover:shadow-xl' 
            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
        }`}>
          {/* Achievement Icon */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-bl-full flex items-center justify-center">
            {achievement.icon}
          </div>
          
          {/* Locked overlay */}
          {!achievement.unlocked && (
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
          )}

          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  achievement.unlocked ? 'text-foreground' : 'text-gray-400'
                }`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm ${
                  achievement.unlocked ? 'text-muted-foreground' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>
              </div>
              <Badge 
                variant={achievement.unlocked ? 'default' : 'secondary'}
                className={achievement.unlocked ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
              >
                {achievement.unlocked ? 'Unlocked' : 'Locked'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Points</span>
                <span className="font-semibold text-primary">{achievement.points}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rarity</span>
                <Badge variant="outline" className="text-xs">
                  {achievement.rarity}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {achievement.requirement}
              </div>
            </div>

            {achievement.unlocked && achievement.unlockedAt && (
              <div className="mt-4 flex items-center space-x-2 text-xs text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="h-5 w-5 text-gold-500" />
              <span className="text-2xl font-bold">{unlockedAchievements}</span>
              <span className="text-muted-foreground">/ {totalAchievements}</span>
            </div>
            <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{totalPoints}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Points Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">
                {Math.round((unlockedAchievements / totalAchievements) * 100)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                {category.icon}
                <span>{category.name}</span>
              </Button>
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
    </div>
  );
};

export default AchievementShowcase;