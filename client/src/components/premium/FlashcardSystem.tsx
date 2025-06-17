import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/context/UserContext';
import FeatureAccess from '@/components/subscription/FeatureAccess';
import { 
  BookOpen, Brain, Plus, RefreshCw, Save, 
  ChevronLeft, ChevronRight, Sparkles, Lock, 
  CheckCircle, XCircle, Zap, Award
} from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  confidence: number;
}

const FlashcardSystem: React.FC = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const isPremium = user?.isPro || false;
  
  // State for flashcard creation
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for flashcard review
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsCreatedToday, setCardsCreatedToday] = useState(3); // For free tier limit tracking
  
  // Mock flashcards data
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      front: 'What is the Pythagorean theorem?',
      back: 'In a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²',
      subject: 'Mathematics',
      difficulty: 'medium',
      lastReviewed: new Date(Date.now() - 86400000), // 1 day ago
      confidence: 70
    },
    {
      id: '2',
      front: 'Define Newton\'s First Law of Motion',
      back: 'An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, unless acted upon by an external force.',
      subject: 'Physics',
      difficulty: 'medium',
      lastReviewed: new Date(Date.now() - 172800000), // 2 days ago
      confidence: 60
    },
    {
      id: '3',
      front: 'What is photosynthesis?',
      back: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water, generating oxygen as a byproduct.',
      subject: 'Biology',
      difficulty: 'hard',
      lastReviewed: new Date(Date.now() - 259200000), // 3 days ago
      confidence: 50
    },
    {
      id: '4',
      front: 'What are the main types of chemical bonds?',
      back: 'The main types of chemical bonds are ionic bonds, covalent bonds, and metallic bonds. Hydrogen bonds and van der Waals forces are important intermolecular forces.',
      subject: 'Chemistry',
      difficulty: 'hard',
      lastReviewed: new Date(Date.now() - 345600000), // 4 days ago
      confidence: 40
    },
    {
      id: '5',
      front: 'What is the difference between metaphor and simile?',
      back: 'A metaphor directly states that one thing is another, while a simile compares two things using "like" or "as".',
      subject: 'English',
      difficulty: 'easy',
      lastReviewed: new Date(Date.now() - 432000000), // 5 days ago
      confidence: 80
    }
  ]);
  
  // Function to create a new flashcard
  const createFlashcard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in both sides of the flashcard.',
        variant: 'destructive'
      });
      return;
    }
    
    // Check if free user has reached daily limit
    if (!isPremium && cardsCreatedToday >= 5) {
      toast({
        title: 'Daily limit reached',
        description: 'Free users can only create 5 flashcards per day. Upgrade to Premium for unlimited flashcards!',
        variant: 'destructive'
      });
      return;
    }
    
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
      subject,
      difficulty,
      lastReviewed: new Date(),
      confidence: 0
    };
    
    setFlashcards([...flashcards, newCard]);
    setNewCardFront('');
    setNewCardBack('');
    setCardsCreatedToday(cardsCreatedToday + 1);
    
    toast({
      title: 'Flashcard created',
      description: 'Your new flashcard has been added to your collection.',
    });
  };
  
  // Function to generate flashcard content with AI
  const generateFlashcard = () => {
    if (!isPremium) {
      toast({
        title: 'Premium feature',
        description: 'AI-generated flashcards are a premium feature. Upgrade to unlock!',
        variant: 'destructive'
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock AI-generated content
      const aiGeneratedContent = {
        front: 'What is the law of conservation of energy?',
        back: 'The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another. The total energy of an isolated system remains constant over time.'
      };
      
      setNewCardFront(aiGeneratedContent.front);
      setNewCardBack(aiGeneratedContent.back);
      setIsGenerating(false);
      
      toast({
        title: 'AI generation complete',
        description: 'Your flashcard content has been generated. You can edit it before saving.',
      });
    }, 1500);
  };
  
  // Functions for flashcard review
  const flipCard = () => setIsFlipped(!isFlipped);
  
  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((currentCardIndex + 1) % flashcards.length);
  };
  
  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((currentCardIndex - 1 + flashcards.length) % flashcards.length);
  };
  
  // Function to rate confidence in a flashcard
  const rateConfidence = (rating: number) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentCardIndex] = {
      ...updatedFlashcards[currentCardIndex],
      confidence: rating,
      lastReviewed: new Date()
    };
    
    setFlashcards(updatedFlashcards);
    nextCard();
    
    toast({
      title: 'Progress saved',
      description: 'Your confidence rating has been recorded.',
    });
  };
  
  // Calculate study stats
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(card => card.confidence >= 80).length;
  const reviewDueCards = flashcards.filter(card => card.confidence < 70).length;
  const masteryPercentage = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          StudyFlex Flashcards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="review">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="review" className="space-y-4">
            {flashcards.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${flashcards[currentCardIndex].difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                        flashcards[currentCardIndex].difficulty === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}
                    `}
                  >
                    {flashcards[currentCardIndex].difficulty}
                  </Badge>
                </div>
                
                <div 
                  className="relative w-full h-64 cursor-pointer"
                  onClick={flipCard}
                >
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={isFlipped ? 'back' : 'front'}
                      initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 backface-hidden"
                    >
                      <div className="w-full h-full flex flex-col justify-center items-center p-6 border rounded-xl bg-card text-center">
                        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                          {isFlipped ? 'Answer' : 'Question'} • {flashcards[currentCardIndex].subject}
                        </Badge>
                        <p className="text-lg">
                          {isFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          {isFlipped ? 'Click to see question' : 'Click to see answer'}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={prevCard}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {isFlipped && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                        onClick={() => rateConfidence(30)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Hard
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800"
                        onClick={() => rateConfidence(60)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        onClick={() => rateConfidence(90)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Easy
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={nextCard}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first flashcard to start studying
                </p>
                <Button onClick={() => document.getElementById('create-tab')?.click()}>
                  Create Flashcard
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Question (Front)</label>
                  {!isPremium && (
                    <span className="text-xs text-muted-foreground">
                      {cardsCreatedToday}/5 today
                    </span>
                  )}
                </div>
                <Textarea
                  placeholder="Enter your question..."
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Answer (Back)</label>
                <Textarea
                  placeholder="Enter the answer..."
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select 
                    value={difficulty} 
                    onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={createFlashcard}
                  className="flex-1"
                  disabled={!newCardFront.trim() || !newCardBack.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flashcard
                </Button>
                
                <FeatureAccess featureKey="unlimited_flashcards">
                  <Button 
                    variant="outline" 
                    onClick={generateFlashcard}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </FeatureAccess>
              </div>
              
              {!isPremium && cardsCreatedToday >= 5 && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-2">
                  <div className="flex items-start">
                    <Lock className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-300">Daily limit reached</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Free users can create up to 5 flashcards per day. Upgrade to Premium for unlimited flashcards!
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <h4 className="text-2xl font-bold">{totalCards}</h4>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-green-600">{masteredCards}</h4>
                  <p className="text-sm text-muted-foreground">Mastered</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-amber-600">{reviewDueCards}</h4>
                  <p className="text-sm text-muted-foreground">Need Review</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Mastery Progress</h4>
                  <span className="text-sm">{masteryPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={masteryPercentage} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Subject Breakdown</h4>
                
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'].map(subj => {
                  const subjectCards = flashcards.filter(card => card.subject === subj);
                  const subjectTotal = subjectCards.length;
                  const subjectMastered = subjectCards.filter(card => card.confidence >= 80).length;
                  const subjectPercentage = subjectTotal > 0 ? (subjectMastered / subjectTotal) * 100 : 0;
                  
                  return (
                    <div key={subj} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{subj}</span>
                        <span>{subjectMastered}/{subjectTotal} cards</span>
                      </div>
                      <Progress value={subjectPercentage} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
              
              <FeatureAccess featureKey="unlimited_flashcards">
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-primary" />
                    AI Study Recommendations
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <Award className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                      <span>Focus on Physics flashcards - your weakest subject (40% mastery)</span>
                    </div>
                    <div className="flex items-start">
                      <Award className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                      <span>Review Chemistry cards at least twice this week</span>
                    </div>
                    <div className="flex items-start">
                      <Award className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                      <span>Create more Biology flashcards to improve coverage</span>
                    </div>
                  </div>
                </div>
              </FeatureAccess>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FlashcardSystem;