import { Helmet } from 'react-helmet';
import DailyTasks from "@/components/dashboard/DailyTasks";
import SubjectOverview from "@/components/dashboard/SubjectOverview";
import RewardsSection from "@/components/dashboard/RewardsSection";
import AITutors from "@/components/dashboard/AITutors";
import ProfileSection from "@/components/dashboard/ProfileSection";
import WeeklyStreak from "@/components/dashboard/WeeklyStreak";
import LeaderboardSection from "@/components/dashboard/LeaderboardSection";
import ChatInterface from "@/components/dashboard/ChatInterface";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard | Study Nova - Gamified Learning Platform</title>
        <meta name="description" content="Track your learning progress, complete tasks, and interact with AI tutors on the Study Nova gamified learning platform." />
      </Helmet>

      <motion.div 
        className="flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <motion.section 
          className="bg-card rounded-2xl p-6 relative overflow-hidden glow"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute top-0 right-0 opacity-10">
            <div className="w-60 h-60 rounded-full bg-secondary blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="md:w-2/3">
              <h2 className="font-display text-3xl font-bold mb-2">
                Ace Your Exams with AI, <span className="text-secondary">{user?.displayName?.split(' ')[0] || 'Student'}!</span>
              </h2>
              <p className="text-muted-foreground mb-4">Complete daily tasks and challenges to maximize your learning and earn XP.</p>
              
              <div className="bg-muted rounded-xl p-4 flex items-start gap-4 max-w-md">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8L15 13.2L19 14.1L15.5 18.2L16.5 22L12 20.2L7.5 22L8.5 18.2L5 14.1L9 13.2L12 8Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-primary font-semibold mb-1">
                    You're on fire, {user?.displayName?.split(' ')[0] || 'Student'}!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete your daily tasks to earn more XP and keep your {user?.streak || 0}-day streak going.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:w-1/3">
              <div className="relative w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-display font-bold text-lg">NOVA</span>
                <div className="absolute inset-0 border-2 border-primary/50 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* Three Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <DailyTasks />
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <SubjectOverview />
          </motion.div>
          {/* <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <RewardsSection />
          </motion.div> */}
        </div>
        
        {/* AI Tutors Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <AITutors />
        </motion.div>
        
        {/* Leaderboard & Chat Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <LeaderboardSection />
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <ChatInterface />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
