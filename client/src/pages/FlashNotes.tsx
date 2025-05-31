import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "@/components/ui/premium-card";
import { PremiumSelect } from "@/components/ui/premium-form";
import { GradientButton, GlassButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlashlightIcon, ClockIcon, BookOpenIcon, CheckCircleIcon, SparklesIcon, PlayIcon, PauseIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
              <FlashlightIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Flash Notes
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Quick 10-15 minute revision notes for efficient studying
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full"
          >
            <SparklesIcon size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-blue-500">AI-Enhanced Quick Revision</span>
          </motion.div>
        </motion.div>

        {/* Premium Study Session Modal */}
        <AnimatePresence>
          {isStudying && currentNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <PremiumCard variant="glass" className="max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-premium">
                  <PremiumCardHeader>
                    <div className="flex items-center justify-between">
                      <PremiumCardTitle className="text-2xl flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <FlashlightIcon size={24} className="text-blue-500" />
                        </div>
                        {currentNote.title}
                      </PremiumCardTitle>
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                        <ClockIcon size={20} className="text-primary" />
                        <span className="text-lg font-mono text-primary">{formatTime(timeRemaining)}</span>
                      </div>
                    </div>
                  </PremiumCardHeader>

                  <PremiumCardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Study Progress</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={progress} className="h-3" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"
                             style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <PremiumCard variant="glass" className="p-4 bg-muted/20">
                      <p className="text-muted-foreground leading-relaxed">{currentNote.content}</p>
                    </PremiumCard>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <SparklesIcon size={18} className="text-primary" />
                        Key Points:
                      </h3>
                      <div className="space-y-3">
                        {currentNote.keyPoints.map((point, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg"
                          >
                            <CheckCircleIcon size={16} className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{point}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <GradientButton
                        gradient="primary"
                        onClick={completeStudySession}
                        className="flex-1"
                        size="lg"
                      >
                        <CheckCircleIcon size={18} className="mr-2" />
                        Complete Session
                      </GradientButton>
                      <GlassButton
                        onClick={() => setIsStudying(false)}
                        className="flex-1"
                        size="lg"
                      >
                        <PauseIcon size={18} className="mr-2" />
                        Pause
                      </GlassButton>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard variant="glass" glow={true}>
            <PremiumCardHeader>
              <PremiumCardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BookOpenIcon size={20} className="text-purple-500" />
                </div>
                Find Flash Notes
              </PremiumCardTitle>
              <PremiumCardDescription>
                Filter by class and subject to find the perfect study material
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PremiumSelect
                  label="Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { value: "", label: "All Classes" },
                    ...classes.map(cls => ({ value: cls, label: `Class ${cls}` }))
                  ]}
                  variant="glass"
                />

                <PremiumSelect
                  label="Subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  options={[
                    { value: "", label: "All Subjects" },
                    ...subjects.map(subject => ({ value: subject, label: subject }))
                  ]}
                  variant="glass"
                />

                <div className="flex items-end">
                  <GlassButton
                    onClick={() => {
                      setSelectedClass('');
                      setSelectedSubject('');
                      setSelectedChapter('');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </GlassButton>
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Premium Flash Notes Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="h-full"
            >
              <PremiumCard variant="glass" className="h-full hover:shadow-premium transition-shadow duration-200">
                <PremiumCardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <PremiumCardTitle className="text-lg flex items-center gap-2">
                        <FlashlightIcon size={18} className="text-primary" />
                        {note.title}
                      </PremiumCardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-primary/10 rounded-md text-xs">Class {note.class}</span>
                        <span className="px-2 py-1 bg-blue-500/10 rounded-md text-xs">{note.subject}</span>
                      </div>
                    </div>
                    <Badge className={cn(
                      "capitalize",
                      note.difficulty === 'easy' && "bg-green-500/20 text-green-500 border-green-500/20",
                      note.difficulty === 'medium' && "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
                      note.difficulty === 'hard' && "bg-red-500/20 text-red-500 border-red-500/20"
                    )}>
                      {note.difficulty}
                    </Badge>
                  </div>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <PremiumCard variant="glass" className="p-3 mb-4 bg-muted/20">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {note.content}
                    </p>
                  </PremiumCard>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded-md">
                      <ClockIcon size={14} className="text-blue-500" />
                      <span className="text-xs text-blue-500 font-medium">{note.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 rounded-md">
                      <BookOpenIcon size={14} className="text-purple-500" />
                      <span className="text-xs text-purple-500 font-medium">{note.chapter}</span>
                    </div>
                  </div>

                  <GradientButton
                    gradient="primary"
                    onClick={() => startStudySession(note)}
                    className="w-full shadow-glow"
                    disabled={isStudying}
                    size="lg"
                  >
                    <PlayIcon size={16} className="mr-2" />
                    {isStudying ? 'Session Active' : 'Start Studying'}
                  </GradientButton>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          ))}
        </motion.div>

        {filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <PremiumCard variant="glass" className="text-center py-12">
              <PremiumCardContent>
                <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-6">
                  <FlashlightIcon size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">No Flash Notes Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or check back later for new content.
                </p>
                <GlassButton
                  onClick={() => {
                    setSelectedClass('');
                    setSelectedSubject('');
                    setSelectedChapter('');
                  }}
                >
                  <SparklesIcon size={16} className="mr-2" />
                  Reset Filters
                </GlassButton>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default FlashNotes;
