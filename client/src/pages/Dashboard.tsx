import { Helmet } from 'react-helmet';
import SubjectOverview from "@/components/dashboard/SubjectOverview";
import AITutors from "@/components/dashboard/AITutors";
import NovaLogo from "@/components/ui/NovaLogo";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { PremiumCard, PremiumCardContent } from "@/components/ui/premium-card";
import { GradientButton } from "@/components/ui/premium-button";
import IconTest from "@/components/debug/IconTest";

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
        {/* Premium Welcome Section */}
        <motion.section
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PremiumCard
            variant="glass-strong"
            className="p-8 overflow-hidden"
            glow={true}
            animate={false}
          >
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/20 via-blue-500/10 to-transparent rounded-full blur-2xl animate-pulse-subtle"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-xl animate-glow"></div>

            <PremiumCardContent className="relative z-10 p-0">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="md:w-2/3">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="font-display text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
                  >
                    Ace Your Exams with AI, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Student'}!</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-muted-foreground mb-6 text-lg leading-relaxed"
                  >
                    Access AI tutors, educational content, and personalized learning tools with our premium platform.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <WelcomeMessage user={user} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-6 flex gap-4"
                  >
                    <GradientButton
                      gradient="primary"
                      size="lg"
                      className="shadow-glow"
                    >
                      Start Learning
                    </GradientButton>
                    <GradientButton
                      gradient="secondary"
                      size="lg"
                      className="shadow-glow-orange"
                    >
                      Explore Features
                    </GradientButton>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="flex items-center justify-center md:w-1/3"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse-subtle"></div>
                    <NovaLogo size="xl" className="relative z-10 animate-float" />
                  </div>
                </motion.div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.section>

        {/* Subject Overview */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <SubjectOverview />
        </motion.div>

        {/* AI Tutors Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <AITutors />
        </motion.div>

        {/* Debug: Icon Test */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <IconTest />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard;
