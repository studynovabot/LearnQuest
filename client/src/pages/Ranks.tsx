import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { PremiumButton } from '@/components/premium/PremiumButton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { 
  Award, 
  BookOpen, 
  Brain, 
  Crown, 
  Gift, 
  Lightbulb, 
  Medal, 
  Star, 
  Target, 
  Trophy, 
  Users, 
  Zap,
  MessageSquare,
  Flame,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Ranks = () => {
  const { user } = useAuth();
  
  // Mock user data
  const userData = {
    points: 750,
    rank: "Dedicated Scholar",
    level: 3,
    nextRankPoints: 1000,
    nextRank: "Subject Expert"
  };
  
  // Define all ranks
  const ranks = [
    { 
      name: "Novice Learner", 
      level: 1, 
      icon: <BookOpen className="h-10 w-10" />, 
      color: "blue", 
      pointsRequired: 0,
      benefits: [
        "Access to AI tutors",
        "Basic study tools",
        "Community access"
      ],
      description: "Just starting your learning journey. Complete activities to earn points and level up!"
    },
    { 
      name: "Knowledge Seeker", 
      level: 2, 
      icon: <Brain className="h-10 w-10" />, 
      color: "indigo", 
      pointsRequired: 100,
      benefits: [
        "All previous benefits",
        "Daily challenges",
        "Basic achievement badges"
      ],
      description: "You're actively seeking knowledge and building your foundation. Keep going!"
    },
    { 
      name: "Dedicated Scholar", 
      level: 3, 
      icon: <Target className="h-10 w-10" />, 
      color: "purple", 
      pointsRequired: 500,
      benefits: [
        "All previous benefits",
        "Advanced study tools",
        "Personalized study plans"
      ],
      description: "Your dedication to learning is impressive. You're making great progress!"
    },
    { 
      name: "Subject Expert", 
      level: 4, 
      icon: <Medal className="h-10 w-10" />, 
      color: "amber", 
      pointsRequired: 1000,
      benefits: [
        "All previous benefits",
        "Expert badges",
        "Answer highlighting"
      ],
      description: "You've developed expertise in your subjects and can help others with your knowledge."
    },
    { 
      name: "Master Mentor", 
      level: 5, 
      icon: <Users className="h-10 w-10" />, 
      color: "emerald", 
      pointsRequired: 2500,
      benefits: [
        "All previous benefits",
        "Mentor badge",
        "Community recognition"
      ],
      description: "You're not just learning, but helping others learn too. Your contributions are valuable!"
    },
    { 
      name: "Knowledge Champion", 
      level: 6, 
      icon: <Trophy className="h-10 w-10" />, 
      color: "orange", 
      pointsRequired: 5000,
      benefits: [
        "All previous benefits",
        "Champion profile badge",
        "Special community privileges"
      ],
      description: "You've achieved mastery in multiple subjects and are a pillar of the learning community."
    },
    { 
      name: "Learning Legend", 
      level: 7, 
      icon: <Crown className="h-10 w-10" />, 
      color: "rose", 
      pointsRequired: 10000,
      benefits: [
        "All previous benefits",
        "Legendary status",
        "Exclusive features"
      ],
      description: "The pinnacle of achievement. You've demonstrated exceptional dedication to learning and helping others."
    },
  ];
  
  // Calculate progress percentage to next rank
  const progressPercentage = Math.min(Math.round((userData.points / userData.nextRankPoints) * 100), 100);
  
  // Find current rank index
  const currentRankIndex = ranks.findIndex(rank => rank.name === userData.rank);
  
  return (
    <>
      <Helmet>
        <title>Ranks & Achievements | StudyNova AI</title>
        <meta name="description" content="Learn about the ranking system, earn points, and track your progress on StudyNova AI." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Subtle Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-40 right-40 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute bottom-40 left-40 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Ranks & Achievements
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Earn points by learning, helping others, and completing challenges. Level up your rank and unlock new benefits!
            </p>
          </motion.section>
          
          {/* Current Rank */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <PremiumCard className="p-10 overflow-hidden relative">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-32 h-32 rounded-2xl mb-4",
                    `bg-${ranks[currentRankIndex].color}-100 dark:bg-${ranks[currentRankIndex].color}-900/30 text-${ranks[currentRankIndex].color}-600 dark:text-${ranks[currentRankIndex].color}-400`
                  )}>
                    {ranks[currentRankIndex].icon}
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-1">{userData.rank}</h2>
                    <div className="flex justify-center mb-2">
                      {Array.from({ length: userData.level }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-muted-foreground">Level {userData.level}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Your Progress</h3>
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {userData.points} Points
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    {ranks[currentRankIndex].description}
                  </p>
                  
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Current: {userData.rank}</span>
                      <span className="text-sm text-muted-foreground">Next: {userData.nextRank}</span>
                    </div>
                    
                    <Progress value={progressPercentage} className="h-3 bg-muted/50" />
                    
                    <div className="flex justify-between mt-2 text-sm">
                      <span>{userData.points} points</span>
                      <span>{userData.nextRankPoints} points</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-4 rounded-xl bg-muted/30">
                      <Zap className="h-5 w-5 text-amber-500 mr-3" />
                      <span>Answer questions to earn points</span>
                    </div>
                    <div className="flex items-center p-4 rounded-xl bg-muted/30">
                      <Target className="h-5 w-5 text-emerald-500 mr-3" />
                      <span>Complete daily challenges</span>
                    </div>
                    <div className="flex items-center p-4 rounded-xl bg-muted/30">
                      <Lightbulb className="h-5 w-5 text-blue-500 mr-3" />
                      <span>Study regularly to maintain streaks</span>
                    </div>
                    <div className="flex items-center p-4 rounded-xl bg-muted/30">
                      <Gift className="h-5 w-5 text-purple-500 mr-3" />
                      <span>Earn badges for achievements</span>
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.section>
          
          {/* Rank Levels */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-10">
              Rank Levels
            </h2>
            
            <div className="space-y-8">
              {ranks.map((rank, index) => (
                <motion.div
                  key={rank.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <PremiumCard className={cn(
                    "p-8 overflow-hidden",
                    rank.name === userData.rank && "border-primary/30 bg-primary/5"
                  )}>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      <div className="flex items-center md:items-start gap-6">
                        <div className={cn(
                          "flex items-center justify-center w-20 h-20 rounded-xl flex-shrink-0",
                          `bg-${rank.color}-100 dark:bg-${rank.color}-900/30 text-${rank.color}-600 dark:text-${rank.color}-400`
                        )}>
                          {rank.icon}
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-bold mr-3">{rank.name}</h3>
                            <div className="flex">
                              {Array.from({ length: rank.level }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-4">
                            <span className="text-sm font-medium mr-4">Level {rank.level}</span>
                            <span className="text-sm text-muted-foreground">{rank.pointsRequired} points required</span>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">
                            {rank.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-muted/30 rounded-xl p-6">
                        <h4 className="font-semibold mb-4 flex items-center">
                          <Award className="h-5 w-5 mr-2 text-primary" />
                          Rank Benefits
                        </h4>
                        
                        <ul className="space-y-2">
                          {rank.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {rank.name === userData.rank && (
                      <div className="mt-6 flex items-center text-primary text-sm font-medium">
                        <Star className="h-4 w-4 mr-1 fill-primary" />
                        Your Current Rank
                      </div>
                    )}
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* How to Earn Points */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <PremiumCard className="p-10">
              <h2 className="text-3xl font-display font-bold text-foreground mb-8">
                How to Earn Points
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Answer Questions",
                    description: "Help other students by answering their questions",
                    icon: <MessageSquare className="h-8 w-8" />,
                    points: "10-25 points per answer",
                    color: "blue"
                  },
                  {
                    title: "Daily Challenges",
                    description: "Complete daily learning challenges and tasks",
                    icon: <Target className="h-8 w-8" />,
                    points: "15-50 points per challenge",
                    color: "purple"
                  },
                  {
                    title: "Learning Streaks",
                    description: "Maintain consistent daily learning streaks",
                    icon: <Flame className="h-8 w-8" />,
                    points: "10 points per day",
                    color: "amber"
                  },
                  {
                    title: "Study Sessions",
                    description: "Complete focused study sessions with AI tutors",
                    icon: <Clock className="h-8 w-8" />,
                    points: "5 points per 15 minutes",
                    color: "emerald"
                  },
                  {
                    title: "Share Resources",
                    description: "Share helpful study materials with the community",
                    icon: <Gift className="h-8 w-8" />,
                    points: "20 points per resource",
                    color: "rose"
                  },
                  {
                    title: "Receive Upvotes",
                    description: "Get upvotes on your helpful answers and contributions",
                    icon: <Award className="h-8 w-8" />,
                    points: "5 points per upvote",
                    color: "indigo"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="border border-border/40 rounded-xl p-6"
                  >
                    <div className={cn(
                      "flex items-center justify-center w-16 h-16 rounded-xl mb-4",
                      `bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400`
                    )}>
                      {item.icon}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    
                    <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium w-fit">
                      <Zap className="h-4 w-4 mr-1" />
                      {item.points}
                    </div>
                  </motion.div>
                ))}
              </div>
            </PremiumCard>
          </motion.section>
          
          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-6">
              Ready to Level Up?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start earning points today by learning, helping others, and completing challenges!
            </p>
            <PremiumButton variant="gradient" size="lg" className="px-10 py-6 rounded-xl text-lg">
              <Zap className="h-5 w-5 mr-2" />
              Start Earning Points
            </PremiumButton>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default Ranks;