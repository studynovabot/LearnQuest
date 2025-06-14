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
  Target, 
  TrendingUp 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Study Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Goals</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress">
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary mb-2">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">{averageProgress}%</span>
                  <span className="text-xs text-muted-foreground">Overall Progress</span>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary mb-2">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">{totalStudyTime}</span>
                  <span className="text-xs text-muted-foreground">Minutes Studied</span>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary mb-2">
                    <Flame className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">7</span>
                  <span className="text-xs text-muted-foreground">Day Streak</span>
                </div>
              </div>
              
              {/* Subject Progress */}
              <div>
                <h3 className="text-sm font-medium mb-3">Subject Progress</h3>
                <div className="space-y-3">
                  {subjectProgress.map((subject) => (
                    <div key={subject.subject} className="space-y-1">
                      <div className="flex justify-between text-sm">
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
                <h3 className="text-sm font-medium mb-3">Recommended Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    Review Chemistry
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <ListTodo className="h-4 w-4 mr-2 text-primary" />
                    Practice Physics Problems
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Schedule Math Session
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    Track Your Progress
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Recent Study Sessions</h3>
                <Button size="sm" onClick={handleStartSession}>
                  <Clock className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              </div>
              
              {studySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg">
                  <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No study sessions recorded yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStartSession}
                  >
                    Start Your First Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studySessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{session.topic}</h4>
                          <p className="text-sm text-muted-foreground">{session.subject}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{session.duration} min</span>
                          <p className="text-xs text-muted-foreground">{formatDate(session.date)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm">
                  View All Sessions
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="goals">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Study Goals</h3>
                <Button size="sm" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
              
              {studyGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg">
                  <Target className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No study goals set yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studyGoals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <div className="flex items-center mt-1">
                            <span className="text-sm">
                              {goal.current} of {goal.target} {goal.unit}
                            </span>
                            {goal.current >= goal.target && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Due {formatDate(goal.dueDate)}</span>
                          <p className="text-xs font-medium mt-1">
                            {calculateDaysRemaining(goal.dueDate)} days left
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                        </div>
                        <Progress value={(goal.current / goal.target) * 100} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Helper component for the plus icon
const PlusCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default PersonalizedDashboard;