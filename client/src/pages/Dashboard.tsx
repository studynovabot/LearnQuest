import { Helmet } from 'react-helmet';

import Leaderboard from "@/components/gamification/Leaderboard";
import DailyChallenge from "@/components/gamification/DailyChallenge";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

import { PremiumCard, StatCard } from "@/components/premium/PremiumCard";
import { PremiumButton } from "@/components/premium/PremiumButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  Trophy,
  Star,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,

  Crown,
  PlusCircle,
  Rocket,
  Medal,
  Gift,
  Heart,
  Settings,
  Upload,
  FileText,
  UserCheck
} from "lucide-react";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [currentStreak] = useState(7);
  
  const SPACE_CHAR = ' ';
  const DEMO_TEXT = 'Demo';



  // Mock data for AI tutors
  const aiTutors = [
    {
      name: "Nova AI",
      subject: "General Assistant",
      description: "Your all-in-one AI tutor for any subject. Get instant help with homework, explanations, and study guidance.",
      avatar: "🤖",
      status: "online" as const,
      lastUsed: "2 minutes ago"
    },
    {
      name: "Math Mentor",
      subject: "Mathematics",
      description: "Master calculus, algebra, geometry, and statistics with step-by-step solutions and visual explanations.",
      avatar: "📐",
      status: "online" as const,
      lastUsed: "1 hour ago"
    },
    {
      name: "Science Sage",
      subject: "Science",
      description: "Explore physics, chemistry, and biology with interactive experiments and detailed concept explanations.",
      avatar: "🔬",
      status: "online" as const,
      lastUsed: "3 hours ago"
    }
  ];

  // Mock data for ranking system
  const rankingData = {
    currentPoints: 750,
    nextRankPoints: 1000,
    currentRank: "Dedicated Scholar"
  };

  // Mock data for points activity
  const pointsActivities = [
    {
      id: "1",
      type: "question_answered" as const,
      points: 15,
      description: "Answered a question about Calculus",
      timestamp: "2023-06-15T14:30:00"
    },
    {
      id: "2",
      type: "streak" as const,
      points: 10,
      description: "Maintained a 7-day learning streak",
      timestamp: "2023-06-15T09:00:00"
    },
    {
      id: "3",
      type: "challenge_completed" as const,
      points: 25,
      description: "Completed daily challenge: Study for 30 minutes",
      timestamp: "2023-06-14T16:45:00"
    },
    {
      id: "4",
      type: "upvote_received" as const,
      points: 5,
      description: "Your answer was upvoted by 3 students",
      timestamp: "2023-06-14T11:20:00"
    },
    {
      id: "5",
      type: "study_session" as const,
      points: 20,
      description: "Completed a 1-hour study session",
      timestamp: "2023-06-13T15:10:00"
    }
  ];

  // Mock data for leaderboard
  const leaderboardUsers = [
    {
      id: "1",
      name: "Sophia Chen",
      avatar: "https://i.pravatar.cc/150?img=1",
      studyPoints: 1250,
      rank: 1,
      previousRank: 2,
      level: 4
    },
    {
      id: "2",
      name: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=2",
      studyPoints: 1180,
      rank: 2,
      previousRank: 1,
      level: 4
    },
    {
      id: "3",
      name: "Maya Patel",
      avatar: "https://i.pravatar.cc/150?img=3",
      studyPoints: 980,
      rank: 3,
      previousRank: 3,
      level: 3
    },
    {
      id: "4",
      name: user?.displayName || "You",
      avatar: user?.profilePic || undefined,
      studyPoints: 750,
      rank: 4,
      previousRank: 6,
      level: 3,
      isCurrentUser: true
    },
    {
      id: "5",
      name: "David Kim",
      avatar: "https://i.pravatar.cc/150?img=4",
      studyPoints: 720,
      rank: 5,
      previousRank: 4,
      level: 3
    },
    {
      id: "6",
      name: "Emma Wilson",
      avatar: "https://i.pravatar.cc/150?img=5",
      studyPoints: 690,
      rank: 6,
      previousRank: 5,
      level: 3
    },
    {
      id: "7",
      name: "James Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=6",
      studyPoints: 650,
      rank: 7,
      previousRank: 7,
      level: 2
    }
  ];

  // Mock data for daily challenges
  const dailyChallenges = [
    {
      id: "1",
      title: "Study Session",
      description: "Complete a 30-minute study session",
      type: "daily" as const,
      points: 20,
      progress: 30,
      target: 30,
      completed: true
    },
    {
      id: "2",
      title: "Answer Questions",
      description: "Help other students by answering 3 questions",
      type: "daily" as const,
      points: 15,
      progress: 2,
      target: 3,
      completed: false,
      expiresIn: "8 hours"
    },
    {
      id: "3",
      title: "Practice Problems",
      description: "Solve 5 practice problems in any subject",
      type: "daily" as const,
      points: 25,
      progress: 3,
      target: 5,
      completed: false,
      expiresIn: "8 hours"
    },
    {
      id: "4",
      title: "Weekly Mastery",
      description: "Complete 3 quizzes with at least 80% score",
      type: "weekly" as const,
      points: 50,
      progress: 2,
      target: 3,
      completed: false,
      expiresIn: "3 days"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard | StudyNova AI - World's Most Advanced AI Learning Platform</title>
        <meta name="description" content="Experience the future of learning with personalized AI tutors, real-time progress tracking, and adaptive study plans." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        {/* Subtle Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-40 right-40 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute bottom-40 left-40 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
          {/* Welcome Section - Cleaner with more whitespace */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <PremiumCard className="p-12 overflow-hidden relative" gradient>
              {/* Subtle Background Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex-1 mb-8 md:mb-0">
                  <div className="flex items-center space-x-5 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center animate-glow">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                        Welcome, <span className="text-gradient">{user?.displayName?.split(SPACE_CHAR)[0] || DEMO_TEXT}</span>
                      </h1>
                      <p className="text-muted-foreground text-xl mt-2">Ready to continue your learning journey?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8 text-sm mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">All AI tutors online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">Pro Member</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-muted-foreground">7-day streak</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <PremiumButton variant="gradient" size="lg" className="group px-8 py-6 rounded-xl text-lg">
                    <Zap className="h-5 w-5 mr-3 group-hover:animate-bounce" />
                    Start Learning
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          </motion.section>

          {/* Dashboard Tabs - Inspired by Brainly's clean interface */}
          <Tabs defaultValue="home" className="mb-16">
            <TabsList className="w-full justify-start mb-8 bg-transparent border-b border-border/40 p-0 h-auto">
              <TabsTrigger 
                value="home" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Home
              </TabsTrigger>
              <TabsTrigger 
                value="learning" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Learning
              </TabsTrigger>
              <TabsTrigger 
                value="challenges" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Target className="h-5 w-5 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger 
                value="community" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Users className="h-5 w-5 mr-2" />
                Community
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home">
              {/* Quick Stats - More spacious layout */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-20"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard
                    title="Study Streak"
                    value="7 days"
                    icon={<Flame className="h-6 w-6" />}
                    trend="+2 from last week"
                    color="orange"
                  />
                  <StatCard
                    title="Questions Solved"
                    value="142"
                    icon={<CheckCircle className="h-6 w-6" />}
                    trend="+23 today"
                    color="green"
                  />
                  <StatCard
                    title="Study Time"
                    value="2.5 hrs"
                    icon={<Clock className="h-6 w-6" />}
                    trend="Today"
                    color="blue"
                  />
                  <StatCard
                    title="Accuracy"
                    value="89%"
                    icon={<Target className="h-6 w-6" />}
                    trend="+5% this week"
                    color="purple"
                  />
                </div>
              </motion.section>

              {/* AI Tutors Section - Cleaner with more whitespace */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-20"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold">AI Tutors</h2>
                  <PremiumButton variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Explore More Tutors
                  </PremiumButton>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {aiTutors.map((tutor, index) => (
                    <motion.div
                      key={tutor.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <PremiumCard className="p-6 h-full">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                            {tutor.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{tutor.name}</h3>
                            <p className="text-sm text-muted-foreground">{tutor.subject}</p>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-6 text-sm">
                          {tutor.description}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                              <span>{tutor.status}</span>
                            </div>
                            <span>Last used: {tutor.lastUsed}</span>
                          </div>
                          
                          <PremiumButton variant="outline" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat Now
                          </PremiumButton>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
              
              {/* Gamification Section - More engaging with visual elements */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-20"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold">Your Progress</h2>
                  <PremiumButton variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Stats
                  </PremiumButton>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <PremiumCard className="p-6">
                    <div className="flex items-center mb-4">
                      <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                      <h3 className="font-bold">Ranking</h3>
                    </div>
                    
                    <div className="flex items-center justify-center my-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                          <span className="text-white text-3xl font-bold">#4</span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 font-medium">
                          +2 ↑
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current Rank</span>
                          <span className="font-medium">{rankingData.currentRank}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Points</span>
                          <span className="font-medium">{rankingData.currentPoints} / {rankingData.nextRankPoints}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-4">
                          <div 
                            className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" 
                            style={{ width: `${(rankingData.currentPoints / rankingData.nextRankPoints) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <PremiumButton variant="outline" size="sm" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        View Leaderboard
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                  
                  <PremiumCard className="p-6">
                    <div className="flex items-center mb-4">
                      <Flame className="h-5 w-5 text-orange-500 mr-2" />
                      <h3 className="font-bold">Daily Streak</h3>
                    </div>
                    
                    <div className="flex items-center justify-center my-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="text-3xl font-bold">7</div>
                            <div className="text-xs">days</div>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                          <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full w-8 h-8 flex items-center justify-center">
                            <Gift className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Next reward in</div>
                          <div className="text-muted-foreground text-xs">3 days (10-day streak)</div>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full px-2 py-1">
                          +50 XP
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-1">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="w-4 h-4 rounded-full bg-orange-500"
                            ></div>
                          ))}
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div 
                              key={i + 7} 
                              className="w-4 h-4 rounded-full bg-muted"
                            ></div>
                          ))}
                        </div>
                      </div>
                      
                      <PremiumButton variant="outline" size="sm" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Calendar
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                  
                  <PremiumCard className="p-6">
                    <div className="flex items-center mb-4">
                      <Award className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="font-bold">Achievements</h3>
                    </div>
                    
                    <div className="flex items-center justify-center my-6">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Rocket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Medal className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <PlusCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Achievements Unlocked</span>
                          <span className="font-medium">12 / 30</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-4">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(12 / 30) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <PremiumButton variant="outline" size="sm" className="w-full">
                        <Star className="h-4 w-4 mr-2" />
                        View All Achievements
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                </div>
              </motion.section>
              
              {/* Recent Activity Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold">Recent Activity</h2>
                  <PremiumButton variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    View All Activity
                  </PremiumButton>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PremiumCard className="p-6">
                    <div className="flex items-center mb-6">
                      <Zap className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-bold">Points Activity</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {pointsActivities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center">
                            <div className="mr-3 p-2 rounded-full bg-primary/10">
                              {activity.type === 'question_answered' && <MessageSquare className="h-4 w-4 text-primary" />}
                              {activity.type === 'streak' && <Flame className="h-4 w-4 text-orange-500" />}
                              {activity.type === 'challenge_completed' && <Target className="h-4 w-4 text-emerald-500" />}
                              {activity.type === 'upvote_received' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                              {activity.type === 'study_session' && <Clock className="h-4 w-4 text-purple-500" />}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{activity.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: 'numeric', 
                                  minute: 'numeric' 
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-primary">+{activity.points} XP</div>
                        </div>
                      ))}
                      
                      <PremiumButton variant="outline" size="sm" className="w-full">
                        <Zap className="h-4 w-4 mr-2" />
                        View All Points Activity
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                  
                  <PremiumCard className="p-6">
                    <div className="flex items-center mb-6">
                      <Target className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-bold">Daily Challenges</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {dailyChallenges.slice(0, 3).map((challenge) => (
                        <div key={challenge.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-sm font-medium">{challenge.title}</div>
                              <div className="text-xs text-muted-foreground">{challenge.description}</div>
                            </div>
                            <div className="text-sm font-medium text-primary">+{challenge.points} XP</div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="w-full max-w-[180px]">
                              <div className="flex justify-between mb-1">
                                <span>{challenge.progress} / {challenge.target}</span>
                                {challenge.expiresIn && (
                                  <span className="text-muted-foreground">Expires in {challenge.expiresIn}</span>
                                )}
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${challenge.completed ? 'bg-emerald-500' : 'bg-primary'}`}
                                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {challenge.completed ? (
                              <div className="ml-4 p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              </div>
                            ) : (
                              <PremiumButton variant="outline" size="sm" className="ml-4 h-7 px-2 text-xs">
                                Start
                              </PremiumButton>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <PremiumButton variant="outline" size="sm" className="w-full">
                        <Target className="h-4 w-4 mr-2" />
                        View All Challenges
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                </div>
              </motion.section>
            </TabsContent>
            
            <TabsContent value="learning">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Interactive Learning Cards */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => {}}
                >
                  <PremiumCard className="p-6 h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Quick Study</h3>
                        <p className="text-sm text-muted-foreground">15 min session</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Jump into a focused study session with AI-powered learning
                    </p>
                    <PremiumButton variant="primary" className="w-full">
                      Start Now ⚡
                    </PremiumButton>
                  </PremiumCard>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => {}}
                >
                  <PremiumCard className="p-6 h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Practice Tests</h3>
                        <p className="text-sm text-muted-foreground">AI-generated</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Test your knowledge with adaptive practice questions
                    </p>
                    <PremiumButton variant="primary" className="w-full">
                      Take Test 🎯
                    </PremiumButton>
                  </PremiumCard>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => {}}
                >
                  <PremiumCard className="p-6 h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">AI Tutor Chat</h3>
                        <p className="text-sm text-muted-foreground">24/7 available</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get instant help from your personal AI tutor
                    </p>
                    <PremiumButton variant="secondary" className="w-full">
                      Chat Now 💬
                    </PremiumButton>
                  </PremiumCard>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="challenges">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">🎯 Daily Challenges</h2>
                  <p className="text-muted-foreground">Complete challenges to earn XP and maintain your streak!</p>
                </div>
                
                <DailyChallenge challenges={dailyChallenges} streak={currentStreak} />
                
                {/* Challenge Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => {}}
                  >
                    <PremiumCard className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Flame className="h-8 w-8 text-orange-500 mr-3 animate-pulse" />
                          <div>
                            <h3 className="font-bold text-lg">Streak Challenge</h3>
                            <p className="text-sm text-muted-foreground">Keep your learning streak alive!</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
                          <div className="text-xs">days</div>
                        </div>
                      </div>
                      <PremiumButton variant="primary" className="w-full">
                        Extend Streak 🔥
                      </PremiumButton>
                    </PremiumCard>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => {}}
                  >
                    <PremiumCard className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                          <div>
                            <h3 className="font-bold text-lg">Weekly Goal</h3>
                            <p className="text-sm text-muted-foreground">7 study sessions this week</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-500">5/7</div>
                          <div className="text-xs">sessions</div>
                        </div>
                      </div>
                      <PremiumButton variant="gradient" className="w-full">
                        Complete Goal 🏆
                      </PremiumButton>
                    </PremiumCard>
                  </motion.div>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="community">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">👥 Learning Community</h2>
                  <p className="text-muted-foreground">Connect with fellow learners and share your progress!</p>
                </div>

                {/* Community Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => {}}
                  >
                    <PremiumCard className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                      <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-blue-600">2,847</div>
                      <div className="text-sm text-muted-foreground">Active Learners</div>
                    </PremiumCard>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => {}}
                  >
                    <PremiumCard className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-green-600">156</div>
                      <div className="text-sm text-muted-foreground">Questions Answered</div>
                    </PremiumCard>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => {}}
                  >
                    <PremiumCard className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <Heart className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-purple-600">89</div>
                      <div className="text-sm text-muted-foreground">Helpful Votes</div>
                    </PremiumCard>
                  </motion.div>
                </div>

                {/* Leaderboard Preview */}
                <PremiumCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                      Weekly Leaderboard
                    </h3>
                    <PremiumButton variant="secondary" size="sm">
                      View Full Board
                    </PremiumButton>
                  </div>
                  <Leaderboard users={leaderboardUsers.slice(0, 5)} />
                </PremiumCard>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Action Buttons - Duolingo Style */}
        <div className="fixed bottom-6 left-6 z-40 flex flex-col space-y-4">
          <motion.button
            className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {}}
            title="Practice Questions"
          >
            <Brain className="h-6 w-6" />
          </motion.button>
          
          <motion.button
            className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {}}
            title="Daily Motivation"
          >
            <Heart className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {}}
            title="Quick Study"
          >
            <Zap className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Sound system disabled for stability */}

        {/* Progress Ring for Daily Goal */}
        <div className="fixed bottom-24 right-6 z-40">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="relative w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center"
          >
            <div className="absolute inset-1 rounded-full border-4 border-gray-200 dark:border-gray-600"></div>
            <div 
              className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent transform -rotate-90"
              style={{ 
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent'
              }}
            ></div>
            <div className="text-xs font-bold text-center z-10">
              <div className="text-blue-600">65%</div>
              <div className="text-xs text-gray-500">Daily</div>
            </div>
          </motion.div>
        </div>


      </div>
    </>
  );
};

export default Dashboard;