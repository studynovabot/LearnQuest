import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  BookOpen, 
  Brain, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Flame, 
  GraduationCap, 
  LineChart, 
  ListTodo, 
  Loader2, 
  PieChart, 
  PlusCircle,
  Target, 
  TrendingUp 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { PremiumCard } from "@/components/premium/PremiumCard";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  date: string;
  progress: number; // 0-100
}

interface StudyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  dueDate: string;
}

interface SubjectProgress {
  subject: string;
  progress: number;
  color: string;
}

const PersonalizedDashboard = () => {
  const [activeTab, setActiveTab] = useState("progress");
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data for study sessions
  const studySessions: StudySession[] = [
    {
      id: "1",
      subject: "Mathematics",
      topic: "Calculus - Derivatives",
      duration: 45,
      date: "2023-06-15",
      progress: 85
    },
    {
      id: "2",
      subject: "Physics",
      topic: "Mechanics - Newton's Laws",
      duration: 60,
      date: "2023-06-14",
      progress: 70
    },
    {
      id: "3",
      subject: "Chemistry",
      topic: "Organic Chemistry - Functional Groups",
      duration: 30,
      date: "2023-06-13",
      progress: 60
    }
  ];

  // Mock data for study goals
  const studyGoals: StudyGoal[] = [
    {
      id: "1",
      title: "Complete Calculus Review",
      target: 10,
      current: 7,
      unit: "chapters",
      dueDate: "2023-06-30"
    },
    {
      id: "2",
      title: "Physics Problem Sets",
      target: 50,
      current: 32,
      unit: "problems",
      dueDate: "2023-06-25"
    },
    {
      id: "3",
      title: "Chemistry Lab Reports",
      target: 5,
      current: 3,
      unit: "reports",
      dueDate: "2023-07-05"
    }
  ];

  // Mock data for subject progress
  const subjectProgress: SubjectProgress[] = [
    { subject: "Mathematics", progress: 78, color: "bg-blue-500" },
    { subject: "Physics", progress: 65, color: "bg-green-500" },
    { subject: "Chemistry", progress: 42, color: "bg-red-500" },
    { subject: "Biology", progress: 89, color: "bg-purple-500" },
    { subject: "History", progress: 55, color: "bg-amber-500" }
  ];

  // Calculate total study time
  const totalStudyTime = studySessions.reduce((total, session) => total + session.duration, 0);
  
  // Calculate average progress
  const averageProgress = Math.round(
    subjectProgress.reduce((sum, subject) => sum + subject.progress, 0) / subjectProgress.length
  );

  const handleStartSession = () => {
    toast({
      title: "Study session started",
      description: "Your study session timer has started. Good luck!",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <PremiumCard className="h-full">
      <CardHeader className="px-8 pt-8 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <GraduationCap className="h-6 w-6 text-primary" />
          Study Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8 p-1">
            <TabsTrigger value="progress" className="flex items-center gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2 py-3">
              <Clock className="h-4 w-4" />
              <span>Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2 py-3">
              <Target className="h-4 w-4" />
              <span>Goals</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress">
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-muted/30 rounded-xl p-6 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-3">
                    <Brain className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold">{averageProgress}%</span>
                  <span className="text-sm text-muted-foreground mt-1">Overall Progress</span>
                </div>
                
                <div className="bg-muted/30 rounded-xl p-6 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold">{totalStudyTime}</span>
                  <span className="text-sm text-muted-foreground mt-1">Minutes Studied</span>
                </div>
                
                <div className="bg-muted/30 rounded-xl p-6 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-3">
                    <Flame className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold">7</span>
                  <span className="text-sm text-muted-foreground mt-1">Day Streak</span>
                </div>
              </div>
              
              {/* Subject Progress */}
              <div>
                <h3 className="text-lg font-medium mb-4">Subject Progress</h3>
                <div className="space-y-5">
                  {subjectProgress.map((subject) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span>{subject.subject}</span>
                        <span className="text-muted-foreground">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className={subject.color} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recommended Actions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Recommended Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start py-5 px-4 rounded-xl">
                    <BookOpen className="h-5 w-5 mr-3 text-primary" />
                    Review Chemistry
                  </Button>
                  <Button variant="outline" className="justify-start py-5 px-4 rounded-xl">
                    <ListTodo className="h-5 w-5 mr-3 text-primary" />
                    Practice Physics Problems
                  </Button>
                  <Button variant="outline" className="justify-start py-5 px-4 rounded-xl">
                    <Calendar className="h-5 w-5 mr-3 text-primary" />
                    Schedule Math Session
                  </Button>
                  <Button variant="outline" className="justify-start py-5 px-4 rounded-xl">
                    <TrendingUp className="h-5 w-5 mr-3 text-primary" />
                    Track Your Progress
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Recent Study Sessions</h3>
                <Button size="sm" onClick={handleStartSession} className="py-5 px-6 rounded-xl">
                  <Clock className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              </div>
              
              {studySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/50 rounded-xl bg-muted/20">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-base text-muted-foreground mb-4">No study sessions recorded yet</p>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleStartSession}
                    className="py-5 px-6 rounded-xl"
                  >
                    Start Your First Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {studySessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border border-border/50 rounded-xl bg-card/50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-lg">{session.topic}</h4>
                          <p className="text-base text-muted-foreground">{session.subject}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-medium">{session.duration} min</span>
                          <p className="text-sm text-muted-foreground">{formatDate(session.date)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} className="h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-center mt-6">
                <Button variant="outline" size="lg" className="py-5 px-6 rounded-xl">
                  View All Sessions
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="goals">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Study Goals</h3>
                <Button size="sm" variant="outline" className="py-5 px-6 rounded-xl">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
              
              {studyGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/50 rounded-xl bg-muted/20">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-base text-muted-foreground mb-4">No study goals set yet</p>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="py-5 px-6 rounded-xl"
                  >
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {studyGoals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border border-border/50 rounded-xl bg-card/50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-lg">{goal.title}</h4>
                          <div className="flex items-center mt-2">
                            <span className="text-base">
                              {goal.current} of {goal.target} {goal.unit}
                            </span>
                            {goal.current >= goal.target && (
                              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">Due {formatDate(goal.dueDate)}</span>
                          <p className="text-sm font-medium mt-1">
                            {calculateDaysRemaining(goal.dueDate)} days left
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                        </div>
                        <Progress value={Math.round((goal.current / goal.target) * 100)} className="h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-center mt-6">
                <Button variant="outline" size="lg" className="py-5 px-6 rounded-xl">
                  View All Goals
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </PremiumCard>
  );
};

export default PersonalizedDashboard;