import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, BookOpen, BarChart, TrendingUp, Award } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import FeatureAccess from '@/components/subscription/FeatureAccess';

interface RankPredictorProps {
  className?: string;
}

const RankPredictor: React.FC<RankPredictorProps> = ({ className }) => {
  const { user } = useUserContext();
  const [studyHours, setStudyHours] = useState<number>(4);
  const [completedTasks, setCompletedTasks] = useState<number>(65);
  const [examDate, setExamDate] = useState<string>('2023-12-15');
  
  // Calculate days remaining until exam
  const today = new Date();
  const examDay = new Date(examDate);
  const daysRemaining = Math.max(0, Math.ceil((examDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate predicted rank (simplified algorithm)
  const calculatePredictedRank = () => {
    // Base rank starts at 10000
    let baseRank = 10000;
    
    // Study hours impact: more hours = better rank
    const hoursImpact = Math.min(studyHours * 200, 2000);
    
    // Task completion impact: higher % = better rank
    const tasksImpact = completedTasks * 50;
    
    // Days remaining impact: closer to exam = more accurate prediction
    const daysImpact = Math.max(0, 1000 - (daysRemaining * 10));
    
    // XP impact: more XP = better rank
    const xpImpact = (user?.xp || 0) * 2;
    
    // Calculate final rank (lower is better)
    let predictedRank = Math.max(1, Math.floor(baseRank - hoursImpact - tasksImpact - daysImpact - xpImpact));
    
    // Ensure rank is within reasonable bounds
    return Math.min(10000, Math.max(1, predictedRank));
  };
  
  const predictedRank = calculatePredictedRank();
  
  // Calculate percentile (inverted from rank)
  const percentile = 100 - (predictedRank / 10000 * 100);
  
  // Subject-wise percentiles (mock data)
  const subjectPercentiles = [
    { name: 'Mathematics', percentile: Math.min(99.5, percentile + 5) },
    { name: 'Physics', percentile: Math.max(50, percentile - 10) },
    { name: 'Chemistry', percentile: Math.min(99, percentile + 2) },
    { name: 'Biology', percentile: percentile - 5 },
    { name: 'English', percentile: percentile + 8 },
  ];
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold flex items-center">
          <Trophy className="h-6 w-6 mr-3 text-amber-500" />
          AIR Rank Simulator
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <FeatureAccess 
          featureKey="rank_predictor"
          teaser={true}
          blurIntensity={3}
        >
          <div className="space-y-6">
            {/* Input section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="exam-date">Exam Date</Label>
                <Input 
                  id="exam-date" 
                  type="date" 
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {daysRemaining} days remaining
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="study-hours">Daily Study Hours</Label>
                  <span className="text-sm font-medium">{studyHours} hours</span>
                </div>
                <Slider
                  id="study-hours"
                  min={1}
                  max={12}
                  step={0.5}
                  value={[studyHours]}
                  onValueChange={(value) => setStudyHours(value[0])}
                  className="my-2"
                />
                <p className="text-sm text-muted-foreground flex items-center">
                  <BookOpen size={14} className="mr-1" />
                  {studyHours < 4 ? 'Increase study time for better results' : 
                   studyHours < 8 ? 'Good study routine' : 
                   'Excellent dedication!'}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="completed-tasks">Tasks Completed (%)</Label>
                  <span className="text-sm font-medium">{completedTasks}%</span>
                </div>
                <Slider
                  id="completed-tasks"
                  min={0}
                  max={100}
                  step={5}
                  value={[completedTasks]}
                  onValueChange={(value) => setCompletedTasks(value[0])}
                  className="my-2"
                />
                <Progress value={completedTasks} className="h-2" />
              </div>
            </div>
            
            {/* Results section */}
            <div className="pt-4 border-t">
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">Predicted All India Rank</div>
                <div className="text-4xl font-bold text-amber-500">{predictedRank.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Top {percentile.toFixed(2)}% of all students
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center">
                  <BarChart size={16} className="mr-2 text-indigo-500" />
                  Subject-wise Percentile
                </h4>
                
                {subjectPercentiles.map((subject) => (
                  <div key={subject.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{subject.name}</span>
                      <span className="font-medium">{subject.percentile.toFixed(1)}%</span>
                    </div>
                    <Progress value={subject.percentile} className="h-1.5" />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium flex items-center">
                    <TrendingUp size={16} className="mr-2 text-emerald-500" />
                    Improvement Potential
                  </h4>
                  <div className="text-sm font-medium text-emerald-500">+{Math.floor(1000 - predictedRank/10)} ranks</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mr-2">
                      <span className="text-emerald-500 text-xs">✓</span>
                    </div>
                    <span>Increase daily study hours by 1-2 hours</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mr-2">
                      <span className="text-emerald-500 text-xs">✓</span>
                    </div>
                    <span>Focus more on Physics (your weakest subject)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mr-2">
                      <span className="text-emerald-500 text-xs">✓</span>
                    </div>
                    <span>Complete at least 85% of assigned tasks</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500">
                  <Award className="mr-2 h-4 w-4" />
                  Generate Detailed Study Plan
                </Button>
              </div>
            </div>
          </div>
        </FeatureAccess>
      </CardContent>
    </Card>
  );
};

export default RankPredictor;