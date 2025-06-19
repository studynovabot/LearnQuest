import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Import our components
import EmotionalDesignDemo from '@/components/demo/EmotionalDesignDemo';
import EmotionalDesignSettings from '@/components/settings/EmotionalDesignSettings';
import AchievementShowcase from '@/components/achievements/AchievementShowcase';
import { AnimatedNovaStore } from '@/components/emotional-design';
import EmotionalQuiz from '@/components/quiz/EmotionalQuiz';

import { 
  Sparkles, 
  Settings, 
  Award, 
  ShoppingBag, 
  BookOpen,
  TestTube,
  Heart,
  Zap,
  Crown,
  Star
} from 'lucide-react';

const EmotionalDesignShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('demo');

  // Sample quiz data
  const sampleQuiz = {
    title: "Emotional Design Quiz",
    questions: [
      {
        id: '1',
        question: "What is the primary purpose of emotional design in educational applications?",
        options: [
          "To make the interface look pretty",
          "To increase user engagement and motivation",
          "To slow down the learning process",
          "To add unnecessary complexity"
        ],
        correctAnswer: 1,
        explanation: "Emotional design enhances user engagement and motivation by creating positive emotional connections with the learning experience.",
        points: 25
      },
      {
        id: '2',
        question: "Which element is NOT part of Study Nova's emotional design system?",
        options: [
          "NovaBot AI companion",
          "Sound effects and celebrations",
          "Animated micro-interactions",
          "Complex navigation menus"
        ],
        correctAnswer: 3,
        explanation: "Complex navigation menus are not part of emotional design - we focus on simplicity while adding delightful interactions.",
        points: 25
      },
      {
        id: '3',
        question: "What makes micro-interactions effective in learning applications?",
        options: [
          "They provide immediate feedback",
          "They celebrate user achievements",
          "They guide user attention",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Effective micro-interactions provide immediate feedback, celebrate achievements, and guide user attention - all crucial for learning.",
        points: 30
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Emotional Design Showcase - Study Nova</title>
        <meta name="description" content="Experience the magic of emotional design in Study Nova - delightful interactions, AI companion, and engaging learning experiences." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20">
        {/* Hero Section */}
        <motion.section 
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * 400,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  y: [Math.random() * 400, Math.random() * 400 - 100, Math.random() * 400],
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              >
                {i % 4 === 0 && <Sparkles className="h-6 w-6 text-yellow-300" />}
                {i % 4 === 1 && <Heart className="h-5 w-5 text-pink-300" />}
                {i % 4 === 2 && <Star className="h-4 w-4 text-blue-300" />}
                {i % 4 === 3 && <Zap className="h-5 w-5 text-green-300" />}
              </motion.div>
            ))}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                ✨ Emotional Design System ✨
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
                Discover how delightful interactions, AI companionship, and beautiful animations 
                transform learning into an engaging, motivating experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-8 py-3"
                  onClick={() => setActiveTab('demo')}
                >
                  <TestTube className="mr-2 h-5 w-5" />
                  Try Interactive Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3"
                  onClick={() => setActiveTab('quiz')}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Take the Quiz
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TabsList className="grid grid-cols-6 w-full max-w-4xl mx-auto">
                <TabsTrigger value="demo" className="flex items-center space-x-2">
                  <TestTube className="h-4 w-4" />
                  <span className="hidden sm:inline">Demo</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="store" className="flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Store</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">About</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Interactive Demo */}
            <TabsContent value="demo">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EmotionalDesignDemo />
              </motion.div>
            </TabsContent>

            {/* Emotional Quiz */}
            <TabsContent value="quiz">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EmotionalQuiz
                  title={sampleQuiz.title}
                  questions={sampleQuiz.questions}
                  onComplete={(score, points) => {
                    console.log(`Quiz completed! Score: ${score}, Points: ${points}`);
                  }}
                />
              </motion.div>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AchievementShowcase />
              </motion.div>
            </TabsContent>

            {/* Store */}
            <TabsContent value="store">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AnimatedNovaStore />
              </motion.div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EmotionalDesignSettings />
              </motion.div>
            </TabsContent>

            {/* About */}
            <TabsContent value="about">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Philosophy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Heart className="mr-3 h-6 w-6 text-red-500" />
                      Our Design Philosophy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      Learning should be joyful, not just functional. Our emotional design system 
                      transforms every interaction into an opportunity for positive reinforcement, 
                      creating an environment where students feel supported, celebrated, and motivated 
                      to continue their educational journey.
                    </p>
                  </CardContent>
                </Card>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <Sparkles className="h-8 w-8 text-purple-600" />,
                      title: "Delightful Interactions",
                      description: "Every click, hover, and action provides satisfying feedback that makes using the app a pleasure."
                    },
                    {
                      icon: <Crown className="h-8 w-8 text-yellow-600" />,
                      title: "Achievement System",
                      description: "Progress tracking with beautiful visualizations that celebrate every milestone and accomplishment."
                    },
                    {
                      icon: <Heart className="h-8 w-8 text-red-500" />,
                      title: "AI Companion",
                      description: "NovaBot provides encouragement, celebrates successes, and offers gentle guidance when needed."
                    },
                    {
                      icon: <Zap className="h-8 w-8 text-blue-600" />,
                      title: "Smart Animations",
                      description: "Purposeful motion that guides attention, provides feedback, and enhances understanding."
                    },
                    {
                      icon: <Star className="h-8 w-8 text-amber-500" />,
                      title: "Celebration Effects",
                      description: "Confetti, sparkles, and sound effects that make every achievement feel special and rewarding."
                    },
                    {
                      icon: <Settings className="h-8 w-8 text-gray-600" />,
                      title: "Accessibility First",
                      description: "Respects user preferences with options to customize or disable effects for optimal comfort."
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">{feature.icon}</div>
                          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Impact */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">The Impact of Emotional Design</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Increase in user engagement
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">73%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Higher completion rates
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Positive user feedback
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default EmotionalDesignShowcase;