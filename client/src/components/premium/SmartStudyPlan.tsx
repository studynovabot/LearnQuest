import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useUserContext } from "@/context/UserContext";
import FeatureAccess from "@/components/subscription/FeatureAccess";
import { 
  Calendar, BookOpen, Clock, Brain, Trophy, Rocket, 
  Target, CheckCircle, AlertTriangle, Zap, Award
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
  selected: boolean;
  progress: number;
  weakAreas: string[];
}

interface Task {
  subject: string;
  topic: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
}

interface DayPlan {
  day: string;
  tasks: Task[];
}

const SmartStudyPlan: React.FC = () => {
  const { user } = useUserContext();
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: "Mathematics", selected: true, progress: 65, weakAreas: ["Calculus", "Trigonometry"] },
    { id: 2, name: "Physics", selected: true, progress: 48, weakAreas: ["Mechanics", "Electromagnetism"] },
    { id: 3, name: "Chemistry", selected: false, progress: 72, weakAreas: ["Organic Chemistry"] },
    { id: 4, name: "Biology", selected: false, progress: 80, weakAreas: ["Genetics"] },
    { id: 5, name: "English", selected: true, progress: 85, weakAreas: ["Grammar"] },
    { id: 6, name: "History", selected: false, progress: 60, weakAreas: ["Modern History"] },
    { id: 7, name: "Geography", selected: false, progress: 55, weakAreas: ["Physical Geography"] },
  ]);
  const [examDate, setExamDate] = useState<string>("2023-12-15");
  const [studyHours, setStudyHours] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [planGenerated, setPlanGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Calculate days remaining until exam
  const today = new Date();
  const examDay = new Date(examDate);
  const daysRemaining = Math.max(0, Math.ceil((examDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const toggleSubject = (id: number) => {
    setSubjects(
      subjects.map((subject) =>
        subject.id === id ? { ...subject, selected: !subject.selected } : subject
      )
    );
  };
  
  const generatePlan = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setPlanGenerated(true);
      setIsGenerating(false);
    }, 1500);
  };
  
  // Mock data for the study plan
  const weeklyPlan: DayPlan[] = [
    {
      day: "Monday",
      tasks: [
        { subject: "Mathematics", topic: "Calculus Practice", duration: 90, priority: "high" },
        { subject: "Physics", topic: "Mechanics Problems", duration: 60, priority: "medium" },
        { subject: "English", topic: "Grammar Exercises", duration: 30, priority: "low" },
      ]
    },
    {
      day: "Tuesday",
      tasks: [
        { subject: "Mathematics", topic: "Trigonometry Review", duration: 60, priority: "high" },
        { subject: "Physics", topic: "Electromagnetism Concepts", duration: 90, priority: "high" },
        { subject: "English", topic: "Reading Comprehension", duration: 30, priority: "medium" },
      ]
    },
    {
      day: "Wednesday",
      tasks: [
        { subject: "Mathematics", topic: "Practice Test", duration: 120, priority: "medium" },
        { subject: "Physics", topic: "Problem Solving", duration: 60, priority: "medium" },
        { subject: "English", topic: "Essay Writing", duration: 60, priority: "low" },
      ]
    },
    {
      day: "Thursday",
      tasks: [
        { subject: "Mathematics", topic: "Weak Areas Focus", duration: 90, priority: "high" },
        { subject: "Physics", topic: "Theory Review", duration: 60, priority: "medium" },
        { subject: "English", topic: "Vocabulary Building", duration: 30, priority: "low" },
      ]
    },
    {
      day: "Friday",
      tasks: [
        { subject: "Mathematics", topic: "Mock Test", duration: 120, priority: "high" },
        { subject: "Physics", topic: "Revision", duration: 60, priority: "medium" },
        { subject: "English", topic: "Practice Paper", duration: 60, priority: "medium" },
      ]
    },
    {
      day: "Saturday",
      tasks: [
        { subject: "Mathematics", topic: "Full Revision", duration: 120, priority: "medium" },
        { subject: "Physics", topic: "Full Revision", duration: 120, priority: "medium" },
        { subject: "English", topic: "Full Revision", duration: 60, priority: "low" },
      ]
    },
    {
      day: "Sunday",
      tasks: [
        { subject: "All Subjects", topic: "Weekly Review", duration: 120, priority: "high" },
        { subject: "All Subjects", topic: "Weak Areas Focus", duration: 120, priority: "high" },
      ]
    },
  ];
  
  // Calculate predicted score based on current progress and study plan
  const calculatePredictedScore = () => {
    const selectedSubjects = subjects.filter(s => s.selected);
    if (selectedSubjects.length === 0) return 0;
    
    // Average progress across selected subjects
    const avgProgress = selectedSubjects.reduce((sum, s) => sum + s.progress, 0) / selectedSubjects.length;
    
    // Study hours impact (more hours = better score)
    const hoursImpact = Math.min(studyHours * 2, 15);
    
    // Days remaining impact (more days = more improvement potential)
    const daysImpact = Math.min(daysRemaining / 10, 10);
    
    // Calculate predicted improvement
    const improvement = hoursImpact + daysImpact;
    
    // Final predicted score (capped at 100)
    return Math.min(100, avgProgress + improvement);
  };
  
  const predictedScore = calculatePredictedScore();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          Smart Study Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!planGenerated ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="exam-date">Exam Date</Label>
              <div className="flex mt-1.5">
                <Input
                  id="exam-date"
                  type="date"
                  className="rounded-r-none"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
                <Button variant="outline" className="rounded-l-none border-l-0">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {daysRemaining} days remaining until exam
              </p>
            </div>

            <div>
              <Label htmlFor="study-hours">Daily Study Hours</Label>
              <div className="flex mt-1.5">
                <Input
                  id="study-hours"
                  type="number"
                  min="1"
                  max="12"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseInt(e.target.value))}
                  className="rounded-r-none"
                />
                <Button variant="outline" className="rounded-l-none border-l-0">
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select 
                value={difficulty} 
                onValueChange={setDifficulty}
              >
                <SelectTrigger id="difficulty" className="mt-1.5">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subjects</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={subject.selected}
                      onCheckedChange={() => toggleSubject(subject.id)}
                    />
                    <Label
                      htmlFor={`subject-${subject.id}`}
                      className="text-sm font-normal"
                    >
                      {subject.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <FeatureAccess featureKey="smart_study_plan">
              <Button 
                className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600"
                onClick={generatePlan}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating Plan...
                  </>
                ) : (
                  <>Generate Smart Study Plan</>
                )}
              </Button>
            </FeatureAccess>
          </div>
        ) : (
          <FeatureAccess 
            featureKey="smart_study_plan"
            teaser={true}
          >
            <Tabs defaultValue="plan">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="plan">Daily Plan</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plan" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Your Personalized Plan</h3>
                    <p className="text-sm text-muted-foreground">Based on your weak areas and exam date</p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{daysRemaining} days left</span>
                  </Badge>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {weeklyPlan.map((day, index) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{day.day}</h4>
                        <span className="text-xs text-muted-foreground">
                          {day.tasks.reduce((sum, task) => sum + task.duration, 0)} min
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {day.tasks.map((task, taskIndex) => (
                          <div 
                            key={taskIndex}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                          >
                            <div>
                              <div className="flex items-center">
                                <Badge 
                                  variant="outline" 
                                  className={`mr-2 ${
                                    task.subject === 'Mathematics' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                    task.subject === 'Physics' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                                    task.subject === 'English' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                  }`}
                                >
                                  {task.subject}
                                </Badge>
                                <span className="text-sm">{task.topic}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                    task.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  }`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {task.duration} min
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <Button className="w-full">
                  Export Plan to Calendar
                </Button>
              </TabsContent>
              
              <TabsContent value="progress">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Subject Progress</h3>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>Predicted: {predictedScore.toFixed(0)}%</span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {subjects.filter(s => s.selected).map((subject) => (
                      <div key={subject.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{subject.name}</span>
                          <span className="text-sm">{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {subject.weakAreas.map((area, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t mt-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-primary" />
                      Improvement Targets
                    </h3>
                    
                    <div className="space-y-2">
                      {subjects.filter(s => s.selected).map((subject) => (
                        <div key={subject.id} className="flex justify-between items-center text-sm">
                          <span>{subject.name}</span>
                          <span className="font-medium text-green-600">
                            +{Math.min(20, 100 - subject.progress)}% potential
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="insights">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">AI Insights</h3>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span>Personalized</span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-2">
                        <Rocket className="h-4 w-4 mr-2 text-purple-500" />
                        <h4 className="font-medium">Study Strategy</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Focus on your weak areas in Mathematics (Calculus, Trigonometry) and Physics (Mechanics). 
                        Allocate 60% of your study time to these topics for maximum improvement.
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-2">
                        <Target className="h-4 w-4 mr-2 text-amber-500" />
                        <h4 className="font-medium">Time Management</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        With {daysRemaining} days remaining, you should complete 3 full practice tests per week
                        and spend at least 30 minutes daily on revision of previous concepts.
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-2">
                        <Trophy className="h-4 w-4 mr-2 text-emerald-500" />
                        <h4 className="font-medium">Performance Prediction</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on your current progress and study plan, you're on track to score {predictedScore.toFixed(0)}%.
                        Increasing daily study hours to 6 could improve your score by an additional 8-10%.
                      </p>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Generate Detailed Report
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </FeatureAccess>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartStudyPlan;