import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/config';
import { Clock, Play, Pause, Check, RotateCcw, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StudySessionTrackerProps {
  onSessionComplete?: (sessionData: any) => void;
}

const StudySessionTracker = ({ onSessionComplete }: StudySessionTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start study session
  const startSession = () => {
    if (!subject) {
      toast({
        title: 'Subject Required',
        description: 'Please select a subject before starting a study session.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsActive(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
    
    toast({
      title: 'Study Session Started',
      description: `You're now studying ${subject}${topic ? ` - ${topic}` : ''}. Keep it up!`,
    });
  };
  
  // Pause study session
  const pauseSession = () => {
    setIsPaused(true);
    
    toast({
      title: 'Session Paused',
      description: 'Your study session has been paused. Resume when you\'re ready.',
    });
  };
  
  // Resume study session
  const resumeSession = () => {
    setIsPaused(false);
    
    toast({
      title: 'Session Resumed',
      description: 'Your study session has been resumed. Keep going!',
    });
  };
  
  // End study session
  const endSession = async () => {
    if (time < 60) {
      toast({
        title: 'Session Too Short',
        description: 'Study sessions should be at least 1 minute long to be recorded.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsActive(false);
    setIsPaused(false);
    
    // Calculate session duration in minutes
    const durationMinutes = Math.round(time / 60);
    
    // Create session data
    const sessionData = {
      subject,
      topic: topic || `${subject} study`,
      duration: durationMinutes,
      startTime: sessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
    };
    
    // Track the study session
    if (user?.id) {
      try {
        const response = await fetch(`${config.apiUrl}/user-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          },
          body: JSON.stringify({
            activityType: 'study_session',
            activityData: {
              subject,
              topic: topic || `${subject} study`,
              duration: durationMinutes,
              timestamp: new Date().toISOString(),
              description: `Completed a ${durationMinutes}-minute study session on ${subject}`,
              progress: Math.min(100, Math.round(durationMinutes / 30 * 100)) // Progress based on duration (30 min = 100%)
            }
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          toast({
            title: 'Study Session Completed',
            description: `You studied for ${durationMinutes} minutes and earned ${result.pointsEarned || durationMinutes} study points!`,
          });
          
          // Call the callback if provided
          if (onSessionComplete) {
            onSessionComplete(sessionData);
          }
        } else {
          console.error('Failed to track study session:', await response.text());
          toast({
            title: 'Session Recorded Locally',
            description: 'Your session was saved locally, but we couldn\'t update your profile.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error tracking study session:', error);
        toast({
          title: 'Session Recorded Locally',
          description: 'Your session was saved locally, but we couldn\'t update your profile.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Session Completed',
        description: `You studied for ${durationMinutes} minutes. Sign in to track your progress!`,
      });
    }
    
    // Reset the form
    setTime(0);
    setSessionStartTime(null);
  };
  
  // Reset the session
  const resetSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(0);
    setSessionStartTime(null);
    
    toast({
      title: 'Session Reset',
      description: 'Your study session has been reset.',
    });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Study Session Tracker
        </CardTitle>
        <CardDescription>
          Track your study time to earn points and improve your learning analytics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isActive ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Economics">Economics</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                placeholder="E.g., Calculus, Newton's Laws, etc."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={startSession}
              disabled={!subject}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Study Session
            </Button>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <div className="text-4xl font-bold mb-2">{formatTime(time)}</div>
              <div className="text-sm text-muted-foreground mb-4">
                {subject} {topic ? `- ${topic}` : ''}
              </div>
              
              <Progress 
                value={Math.min(100, (time / (30 * 60)) * 100)} 
                className="mb-6" 
              />
              
              <div className="flex justify-center gap-2">
                {isPaused ? (
                  <Button onClick={resumeSession}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseSession}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button variant="outline" onClick={resetSession}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                
                <Button variant="default" onClick={endSession}>
                  <Check className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudySessionTracker;