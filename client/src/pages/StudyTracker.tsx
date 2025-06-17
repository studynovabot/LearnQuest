import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config';
import StudySessionTracker from '@/components/study/StudySessionTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, BarChart, BookOpen, Target, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  date: string;
  progress: number;
}

interface SubjectSummary {
  subject: string;
  totalTime: number;
  sessions: number;
  lastStudied: string;
}

const StudyTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tracker');
  
  // Fetch user's study sessions
  useEffect(() => {
    const fetchStudySessions = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${config.apiUrl}/user-activity?action=history&activityType=study_session&limit=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch study sessions: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.activities) {
          // Convert API response to StudySession format
          const sessions: StudySession[] = data.activities.map((activity: any, index: number) => ({
            id: activity.id || `session-${index}`,
            subject: activity.subject || 'General',
            topic: activity.topic || `${activity.subject || 'General'} study`,
            duration: activity.duration || 30,
            date: activity.timestamp,
            progress: activity.progress || 100
          }));
          
          setRecentSessions(sessions);
          
          // Generate subject summaries
          const summaries: Record<string, SubjectSummary> = {};
          
          sessions.forEach(session => {
            if (!summaries[session.subject]) {
              summaries[session.subject] = {
                subject: session.subject,
                totalTime: 0,
                sessions: 0,
                lastStudied: session.date
              };
            }
            
            summaries[session.subject].totalTime += session.duration;
            summaries[session.subject].sessions += 1;
            
            // Update last studied date if this session is more recent
            const sessionDate = new Date(session.date);
            const lastStudiedDate = new Date(summaries[session.subject].lastStudied);
            
            if (sessionDate > lastStudiedDate) {
              summaries[session.subject].lastStudied = session.date;
            }
          });
          
          setSubjectSummaries(Object.values(summaries));
        } else {
          console.log('No study sessions found or empty response');
        }
      } catch (err) {
        console.error('Error fetching study sessions:', err);
        setError('Failed to load study sessions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudySessions();
  }, [user?.id]);
  
  // Handle session completion
  const handleSessionComplete = (sessionData: any) => {
    // Add the new session to the list
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subject: sessionData.subject,
      topic: sessionData.topic,
      duration: sessionData.duration,
      date: sessionData.endTime,
      progress: Math.min(100, Math.round(sessionData.duration / 30 * 100))
    };
    
    setRecentSessions(prev => [newSession, ...prev]);
    
    // Update subject summaries
    setSubjectSummaries(prev => {
      const updatedSummaries = [...prev];
      const existingIndex = updatedSummaries.findIndex(s => s.subject === sessionData.subject);
      
      if (existingIndex >= 0) {
        // Update existing subject
        updatedSummaries[existingIndex] = {
          ...updatedSummaries[existingIndex],
          totalTime: updatedSummaries[existingIndex].totalTime + sessionData.duration,
          sessions: updatedSummaries[existingIndex].sessions + 1,
          lastStudied: sessionData.endTime
        };
      } else {
        // Add new subject
        updatedSummaries.push({
          subject: sessionData.subject,
          totalTime: sessionData.duration,
          sessions: 1,
          lastStudied: sessionData.endTime
        });
      }
      
      return updatedSummaries;
    });
    
    // Switch to history tab
    setActiveTab('history');
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time (minutes to hours and minutes)
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Clock className="h-8 w-8" />
        Study Tracker
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Stats</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracker" className="space-y-4">
          <StudySessionTracker onSessionComplete={handleSessionComplete} />
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Study Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Pomodoro Technique</h3>
                <p className="text-sm text-muted-foreground">
                  Study for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Active Recall</h3>
                <p className="text-sm text-muted-foreground">
                  Test yourself on the material instead of passively re-reading. This strengthens memory and understanding.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Spaced Repetition</h3>
                <p className="text-sm text-muted-foreground">
                  Review material at increasing intervals to improve long-term retention.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Study Sessions
              </CardTitle>
              <CardDescription>
                Your most recent study sessions and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading your study sessions...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                  <p className="text-muted-foreground mb-2">Failed to load your study sessions</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-muted-foreground/20 rounded-lg">
                  <Clock className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No study sessions recorded yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Track your first study session to see it here</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('tracker')}
                  >
                    Start Tracking
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{session.subject}</h3>
                        <p className="text-sm text-muted-foreground">{session.topic}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(session.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatTime(session.duration)}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${session.progress}%` }}
                            />
                          </div>
                          <span>{session.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Study Statistics
              </CardTitle>
              <CardDescription>
                Summary of your study habits and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading your study statistics...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                  <p className="text-muted-foreground mb-2">Failed to load your study statistics</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              ) : subjectSummaries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-muted-foreground/20 rounded-lg">
                  <BarChart className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No study data available yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Complete study sessions to see your statistics</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('tracker')}
                  >
                    Start Tracking
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Study Time</h3>
                          <p className="text-3xl font-bold">
                            {formatTime(subjectSummaries.reduce((total, subject) => total + subject.totalTime, 0))}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Sessions</h3>
                          <p className="text-3xl font-bold">
                            {subjectSummaries.reduce((total, subject) => total + subject.sessions, 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Subjects Studied</h3>
                          <p className="text-3xl font-bold">
                            {subjectSummaries.length}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <h3 className="font-medium text-lg mt-6 mb-4">Time by Subject</h3>
                  <div className="space-y-4">
                    {subjectSummaries
                      .sort((a, b) => b.totalTime - a.totalTime)
                      .map((subject) => (
                        <div key={subject.subject} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{subject.subject}</span>
                            <span>{formatTime(subject.totalTime)}</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (subject.totalTime / (subjectSummaries.reduce((max, s) => Math.max(max, s.totalTime), 0) || 1)) * 100)}%` 
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{subject.sessions} sessions</span>
                            <span>Last: {formatDate(subject.lastStudied)}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyTracker;