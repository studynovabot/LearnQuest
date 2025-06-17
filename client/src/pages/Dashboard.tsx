import { Helmet } from 'react-helmet';
import SubjectOverview from "@/components/dashboard/SubjectOverview";
import AITutors from "@/components/dashboard/AITutors";
import NovaLogo from "@/components/ui/NovaLogo";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import StudyPlanGenerator from "@/components/dashboard/StudyPlanGenerator";
import VisualLearningTools from "@/components/dashboard/VisualLearningTools";
import TextbookConnector from "@/components/dashboard/TextbookConnector";
import PersonalizedDashboard from "@/components/dashboard/PersonalizedDashboard";
import RankingSystem from "@/components/gamification/RankingSystem";
import PointsActivity from "@/components/gamification/PointsActivity";
import Leaderboard from "@/components/gamification/Leaderboard";
import DailyChallenge from "@/components/gamification/DailyChallenge";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PremiumCard, StatCard, TutorCard } from "@/components/premium/PremiumCard";
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
  Gift
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

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
      points: 1250,
      rank: 1,
      previousRank: 2,
      level: 4
    },
    {
      id: "2",
      name: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=2",
      points: 1180,
      rank: 2,
      previousRank: 1,
      level: 4
    },
    {
      id: "3",
      name: "Maya Patel",
      avatar: "https://i.pravatar.cc/150?img=3",
      points: 980,
      rank: 3,
      previousRank: 3,
      level: 3
    },
    {
      id: "4",
      name: user?.displayName || "You",
      avatar: user?.profileImage || undefined,
      points: 750,
      rank: 4,
      previousRank: 6,
      level: 3,
      isCurrentUser: true
    },
    {
      id: "5",
      name: "David Kim",
      avatar: "https://i.pravatar.cc/150?img=4",
      points: 720,
      rank: 5,
      previousRank: 4,
      level: 3
    },
    {
      id: "6",
      name: "Emma Wilson",
      avatar: "https://i.pravatar.cc/150?img=5",
      points: 690,
      rank: 6,
      previousRank: 5,
      level: 3
    },
    {
      id: "7",
      name: "James Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=6",
      points: 650,
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

      <div className="min-h-screen bg-background">
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
                        Welcome, <span className="text-gradient">{user?.displayName?.split(' ')[0] || 'Demo'}</span>
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
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-20"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-3">
                      Your AI Tutors
                    </h2>
                    <p className="text-muted-foreground text-lg">Choose your AI tutor and start learning instantly</p>
                  </div>
                  <div className="flex items-center space-x-2 px-5 py-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">All tutors online</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {aiTutors.map((tutor, index) => (
                    <motion.div
                      key={tutor.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                    >
                      <TutorCard {...tutor} />
                    </motion.div>
                  ))}
                </div>
                
                {/* View All Button with more whitespace */}
                <div className="flex justify-center mt-10">
                  <PremiumButton variant="outline" className="px-8 py-3 rounded-xl">
                    View All Tutors
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </PremiumButton>
                </div>
              </motion.section>

              {/* Quick Actions - More spacious and cleaner */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-20"
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-10">
                  Quick Actions
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <Link href="/ncert-solutions">
                    <PremiumButton variant="secondary" className="flex-col h-32 space-y-4 hover:bg-primary/5">
                      <BookOpen className="h-8 w-8" />
                      <span className="text-base">NCERT Solutions</span>
                    </PremiumButton>
                  </Link>
                  <Link href="/chat">
                    <PremiumButton variant="secondary" className="flex-col h-32 space-y-4 hover:bg-primary/5">
                      <MessageSquare className="h-8 w-8" />
                      <span className="text-base">AI Chat</span>
                    </PremiumButton>
                  </Link>
                  <Link href="/dashboard">
                    <PremiumButton variant="secondary" className="flex-col h-32 space-y-4 hover:bg-primary/5">
                      <BarChart3 className="h-8 w-8" />
                      <span className="text-base">Progress</span>
                    </PremiumButton>
                  </Link>
                  <Link href="/settings">
                    <PremiumButton variant="secondary" className="flex-col h-32 space-y-4 hover:bg-primary/5">
                      <Settings className="h-8 w-8" />
                      <span className="text-base">Settings</span>
                    </PremiumButton>
                  </Link>
                </div>
              </motion.section>

              {/* Ranking and Activity - Inspired by Brainly */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-20"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <RankingSystem 
                    currentPoints={rankingData.currentPoints}
                    nextRankPoints={rankingData.nextRankPoints}
                    currentRank={rankingData.currentRank}
                  />
                  <PointsActivity activities={pointsActivities} />
                </div>
              </motion.section>
            </TabsContent>

            <TabsContent value="learning">
              {/* Study Plan Generator and Personalized Dashboard */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-20"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <StudyPlanGenerator />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <PersonalizedDashboard />
                  </motion.div>
                </div>
              </motion.section>

              {/* Visual Learning Tools and Textbook Connector */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-20"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <VisualLearningTools />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <TextbookConnector />
                  </motion.div>
                </div>
              </motion.section>
            </TabsContent>

            <TabsContent value="challenges">
              {/* Daily Challenges - Inspired by Brainly */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-20"
              >
                <DailyChallenge challenges={dailyChallenges} streak={7} />
              </motion.section>

              {/* Achievement Badges - Inspired by Brainly */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-20"
              >
                <PremiumCard className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center">
                        <Medal className="h-6 w-6 mr-3 text-amber-500" />
                        Your Achievements
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        Collect badges by completing challenges and milestones
                      </p>
                    </div>
                    <PremiumButton variant="outline" size="sm">
                      View All Badges
                    </PremiumButton>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[
                      { name: "First Answer", icon: "🎯", color: "bg-blue-100 dark:bg-blue-900/30", earned: true },
                      { name: "Week Streak", icon: "🔥", color: "bg-amber-100 dark:bg-amber-900/30", earned: true },
                      { name: "Quiz Master", icon: "🧠", color: "bg-purple-100 dark:bg-purple-900/30", earned: true },
                      { name: "Helper", icon: "🤝", color: "bg-green-100 dark:bg-green-900/30", earned: true },
                      { name: "Early Bird", icon: "🌅", color: "bg-orange-100 dark:bg-orange-900/30", earned: false },
                      { name: "Math Whiz", icon: "🔢", color: "bg-indigo-100 dark:bg-indigo-900/30", earned: false },
                    ].map((badge, index) => (
                      <motion.div
                        key={badge.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className={`flex flex-col items-center justify-center p-6 rounded-xl ${badge.color} ${!badge.earned && 'opacity-40 grayscale'}`}
                      >
                        <div className="text-4xl mb-3">{badge.icon}</div>
                        <p className="text-center font-medium text-sm">{badge.name}</p>
                        {badge.earned && (
                          <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Earned
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </PremiumCard>
              </motion.section>
            </TabsContent>

            <TabsContent value="community">
              {/* Leaderboard - Inspired by Brainly */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-20"
              >
                <Leaderboard users={leaderboardUsers} />
              </motion.section>

              {/* Community Questions - Inspired by Brainly */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-20"
              >
                <PremiumCard className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center">
                        <MessageSquare className="h-6 w-6 mr-3 text-primary" />
                        Community Questions
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        Help other students by answering their questions and earn points
                      </p>
                    </div>
                    <PremiumButton variant="outline" size="sm">
                      Ask a Question
                    </PremiumButton>
                  </div>

                  <div className="space-y-6">
                    {[
                      { 
                        subject: "Mathematics", 
                        title: "How do I solve this quadratic equation?", 
                        points: 10, 
                        time: "10 minutes ago",
                        answers: 0
                      },
                      { 
                        subject: "Physics", 
                        title: "Can someone explain Newton's third law with examples?", 
                        points: 15, 
                        time: "25 minutes ago",
                        answers: 1
                      },
                      { 
                        subject: "Chemistry", 
                        title: "What's the difference between covalent and ionic bonds?", 
                        points: 12, 
                        time: "1 hour ago",
                        answers: 2
                      },
                    ].map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="p-6 border border-border/30 rounded-xl bg-card/50"
                      >
                        <div className="flex items-start">
                          <div className="bg-primary/10 text-primary rounded-lg p-3 mr-4">
                            <Lightbulb className="h-6 w-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <span className="font-medium text-primary">{question.subject}</span>
                              <span className="mx-2">•</span>
                              <span>{question.time}</span>
                              <span className="mx-2">•</span>
                              <span>{question.answers} answers</span>
                            </div>
                            
                            <h3 className="text-lg font-medium mb-4">{question.title}</h3>
                            
                            <div className="flex justify-between items-center">
                              <PremiumButton variant="outline" size="sm">
                                Answer
                              </PremiumButton>
                              
                              <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                                <Gift className="h-4 w-4 mr-1" />
                                {question.points} pts
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <PremiumButton variant="outline">
                      View More Questions
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.section>
            </TabsContent>
          </Tabs>

          {/* Explore More Section - Clean and spacious */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-10"
          >
            <PremiumCard className="p-12 text-center">
              <h3 className="text-2xl font-display font-bold mb-6">Ready to explore more?</h3>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Discover all the powerful features StudyNova AI has to offer and take your learning to the next level.
              </p>
              <PremiumButton variant="gradient" size="lg" className="px-8 py-4 rounded-xl">
                <Sparkles className="h-5 w-5 mr-2" />
                Explore All Features
              </PremiumButton>
            </PremiumCard>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;