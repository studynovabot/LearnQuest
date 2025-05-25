import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpenIcon, SearchIcon, FileTextIcon, CheckCircleIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NCERTQuestion {
  id: string;
  questionNumber: string;
  question: string;
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];
}

interface NCERTChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subject: string;
  class: string;
  questions: NCERTQuestion[];
  totalQuestions: number;
}

const NCERTSolutions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chapters, setChapters] = useState<NCERTChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<NCERTChapter | null>(null);
  const [loading, setLoading] = useState(false);

  // Sample data
  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  
  const sampleChapters: NCERTChapter[] = [
    {
      id: '1',
      chapterNumber: 1,
      title: 'Rational Numbers',
      subject: 'Mathematics',
      class: '8',
      totalQuestions: 15,
      questions: [
        {
          id: 'q1',
          questionNumber: '1.1',
          question: 'Using appropriate properties find: (a) -2/3 × 3/5 + 5/2 - 3/5 × 1/6',
          solution: 'Step 1: Group the terms with common factors\n-2/3 × 3/5 + 5/2 - 3/5 × 1/6\n= 3/5 × (-2/3 - 1/6) + 5/2\n\nStep 2: Solve the bracket\n-2/3 - 1/6 = -4/6 - 1/6 = -5/6\n\nStep 3: Continue calculation\n= 3/5 × (-5/6) + 5/2\n= -15/30 + 5/2\n= -1/2 + 5/2\n= 4/2 = 2',
          difficulty: 'medium',
          concepts: ['Rational Numbers', 'Properties of Operations', 'Fractions']
        },
        {
          id: 'q2',
          questionNumber: '1.2',
          question: 'Write the additive inverse of each of the following: (a) 2/8 (b) -5/9 (c) -6/-5',
          solution: 'The additive inverse of a rational number a/b is -a/b such that a/b + (-a/b) = 0\n\n(a) Additive inverse of 2/8 = -2/8 = -1/4\n(b) Additive inverse of -5/9 = 5/9\n(c) First simplify -6/-5 = 6/5\n    Additive inverse of 6/5 = -6/5',
          difficulty: 'easy',
          concepts: ['Additive Inverse', 'Rational Numbers']
        }
      ]
    },
    {
      id: '2',
      chapterNumber: 7,
      title: 'Nutrition in Plants',
      subject: 'Science',
      class: '7',
      totalQuestions: 12,
      questions: [
        {
          id: 'q1',
          questionNumber: '7.1',
          question: 'Why do organisms need to take food?',
          solution: 'Organisms need to take food for the following reasons:\n\n1. Energy: Food provides energy for all life processes like growth, movement, and reproduction.\n\n2. Growth and Repair: Food contains nutrients that help in building new cells and repairing damaged tissues.\n\n3. Protection: Some nutrients help protect the body from diseases and infections.\n\n4. Regulation: Food helps in regulating various body functions and maintaining proper metabolism.',
          difficulty: 'easy',
          concepts: ['Nutrition', 'Life Processes', 'Energy']
        }
      ]
    }
  ];

  useEffect(() => {
    setChapters(sampleChapters);
  }, []);

  const filteredChapters = chapters.filter(chapter => {
    const matchesClass = !selectedClass || chapter.class === selectedClass;
    const matchesSubject = !selectedSubject || chapter.subject === selectedSubject;
    const matchesSearch = !searchQuery || 
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.questions.some(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.solution.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesClass && matchesSubject && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleChapterSelect = (chapter: NCERTChapter) => {
    setSelectedChapter(chapter);
  };

  return (
    <>
      <Helmet>
        <title>NCERT Solutions | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Complete NCERT solutions for all classes and subjects with detailed explanations and step-by-step solutions." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpenIcon size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">NCERT Solutions</h1>
          </div>
          <p className="text-muted-foreground">
            Complete solutions for all NCERT textbook questions with detailed explanations
          </p>
        </motion.div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Find Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div className="relative">
                <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedClass('');
                  setSelectedSubject('');
                  setSearchQuery('');
                  setSelectedChapter(null);
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chapters List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredChapters.map((chapter) => (
                    <motion.div
                      key={chapter.id}
                      whileHover={{ x: 5 }}
                      className={`
                        p-3 rounded-lg cursor-pointer border transition-colors
                        ${selectedChapter?.id === chapter.id ? 
                          'bg-primary/10 border-primary' : 
                          'hover:bg-muted border-transparent'}
                      `}
                      onClick={() => handleChapterSelect(chapter)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Class {chapter.class} • {chapter.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {chapter.totalQuestions} questions
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solutions Display */}
          <div className="lg:col-span-2">
            {selectedChapter ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Class {selectedChapter.class} • {selectedChapter.subject}
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    {selectedChapter.questions.map((question) => (
                      <AccordionItem key={question.id} value={question.id}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-3 w-full">
                            <Badge variant="outline" className="flex-shrink-0">
                              Q{question.questionNumber}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{question.question}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty}
                                </Badge>
                                <div className="flex gap-1">
                                  {question.concepts.slice(0, 2).map((concept, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {concept}
                                    </Badge>
                                  ))}
                                  {question.concepts.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{question.concepts.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CheckCircleIcon size={16} className="text-green-500" />
                              Solution:
                            </h4>
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <pre className="whitespace-pre-wrap text-sm font-mono">
                                {question.solution}
                              </pre>
                            </div>
                            
                            <div className="mt-4">
                              <h5 className="font-medium mb-2">Key Concepts:</h5>
                              <div className="flex flex-wrap gap-2">
                                {question.concepts.map((concept, index) => (
                                  <Badge key={index} variant="outline">
                                    {concept}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileTextIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Chapter</h3>
                  <p className="text-muted-foreground">
                    Choose a chapter from the left panel to view its NCERT solutions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {filteredChapters.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpenIcon size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Solutions Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query to find relevant NCERT solutions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default NCERTSolutions;
