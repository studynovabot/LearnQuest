import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlashlightIcon, ClockIcon, BookOpenIcon, CheckCircleIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FlashNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  class: string;
  chapter: string;
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  keyPoints: string[];
}

const FlashNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [flashNotes, setFlashNotes] = useState<FlashNote[]>([]);
  const [currentNote, setCurrentNote] = useState<FlashNote | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sample data - replace with API calls
  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  
  const sampleFlashNotes: FlashNote[] = [
    {
      id: '1',
      title: 'Algebra Basics',
      content: 'Quick revision of algebraic expressions, equations, and basic operations.',
      subject: 'Mathematics',
      class: '8',
      chapter: 'Algebra',
      estimatedTime: 10,
      difficulty: 'easy',
      keyPoints: [
        'Variables and constants',
        'Like and unlike terms',
        'Addition and subtraction of algebraic expressions',
        'Solving simple equations'
      ]
    },
    {
      id: '2',
      title: 'Photosynthesis Process',
      content: 'Essential concepts of photosynthesis in plants.',
      subject: 'Science',
      class: '7',
      chapter: 'Nutrition in Plants',
      estimatedTime: 15,
      difficulty: 'medium',
      keyPoints: [
        'Chlorophyll and its role',
        'Raw materials needed',
        'Products formed',
        'Importance of sunlight'
      ]
    }
  ];

  useEffect(() => {
    setFlashNotes(sampleFlashNotes);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (currentNote) {
            setProgress(((currentNote.estimatedTime * 60 - newTime) / (currentNote.estimatedTime * 60)) * 100);
          }
          if (newTime === 0) {
            completeStudySession();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying, timeRemaining, currentNote]);

  const startStudySession = (note: FlashNote) => {
    setCurrentNote(note);
    setTimeRemaining(note.estimatedTime * 60); // Convert to seconds
    setProgress(0);
    setIsStudying(true);
  };

  const completeStudySession = () => {
    setIsStudying(false);
    setProgress(100);
    toast({
      title: "Study Session Complete! 🎉",
      description: `You've completed the ${currentNote?.title} flash notes. Great job!`,
    });
    // Award XP here
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredNotes = flashNotes.filter(note => {
    return (!selectedClass || note.class === selectedClass) &&
           (!selectedSubject || note.subject === selectedSubject) &&
           (!selectedChapter || note.chapter.toLowerCase().includes(selectedChapter.toLowerCase()));
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <Helmet>
        <title>Flash Notes | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Quick 10-15 minute revision notes for all subjects and chapters. Perfect for last-minute study sessions." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FlashlightIcon size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">Flash Notes</h1>
          </div>
          <p className="text-muted-foreground">
            Quick 10-15 minute revision notes for efficient studying
          </p>
        </motion.div>

        {/* Study Session Modal */}
        <AnimatePresence>
          {isStudying && currentNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{currentNote.title}</h2>
                  <div className="flex items-center gap-2">
                    <ClockIcon size={20} />
                    <span className="text-lg font-mono">{formatTime(timeRemaining)}</span>
                  </div>
                </div>

                <Progress value={progress} className="mb-6" />

                <div className="space-y-4">
                  <p className="text-muted-foreground">{currentNote.content}</p>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Key Points:</h3>
                    <ul className="space-y-2">
                      {currentNote.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircleIcon size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={completeStudySession} className="flex-1">
                    Complete Session
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsStudying(false)}
                    className="flex-1"
                  >
                    Pause
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Find Flash Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedClass('');
                    setSelectedSubject('');
                    setSelectedChapter('');
                  }}
                  className="flex-1"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flash Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Class {note.class} • {note.subject}
                      </p>
                    </div>
                    <Badge className={getDifficultyColor(note.difficulty)}>
                      {note.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {note.content}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ClockIcon size={16} />
                      <span>{note.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpenIcon size={16} />
                      <span>{note.chapter}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => startStudySession(note)}
                    className="w-full"
                    disabled={isStudying}
                  >
                    Start Studying
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FlashlightIcon size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Flash Notes Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new content.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default FlashNotes;
