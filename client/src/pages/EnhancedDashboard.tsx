import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEmotionalDesign } from "@/context/EmotionalDesignContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import our emotional design components
import {
  NovaBot,
  MascotDialogue,
  AnimatedXPSystem,
  AnimatedStreakSystem,
  MagicalWelcome,
  AnimatedButton,
  FloatingFeedback,
  SparkleEffect
} from "@/components/emotional-design";

// Import existing dashboard components
import SubjectOverview from "@/components/dashboard/SubjectOverview";
import AITutors from "@/components/dashboard/AITutors";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import StudyPlanGenerator from "@/components/dashboard/StudyPlanGenerator";
import VisualLearningTools from "@/components/dashboard/VisualLearningTools";
import RankingSystem from "@/components/gamification/RankingSystem";
import PointsActivity from "@/components/gamification/PointsActivity";
import Leaderboard from "@/components/gamification/Leaderboard";
import DailyChallenge from "@/components/gamification/DailyChallenge";

import { 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  Flame, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  Star,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  Crown,
  FileText,
  BrainCircuit,
  Link as LinkIcon,
  PlusCircle,
  Lightbulb,
  Rocket,
  Medal,
  Gift,
  Volume2,
  VolumeX,
  Gamepad2,
  Smile,
  Heart
} from "lucide-react";

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const emotionalDesign = useEmotionalDesign();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [xpGain, setXpGain] = useState(false);

  // Check if user is new (first time visiting)
  const isFirstTime = !localStorage.getItem('user-visited-dashboard');

  useEffect(() => {
    if (isFirstTime) {
      setShowWelcome(true);
      localStorage.setItem('user-visited-dashboard', 'true');
    } else {
      // Show welcome back message for returning users
      setTimeout(() => {
        emotionalDesign.showWelcomeMessage();
      }, 1000);
    }
  }, [isFirstTime, emotionalDesign]);

  // Simulate daily login streak check
  useEffect(() => {
    const lastLogin = localStorage.getItem('last-login-date');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      localStorage.setItem('last-login-date', today);
      
      // Simulate streak bonus after a few seconds
      setTimeout(() => {
        emotionalDesign.celebrateStreak(currentStreak);
      }, 3000);
    }
  }, [currentStreak, emotionalDesign]);

  // Mock data for AI tutors with enhanced interactions
  const aiTutors = [
    {
      name: "Nova AI",
      subject: "General Assistant",
      description: "Your all-in-one AI tutor for any subject. Get instant help with homework, explanations, and study guidance.",
      avatar: "🤖",
      status: "online" as const,
      lastUsed: "2 minutes ago",
      onClick: () => {
        emotionalDesign.sound.playSound('button-click');
        emotionalDesign.interactions.triggerSuccessRipple();
      }
    },
    {
      name: "Math Mentor",
      subject: "Mathematics",
      description: "Master calculus, algebra, geometry, and statistics with step-by-step solutions and visual explanations.",
      avatar: "📐",
      status: "online" as const,
      lastUsed: "1 hour ago",
      onClick: () => {
        emotionalDesign.sound.playSound('button-click');
      }
    },
    {
      name: "Science Sage",
      subject: "Science",
      description: "Explore physics, chemistry, and biology with interactive experiments and detailed concept explanations.",
      avatar: "🔬",
      status: "online" as const,
      lastUsed: "3 hours ago",
      onClick: () => {
        emotionalDesign.sound.playSound('button-click');
      }
    }
  ];

  // Mock data for daily challenges
  const dailyChallenges = [
    {
      id: 'daily-1',
      title: 'Complete 3 Lessons',
      description: 'Finish any 3 lessons today to earn bonus points',
      type: 'daily' as const,
      points: 50,
      progress: 2,
      target: 3,
      completed: false,
      expiresIn: '8 hours'
    },
    {
      id: 'daily-2',
      title: 'Study Streak',
      description: 'Maintain your daily study streak',
      type: 'streak' as const,
      points: 25,
      progress: currentStreak,
      target: currentStreak + 1,
      completed: true,
      expiresIn: '23 hours'
    },
    {
      id: 'weekly-1',
      title: 'Master 5 Topics',
      description: 'Complete and master 5 different topics this week',
      type: 'weekly' as const,
      points: 200,
      progress: 3,
      target: 5,
      completed: false,
      expiresIn: '3 days'
    }
  ];

  // Enhanced activity cards with micro-interactions
  const ActivityCard = ({ icon: Icon, title, description, action, color = "blue" }: any) => (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="cursor-pointer border-2 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
              <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
              <AnimatedButton
                variant="primary"
                size="sm"
                onClick={() => {
                  emotionalDesign.sound.playSound('button-click');
                  action?.();
                }}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Settings panel for emotional design
  const EmotionalDesignSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Experience Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {emotionalDesign.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>Sound Effects</span>
          </div>
          <Button
            variant={emotionalDesign.soundEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const newState = !emotionalDesign.soundEnabled;
              emotionalDesign.setSoundEnabled(newState);
              if (newState) emotionalDesign.sound.playSound('notification');
            }}
          >
            {emotionalDesign.soundEnabled ? 'On' : 'Off'}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-4 w-4" />
            <span>Animations</span>
          </div>
          <Button
            variant={emotionalDesign.animationsEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => emotionalDesign.setAnimationsEnabled(!emotionalDesign.animationsEnabled)}
          >
            {emotionalDesign.animationsEnabled ? 'On' : 'Off'}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smile className="h-4 w-4" />
            <span>AI Companion</span>
          </div>
          <Button
            variant={emotionalDesign.mascotEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const newState = !emotionalDesign.mascotEnabled;
              emotionalDesign.setMascotEnabled(newState);
              if (newState) emotionalDesign.showWelcomeMessage();
            }}
          >
            {emotionalDesign.mascotEnabled ? 'On' : 'Off'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Dashboard - Study Nova</title>
        <meta name="description" content="Your personalized learning dashboard with AI-powered study tools, progress tracking, and gamified experiences." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Welcome Flow for New Users */}
        <AnimatePresence>
          {showWelcome && (
            <MagicalWelcome
              isFirstTime={isFirstTime}
              onComplete={() => {
                setShowWelcome(false);
                emotionalDesign.celebrateAchievement('Welcome to Study Nova!');
              }}
              onSkip={() => setShowWelcome(false)}
            />
          )}
        </AnimatePresence>

        {/* Header with enhanced branding */}
        <motion.header 
          className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <motion.div 
                    className="flex items-center space-x-2 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Study Nova
                    </span>
                  </motion.div>
                </Link>
                
                {/* Floating mascot in header */}
                {emotionalDesign.mascotEnabled && (
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <NovaBot emotion="happy" size="sm" />
                  </motion.div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome back, {user?.displayName || 'Scholar'}!
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => emotionalDesign.showEncouragement()}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Need Help?
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="study">Study Tools</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Enhanced Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <WelcomeMessage user={user} />
              </motion.div>

              {/* Enhanced XP and Streak Systems */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatedXPSystem 
                    showXPGain={xpGain}
                    xpGained={25}
                    onXPAnimationComplete={() => setXpGain(false)}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AnimatedStreakSystem />
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Rocket className="mr-2 h-6 w-6 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ActivityCard
                        icon={Brain}
                        title="AI Tutor Session"
                        description="Get instant help with homework and study questions"
                        color="blue"
                        action={() => {
                          emotionalDesign.celebrateCorrectAnswer();
                          setXpGain(true);
                        }}
                      />
                      <ActivityCard
                        icon={Target}
                        title="Daily Challenge"
                        description="Complete today's learning challenge for bonus XP"
                        color="green"
                        action={() => {
                          emotionalDesign.interactions.triggerTaskCompletion('Daily Challenge', 30);
                        }}
                      />
                      <ActivityCard
                        icon={Trophy}
                        title="Achievements"
                        description="View your accomplishments and unlock new badges"
                        color="yellow"
                        action={() => {
                          setShowAchievement(true);
                          emotionalDesign.celebrateAchievement('Achievement Hunter');
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Subject Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SubjectOverview />
              </motion.div>
            </TabsContent>

            {/* Study Tools Tab */}
            <TabsContent value="study" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <AITutors />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <StudyPlanGenerator />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <VisualLearningTools />
              </motion.div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <RankingSystem 
                    currentPoints={750} 
                    nextRankPoints={1000} 
                    currentRank="Dedicated Scholar" 
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <PointsActivity activities={[]} />
                </motion.div>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Leaderboard users={[]} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DailyChallenge challenges={dailyChallenges} streak={currentStreak} />
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <EmotionalDesignSettings />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Demo Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <AnimatedButton
                          variant="success"
                          onClick={() => emotionalDesign.celebrateCorrectAnswer()}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Celebrate Success
                        </AnimatedButton>
                        <AnimatedButton
                          variant="primary"
                          onClick={() => emotionalDesign.celebrateStreak(currentStreak + 1)}
                        >
                          <Flame className="mr-2 h-4 w-4" />
                          Streak Bonus
                        </AnimatedButton>
                        <AnimatedButton
                          onClick={() => emotionalDesign.celebrateAchievement('Test Achievement')}
                        >
                          <Award className="mr-2 h-4 w-4" />
                          Achievement
                        </AnimatedButton>
                        <AnimatedButton
                          onClick={() => emotionalDesign.showEncouragement()}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Encouragement
                        </AnimatedButton>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Floating Feedback System */}
        {emotionalDesign.interactions.feedbacks.map(feedback => (
          <FloatingFeedback
            key={feedback.id}
            type={feedback.type}
            message={feedback.message}
            position={feedback.position}
            value={feedback.value}
            onComplete={() => emotionalDesign.interactions.removeFeedback(feedback.id)}
          />
        ))}

        {/* Mascot Dialogue System */}
        {emotionalDesign.mascot.mascotState.isVisible && (
          <MascotDialogue
            trigger={emotionalDesign.mascot.mascotState.trigger}
            context={emotionalDesign.mascot.mascotState.context}
            position={emotionalDesign.mascot.mascotState.position}
            onClose={emotionalDesign.mascot.hideMascot}
          />
        )}
      </div>
    </>
  );
};

export default EnhancedDashboard;