import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SparklesIcon, BrainIcon, TrendingUpIcon, AlertTriangleIcon, MessageIcon, TargetIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

  // Sample data based on user performance
  const sampleWeakAreas: WeakArea[] = [
    {
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      accuracy: 45,
      lastAttempt: '2 days ago',
      recommendedActions: [
        'Practice more word problems',
        'Review factorization methods',
        'Watch tutorial videos'
      ]
    },
    {
      subject: 'Science',
      topic: 'Chemical Bonding',
      accuracy: 60,
      lastAttempt: '1 week ago',
      recommendedActions: [
        'Study ionic vs covalent bonds',
        'Practice Lewis structures',
        'Take practice quiz'
      ]
    }
  ];

  const sampleRecommendations: StudyRecommendation[] = [
    {
      id: '1',
      title: 'Focus on Algebra Fundamentals',
      description: 'Your recent performance shows gaps in basic algebraic operations. Strengthening these will improve your overall math scores.',
      priority: 'high',
      estimatedTime: 30,
      type: 'practice'
    },
    {
      id: '2',
      title: 'Review Photosynthesis Process',
      description: 'You scored well on plant nutrition but missed some photosynthesis details. A quick review will solidify your understanding.',
      priority: 'medium',
      estimatedTime: 15,
      type: 'review'
    },
    {
      id: '3',
      title: 'Explore Advanced Physics Concepts',
      description: 'You\'re excelling in basic physics. Ready to tackle more advanced topics like electromagnetic induction?',
      priority: 'low',
      estimatedTime: 45,
      type: 'learn'
    }
  ];

  const sampleInsights: PersonalizedInsight[] = [
    {
      type: 'strength',
      title: 'Strong in Visual Learning',
      description: 'You perform 23% better when concepts include diagrams and visual aids.',
      actionable: true
    },
    {
      type: 'weakness',
      title: 'Struggles with Time Management',
      description: 'You tend to spend too much time on easier questions, leaving less time for challenging ones.',
      actionable: true
    },
    {
      type: 'improvement',
      title: 'Math Performance Trending Up',
      description: 'Your math scores have improved by 15% over the last month. Keep up the great work!',
      actionable: false
    },
    {
      type: 'goal',
      title: 'Target: 85% in Science',
      description: 'You\'re currently at 78% in Science. Focus on weak areas to reach your 85% goal.',
      actionable: true
    }
  ];

  useEffect(() => {
    setWeakAreas(sampleWeakAreas);
    setRecommendations(sampleRecommendations);
    setInsights(sampleInsights);
    setOverallProgress(72);
    
    // Add welcome message
    setChatHistory([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.displayName || 'there'}! 👋 I'm your personalized AI study assistant. I've analyzed your learning patterns and I'm here to help you excel in your studies. What would you like to work on today?`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

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
          'x-user-id': user?.uid || 'demo-user'
        },
        body: JSON.stringify({
          content: message,
          agentId: '15', // PersonalAI agent
          userId: user?.uid || 'demo-user',
          context: {
            weakAreas,
            recommendations,
            insights,
            overallProgress
          }
        })
      });

      if (response.ok) {
        const assistantResponse = await response.json();
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <SparklesIcon size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">Your Personal AI Assistant</h1>
          </div>
          <p className="text-muted-foreground">
            Tailored guidance based on your unique learning patterns and performance
          </p>
        </motion.div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon size={24} />
              Overall Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Performance</span>
                <span className="font-semibold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                You're performing well! Focus on weak areas to reach your next milestone.
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="weak-areas">Weak Areas</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* AI Chat */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageIcon size={24} />
                  Chat with Your Personal AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat History */}
                  <div className="h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
                    {chatHistory.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          max-w-[80%] p-3 rounded-lg
                          ${msg.role === 'user' ? 
                            'bg-primary text-primary-foreground' : 
                            'bg-card border'}
                        `}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card border p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about your studies, get personalized advice..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={isLoading}
                    />
                    <Button onClick={sendMessage} disabled={isLoading || !message.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {getInsightIcon(insight.type)}
                        {insight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs">
                          Actionable
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Weak Areas */}
          <TabsContent value="weak-areas">
            <div className="space-y-4">
              {weakAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{area.subject} - {area.topic}</CardTitle>
                        <Badge variant="destructive">{area.accuracy}% accuracy</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Last attempt: {area.lastAttempt}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Recommended Actions:</h4>
                          <ul className="space-y-1">
                            {area.recommendedActions.map((action, actionIndex) => (
                              <li key={actionIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button size="sm" className="w-full">
                          Start Improvement Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations">
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            {rec.estimatedTime} min
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {rec.description}
                      </p>
                      <Button size="sm" className="w-full">
                        Start {rec.type === 'practice' ? 'Practice' : rec.type === 'review' ? 'Review' : 'Learning'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PersonalizedAgent;
