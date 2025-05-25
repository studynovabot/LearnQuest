import { Helmet } from 'react-helmet';
import XpStore from "@/components/store/XpStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const Store = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>XP Store | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Shop for themes, titles, and rewards with your earned XP in the Nova AI store. Complete learning tasks to earn more XP!" />
      </Helmet>

      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-card py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Nova AI Store</CardTitle>
                  <CardDescription className="mt-2">
                    Use your earned XP to unlock special items and features
                  </CardDescription>
                </div>

                <div className="bg-primary/10 rounded-xl px-6 py-3 border border-primary/30">
                  <div className="text-sm text-muted-foreground">Your XP Balance:</div>
                  <div className="text-2xl font-bold text-primary">{user?.xp || 0} XP</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="themes">Themes</TabsTrigger>
                  <TabsTrigger value="titles">Titles</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <XpStore />
                  </motion.div>
                </TabsContent>

                <TabsContent value="themes" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <XpStore />
                  </motion.div>
                </TabsContent>

                <TabsContent value="titles" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <XpStore />
                  </motion.div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 bg-muted/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">How to Earn More XP</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-card rounded-lg p-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h4 className="font-medium mb-2">Complete Daily Tasks</h4>
                    <p className="text-sm text-muted-foreground">Finish your daily learning tasks and receive up to 320 XP per day</p>
                  </div>

                  <div className="bg-card rounded-lg p-4">
                    <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h4 className="font-medium mb-2">Maintain Your Streak</h4>
                    <p className="text-sm text-muted-foreground">Log in daily and keep your streak going to earn bonus XP rewards</p>
                  </div>

                  <div className="bg-card rounded-lg p-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h4 className="font-medium mb-2">Get Great Answers</h4>
                    <p className="text-sm text-muted-foreground">Quality answers in chat earn up to 30 XP based on accuracy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Store;
