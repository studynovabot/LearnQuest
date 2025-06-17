import { Helmet } from 'react-helmet';
import SubjectOverview from "@/components/dashboard/SubjectOverview";
import AITutors from "@/components/dashboard/AITutors";
import NovaLogo from "@/components/ui/NovaLogo";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import StudyPlanGenerator from "@/components/dashboard/StudyPlanGenerator";
import VisualLearningTools from "@/components/dashboard/VisualLearningTools";
import TextbookConnector from "@/components/dashboard/TextbookConnector";
import PersonalizedDashboard from "@/components/dashboard/PersonalizedDashboard";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PremiumCard, StatCard, TutorCard } from "@/components/premium/PremiumCard";
import { PremiumButton } from "@/components/premium/PremiumButton";
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
  PlusCircle
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

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
    },
    {
      name: "Language Linguist",
      subject: "Languages",
      description: "Improve your English, Hindi, and other languages with grammar help, writing assistance, and vocabulary building.",
      avatar: "📚",
      status: "online" as const,
      lastUsed: "5 hours ago"
    },
    {
      name: "History Helper",
      subject: "History",
      description: "Journey through time with engaging historical narratives, timeline analysis, and cultural insights.",
      avatar: "🏛️",
      status: "online" as const,
      lastUsed: "1 day ago"
    },
    {
      name: "Geography Guide",
      subject: "Geography",
      description: "Explore the world with interactive maps, climate studies, and geographical phenomenon explanations.",
      avatar: "🌍",
      status: "online" as const,
      lastUsed: "2 days ago"
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
              {aiTutors.slice(0, 3).map((tutor, index) => (
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

          {/* Advanced Learning Tools Section - More whitespace */}
          <div className="mb-10">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">
              Advanced Learning Tools
            </h2>
            <p className="text-muted-foreground text-lg mb-10">Powerful AI-powered tools to enhance your learning experience</p>
          </div>

          {/* Study Plan Generator and Personalized Dashboard - More spacious */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <StudyPlanGenerator />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <PersonalizedDashboard />
              </motion.div>
            </div>
          </motion.section>

          {/* Visual Learning Tools and Textbook Connector - More spacious */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <VisualLearningTools />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <TextbookConnector />
              </motion.div>
            </div>
          </motion.section>

          {/* Explore More Section - Clean and spacious */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
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