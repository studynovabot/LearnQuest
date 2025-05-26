import { Helmet } from 'react-helmet';
import SubjectOverview from "@/components/dashboard/SubjectOverview";
import AITutors from "@/components/dashboard/AITutors";
import NovaLogo from "@/components/ui/NovaLogo";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Track your learning progress, complete tasks, and interact with AI tutors on the Nova AI gamified learning platform." />
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
                Ace Your Exams with AI, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Student'}!</span>
              </h2>
              <p className="text-muted-foreground mb-4">Access AI tutors, educational content, and personalized learning tools.</p>

              <WelcomeMessage user={user} />
            </div>

            <div className="flex items-center justify-center md:w-1/3">
              <NovaLogo size="xl" />
            </div>
          </div>
        </motion.section>

        {/* Subject Overview */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <SubjectOverview />
        </motion.div>

        {/* AI Tutors Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <AITutors />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard;
