import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "@/components/ui/premium-card";
import { PremiumChatBubble } from "@/components/ui/premium-chat";
import { PremiumInput } from "@/components/ui/premium-form";
import { GradientButton, GlassButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SparklesIcon, BrainIcon, TrendingUpIcon, AlertTriangleIcon, MessageIcon, TargetIcon, SendIcon, UserIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WeakArea {
  subject: string;
  topic: string;
  accuracy: number;
  lastAttempt: string;
  recommendedActions: string[];
}

interface StudyRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  type: 'practice' | 'review' | 'learn';
}

interface PersonalizedInsight {
  type: 'strength' | 'weakness' | 'improvement' | 'goal';
  title: string;
  description: string;
  actionable: boolean;
}

const PersonalizedAgent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchPersonalizedData = async () => {
      if (!user?.id) return;
      
      setIsDataLoading(true);
      setHasError(false);
      
      try {
        // First, try to seed test data
        const seedResponse = await fetch('/api/seed-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          }
        });

        if (!seedResponse.ok) {
          console.warn('Failed to seed test data:', await seedResponse.json());
        }

        // Fetch general recommendations
        const generalRecommendationsResponse = await fetch('/api/learning-recommendations?type=general', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        if (!generalRecommendationsResponse.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const generalData = await generalRecommendationsResponse.json();
        
        if (generalData.success && generalData.recommendations) {
          interface RecommendationItem {
            type: string;
            title: string;
            description: string;
            priority?: 'high' | 'medium' | 'low';
          }
          
          const transformedRecommendations = (generalData.recommendations as RecommendationItem[])
            .filter((rec: RecommendationItem) => rec.type !== 'streak')
            .map((rec: RecommendationItem) => ({
              id: Math.random().toString(36).substr(2, 9),
              title: rec.title,
              description: rec.description,
              priority: rec.priority || 'medium',
              estimatedTime: 30,
              type: (rec.type === 'knowledge_gap' ? 'practice' :
                    rec.type === 'strength' ? 'learn' : 'review') as 'practice' | 'review' | 'learn'
            }));
          
          setRecommendations(transformedRecommendations);
        }

        // Fetch insights
        const insightsResponse = await fetch('/api/learning-recommendations?type=insights', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        if (!insightsResponse.ok) {
          throw new Error('Failed to fetch insights');
        }
        
        const insightsData = await insightsResponse.json();
        
        if (insightsData.success && insightsData.insights) {
          interface InsightItem {
            type: string;
            title: string;
            description: string;
            actionable?: boolean;
            progress?: number;
          }
          
          const transformedInsights = (insightsData.insights as InsightItem[]).map((insight: InsightItem) => ({
            type: insight.type as 'strength' | 'weakness' | 'improvement' | 'goal',
            title: insight.title,
            description: insight.description,
            actionable: insight.actionable || false
          }));
          
          setInsights(transformedInsights);
          
          const progressInsight = (insightsData.insights as InsightItem[]).find((i: InsightItem) => i.type === 'progress');
          if (progressInsight?.progress) {
            setOverallProgress(progressInsight.progress);
          }
        }

        // Fetch weak areas
        const weakAreasResponse = await fetch('/api/learning-recommendations?type=subject&subject=all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        if (!weakAreasResponse.ok) {
          throw new Error('Failed to fetch weak areas');
        }
        
        const weakAreasData = await weakAreasResponse.json();
        
        if (weakAreasData.success && weakAreasData.recommendations) {
          interface WeakAreaItem {
            type: string;
            items: Array<{
              subject: string;
              concept: string;
              mastery: number;
              suggestedAction: string;
            }>;
          }
          
          const transformedWeakAreas = (weakAreasData.recommendations as WeakAreaItem[])
            .filter((rec: WeakAreaItem) => rec.type === 'knowledge_gap')
            .map((rec: WeakAreaItem) => ({
              subject: rec.items[0].subject,
              topic: rec.items[0].concept,
              accuracy: rec.items[0].mastery,
              lastAttempt: 'Recently',
              recommendedActions: rec.items[0].suggestedAction.split(', ')
            }));
          
          setWeakAreas(transformedWeakAreas);
        }

      } catch (error) {
        console.error('Error fetching personalized data:', error);
        setHasError(true);
        toast({
          title: 'Error',
          description: 'Failed to load personalized data. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchPersonalizedData();

    // Add welcome message
    setChatHistory([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.displayName || 'there'}! 👋 I'm your personalized AI study assistant. I've analyzed your learning patterns and I'm here to help you excel in your studies. What would you like to work on today?`,
        timestamp: new Date()
      }
    ]);
  }, [user, toast]);

  // Add loading and error states to the UI
  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your personalized learning data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangleIcon className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to Load Data</h2>
          <p className="text-muted-foreground">There was an error loading your personalized data.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          content: message,
          agentId: '15', // PersonalAI agent
          userId: user?.id || 'demo-user',
          context: {
            weakAreas,
            recommendations,
            insights,
            overallProgress
          }
        })
      }).catch((fetchError) => {
        console.error('PersonalizedAgent fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      });

      if (response.ok) {
        const data = await response.json().catch((jsonError) => {
          console.error('PersonalizedAgent response JSON parse error:', jsonError);
          return { content: 'Sorry, I encountered an error parsing the response. Please try again.' };
        });
        const assistantResponse = {
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: data.content || data.message || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, assistantResponse]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response
      const fallbackResponse = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I understand you want to work on "${message}". Based on your learning patterns, I recommend starting with your weak areas in Mathematics, particularly quadratic equations. Would you like me to create a personalized study plan for this topic?`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <TrendingUpIcon size={16} className="text-green-500" />;
      case 'weakness': return <AlertTriangleIcon size={16} className="text-red-500" />;
      case 'improvement': return <SparklesIcon size={16} className="text-blue-500" />;
      case 'goal': return <TargetIcon size={16} className="text-purple-500" />;
      default: return <BrainIcon size={16} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Personalized Agent | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Your personal AI study assistant that knows your strengths, weaknesses, and learning patterns to provide tailored guidance." />
      </Helmet>

      <div className="space-y-6">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-3 gradient-primary rounded-2xl shadow-glow">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Personal AI Assistant
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Tailored guidance based on your unique learning patterns
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full"
          >
            <BrainIcon size={16} className="text-purple-500" />
            <span className="text-sm font-medium text-purple-500">AI-Powered Personalization</span>
          </motion.div>
        </motion.div>

        {/* Premium Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard variant="glass" glow={true}>
            <PremiumCardHeader>
              <PremiumCardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUpIcon size={24} className="text-green-500" />
                </div>
                Overall Learning Progress
              </PremiumCardTitle>
              <PremiumCardDescription>
                Track your academic performance across all subjects
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Current Performance</span>
                  <span className="font-semibold text-lg">{overallProgress}%</span>
                </div>
                <div className="relative">
                  <Progress value={overallProgress} className="h-4" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full"
                       style={{ width: `${overallProgress}%` }} />
                </div>
                <PremiumCard variant="glass" className="p-3 bg-green-500/5 border-green-500/20">
                  <p className="text-sm text-muted-foreground">
                    🎉 You're performing excellently! Focus on weak areas to reach your next milestone.
                  </p>
                </PremiumCard>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="weak-areas">Weak Areas</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Premium AI Chat */}
          <TabsContent value="chat">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PremiumCard variant="glass" glow={true}>
                <PremiumCardHeader>
                  <PremiumCardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <MessageIcon size={24} className="text-blue-500" />
                    </div>
                    Chat with Your Personal AI
                  </PremiumCardTitle>
                  <PremiumCardDescription>
                    Get personalized study advice based on your learning patterns
                  </PremiumCardDescription>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <div className="space-y-4">
                    {/* Premium Chat History */}
                    <PremiumCard variant="glass" className="h-96 overflow-y-auto p-4 bg-muted/10">
                      <div className="space-y-4">
                        {chatHistory.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <PremiumChatBubble
                              message={msg.content}
                              isUser={msg.role === 'user'}
                              timestamp={msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString() : msg.timestamp}
                              avatar={msg.role === 'user' ? <UserIcon size={16} /> : <SparklesIcon size={16} />}
                            />
                          </motion.div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <PremiumChatBubble
                              message=""
                              isUser={false}
                              isTyping={true}
                              avatar={<SparklesIcon size={16} />}
                            />
                          </div>
                        )}
                      </div>
                    </PremiumCard>

                    {/* Premium Message Input */}
                    <div className="flex gap-3">
                      <PremiumInput
                        placeholder="Ask about your studies, get personalized advice..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        disabled={isLoading}
                        variant="glass"
                        className="flex-1"
                      />
                      <GradientButton
                        gradient="primary"
                        onClick={sendMessage}
                        disabled={isLoading || !message.trim()}
                        className="shadow-glow"
                      >
                        <SendIcon size={16} />
                      </GradientButton>
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </TabsContent>

          {/* Premium Insights */}
          <TabsContent value="insights">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <PremiumCard variant="glass" className="h-full hover:shadow-premium transition-shadow duration-200">
                    <PremiumCardHeader className="pb-3">
                      <PremiumCardTitle className="flex items-center gap-3 text-lg">
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.type === 'strength' && "bg-green-500/20",
                          insight.type === 'weakness' && "bg-red-500/20",
                          insight.type === 'improvement' && "bg-blue-500/20",
                          insight.type === 'goal' && "bg-purple-500/20"
                        )}>
                          {getInsightIcon(insight.type)}
                        </div>
                        {insight.title}
                      </PremiumCardTitle>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <PremiumCard variant="glass" className="p-3 mb-4 bg-muted/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                      </PremiumCard>
                      {insight.actionable && (
                        <Badge className="bg-primary/20 text-primary border-primary/20">
                          ⚡ Actionable Insight
                        </Badge>
                      )}
                    </PremiumCardContent>
                  </PremiumCard>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Premium Weak Areas */}
          <TabsContent value="weak-areas">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {weakAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumCard variant="glass" className="hover:shadow-premium transition-shadow duration-200">
                    <PremiumCardHeader>
                      <div className="flex items-center justify-between">
                        <PremiumCardTitle className="text-lg flex items-center gap-3">
                          <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangleIcon size={20} className="text-red-500" />
                          </div>
                          {area.subject} - {area.topic}
                        </PremiumCardTitle>
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
                          {area.accuracy}% accuracy
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Last attempt: {area.lastAttempt}</p>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <TargetIcon size={16} className="text-primary" />
                            Recommended Actions:
                          </h4>
                          <div className="space-y-2">
                            {area.recommendedActions.map((action, actionIndex) => (
                              <motion.div
                                key={actionIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: actionIndex * 0.1 }}
                                className="flex items-center gap-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg"
                              >
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                <span className="text-sm text-muted-foreground">{action}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        <GradientButton
                          gradient="primary"
                          size="lg"
                          className="w-full shadow-glow"
                        >
                          <TrendingUpIcon size={16} className="mr-2" />
                          Start Improvement Plan
                        </GradientButton>
                      </div>
                    </PremiumCardContent>
                  </PremiumCard>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Premium Recommendations */}
          <TabsContent value="recommendations">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <PremiumCard variant="glass" className="hover:shadow-premium transition-shadow duration-200">
                    <PremiumCardHeader>
                      <div className="flex items-center justify-between">
                        <PremiumCardTitle className="text-lg flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            rec.priority === 'high' && "bg-red-500/20",
                            rec.priority === 'medium' && "bg-yellow-500/20",
                            rec.priority === 'low' && "bg-green-500/20"
                          )}>
                            <SparklesIcon size={20} className={cn(
                              rec.priority === 'high' && "text-red-500",
                              rec.priority === 'medium' && "text-yellow-500",
                              rec.priority === 'low' && "text-green-500"
                            )} />
                          </div>
                          {rec.title}
                        </PremiumCardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "capitalize",
                            rec.priority === 'high' && "bg-red-500/20 text-red-500 border-red-500/20",
                            rec.priority === 'medium' && "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
                            rec.priority === 'low' && "bg-green-500/20 text-green-500 border-green-500/20"
                          )}>
                            {rec.priority} priority
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">
                            {rec.estimatedTime} min
                          </Badge>
                        </div>
                      </div>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <PremiumCard variant="glass" className="p-3 mb-4 bg-muted/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {rec.description}
                        </p>
                      </PremiumCard>
                      <GradientButton
                        gradient={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}
                        size="lg"
                        className="w-full shadow-glow"
                      >
                        <BrainIcon size={16} className="mr-2" />
                        Start {rec.type === 'practice' ? 'Practice' : rec.type === 'review' ? 'Review' : 'Learning'}
                      </GradientButton>
                    </PremiumCardContent>
                  </PremiumCard>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PersonalizedAgent;
