import { Helmet } from 'react-helmet';
import SubjectOverview from "@/components/dashboard/SubjectOverview";
import AITutors from "@/components/dashboard/AITutors";
import NovaLogo from "@/components/ui/NovaLogo";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { PremiumCard, PremiumCardContent } from "@/components/ui/premium-card";
import { GradientButton } from "@/components/ui/premium-button";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Track your learning progress, complete tasks, and interact with AI tutors on the Nova AI gamified learning platform." />
      </Helmet>

      <div className="flex flex-col gap-6">
        {/* Premium Welcome Section */}
        <section>
          <PremiumCard
            variant="glass-strong"
            className="p-8 overflow-hidden"
            glow={true}
            animate={false}
          >
            {/* Static background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/20 via-blue-500/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-xl"></div>

            <PremiumCardContent className="relative z-10 p-0">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="md:w-2/3">
                  <h2 className="font-display text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    Ace Your Exams with AI, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Student'}!</span>
                  </h2>

                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    Access AI tutors, educational content, and personalized learning tools with our premium platform.
                  </p>

                  <div>
                    <WelcomeMessage user={user} />
                  </div>

                  <div className="mt-6 flex gap-4">
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
                  </div>
                </div>

                <div className="flex items-center justify-center md:w-1/3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                    <NovaLogo size="xl" className="relative z-10" />
                  </div>
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </section>

        {/* Subject Overview */}
        <div>
          <SubjectOverview />
        </div>

        {/* AI Tutors Section */}
        <div>
          <AITutors />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
