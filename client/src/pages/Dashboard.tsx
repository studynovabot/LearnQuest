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
  Link as LinkIcon
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
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200/30 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/20 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Premium Welcome Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <PremiumCard className="p-8 overflow-hidden relative" gradient>
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex-1 mb-6 md:mb-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                        Welcome back, <span className="text-gradient">{user?.displayName?.split(' ')[0] || 'Demo'}!</span> 👋
                      </h1>
                      <p className="text-muted-foreground text-lg">Ready to continue your AI-powered learning journey?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
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
                
                <div className="flex space-x-4">
                  <PremiumButton variant="gradient" size="lg" className="group">
                    <Zap className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                    Start Learning
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          </motion.section>

          {/* Quick Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* AI Tutors Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                  Your AI Tutors
                </h2>
                <p className="text-muted-foreground">Choose your AI tutor and start learning instantly</p>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">All tutors online</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <PremiumCard className="p-8">
              <h3 className="text-xl font-display font-bold text-foreground mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/ncert-solutions">
                  <PremiumButton variant="secondary" className="flex-col h-20 space-y-2">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">NCERT Solutions</span>
                  </PremiumButton>
                </Link>
                <Link href="/chat">
                  <PremiumButton variant="secondary" className="flex-col h-20 space-y-2">
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">AI Chat</span>
                  </PremiumButton>
                </Link>
                <Link href="/dashboard">
                  <PremiumButton variant="secondary" className="flex-col h-20 space-y-2">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Progress</span>
                  </PremiumButton>
                </Link>
                <Link href="/settings">
                  <PremiumButton variant="secondary" className="flex-col h-20 space-y-2">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">Settings</span>
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>
          </motion.section>

          {/* New Features Section */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Advanced Learning Tools
            </h2>
            <p className="text-muted-foreground mb-6">Powerful AI-powered tools to enhance your learning experience</p>
          </div>

          {/* Study Plan Generator and Personalized Dashboard */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Visual Learning Tools and Textbook Connector */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Feature Highlights */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mb-12"
          >
            <PremiumCard className="p-8">
              <h3 className="text-xl font-display font-bold text-foreground mb-6">Why Students Love Study Nova</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-muted/30 rounded-lg p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Save Time</h4>
                  <p className="text-sm text-muted-foreground">
                    "In about 30 minutes of prompt ping-pong, it identified the issue with my understanding. I told the Agent I didn't want to memorize — just understand!"
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Instant Study Guides</h4>
                  <p className="text-sm text-muted-foreground">
                    "In just 14 minutes, the agent created the most beautiful, fully functional study guide for this chapter. All I did was give it the link to the textbook..."
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Personal Tutor</h4>
                  <p className="text-sm text-muted-foreground">
                    "I'd describe this agent as my personal paid tutor — it handles around 95% of the work, including explaining and helping me practice concepts."
                  </p>
                </div>
              </div>
            </PremiumCard>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
