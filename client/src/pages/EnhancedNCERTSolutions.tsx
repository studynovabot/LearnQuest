import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  Search, 
  BookOpen, 
  Brain,
  Crown,
  Lock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Star,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Solution {
  id: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  totalQuestions: number;
  uploadedAt: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isAvailable: boolean;
  requiredTier: 'free' | 'pro' | 'goat';
  hasAIHelp: boolean;
}

interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  questionNumber: number;
  confidence: number;
  tags: string[];
}

interface SolutionDetail {
  id: string;
  metadata: {
    board: string;
    class: string;
    subject: string;
    chapter: string;
    totalQuestions: number;
    uploadedAt: string;
  };
  questions: QuestionAnswer[];
}

interface UserAccess {
  tier: 'free' | 'pro' | 'goat';
  hasAccess: boolean;
  canUseAI: boolean;
}

const EnhancedNCERTSolutions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for solutions listing
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User data
  const userTier = (user?.subscriptionPlan || 'free') as 'free' | 'pro' | 'goat';
  
  // State for filters
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  
  // State for solution viewing
  const [selectedSolution, setSelectedSolution] = useState<SolutionDetail | null>(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [isSolutionDialogOpen, setIsSolutionDialogOpen] = useState(false);
  
  // State for AI help
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionAnswer | null>(null);
  
  // State for upgrade prompt
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Fetch solutions data
  const fetchSolutions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        ...(boardFilter && boardFilter !== 'all' && { board: boardFilter }),
        ...(classFilter && classFilter !== 'all' && { class: classFilter }),
        ...(subjectFilter && subjectFilter !== 'all' && { subject: subjectFilter }),
      });

      const response = await fetch(`${config.apiUrl}/enhanced-ncert-solutions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'X-User-Tier': userTier,
          'X-User-Id': user?.id || 'anonymous'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSolutions(data.solutions || []);
      
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch solutions');
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load specific solution
  const loadSolution = async (solutionId: string) => {
    setSolutionLoading(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/enhanced-ncert-solutions?action=get-solution&id=${solutionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'X-User-Tier': userTier,
          'X-User-Id': user?.id || 'anonymous'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(errorData.message || 'Failed to load solution');
      }

      const data = await response.json();
      setSelectedSolution(data.solution);
      setIsSolutionDialogOpen(true);

    } catch (err) {
      console.error('Error loading solution:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load solution",
        variant: "destructive",
      });
    } finally {
      setSolutionLoading(false);
    }
  };

  // Get AI help for a question
  const getAIHelp = async (question: QuestionAnswer) => {
    if (userTier === 'free') {
      setShowUpgradePrompt(true);
      return;
    }

    setSelectedQuestion(question);
    setAiQuery(`Explain this question in detail: ${question.question}`);
    setIsAIHelpOpen(true);
  };

  // Submit AI help request
  const submitAIHelp = async () => {
    if (!aiQuery.trim() || !selectedQuestion || !selectedSolution) return;

    setAiLoading(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/enhanced-ncert-solutions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'X-User-Tier': userTier,
          'X-User-Id': user?.id || 'anonymous'
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          solutionId: selectedSolution.id,
          query: aiQuery,
          context: {
            board: selectedSolution.metadata.board,
            class: selectedSolution.metadata.class,
            subject: selectedSolution.metadata.subject,
            chapter: selectedSolution.metadata.chapter,
            question: selectedQuestion.question,
            answer: selectedQuestion.answer
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(errorData.message || 'AI Help failed');
      }

      const data = await response.json();
      setAiResponse(data.response);

    } catch (err) {
      console.error('Error getting AI help:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "AI Help failed",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!search.trim()) {
      fetchSolutions();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/enhanced-ncert-solutions?action=search&q=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'X-User-Tier': userTier,
          'X-User-Id': user?.id || 'anonymous'
        },
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSolutions(data.results.map((result: any) => ({
        ...result,
        isAvailable: true,
        hasAIHelp: true,
        requiredTier: 'pro'
      })));

    } catch (err) {
      console.error('Search error:', err);
      toast({
        title: "Search Error",
        description: "Failed to search solutions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSolutions();
  }, []);
  
  // Fetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchSolutions();
    }
  }, [boardFilter, classFilter, subjectFilter]);

  // Get tier badge
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'goat':
        return (
          <Badge className="bg-purple-600">
            <Crown className="w-3 h-3 mr-1" />
            GOAT
          </Badge>
        );
      case 'pro':
        return (
          <Badge className="bg-blue-600">
            <Star className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500">
            <Lock className="w-3 h-3 mr-1" />
            FREE
          </Badge>
        );
    }
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-600">Easy</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Medium</Badge>;
      case 'hard':
        return <Badge className="bg-red-600">Hard</Badge>;
      default:
        return <Badge variant="outline">Medium</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Enhanced NCERT Solutions - LearnQuest</title>
        <meta name="description" content="Access comprehensive NCERT solutions with AI-powered explanations for Pro and Goat users." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <Brain className="h-6 w-6 text-purple-600" />
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Enhanced NCERT Solutions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive solutions with AI-powered explanations for Pro & Goat users
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-500">Your tier:</span>
              {getTierBadge(userTier)}
              {userTier === 'free' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowUpgradePrompt(true)}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find Solutions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Search bar */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Search solutions, chapters, topics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter selects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={boardFilter} onValueChange={setBoardFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Boards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Boards</SelectItem>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="NCERT">NCERT</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {[6, 7, 8, 9, 10, 11, 12].map(num => (
                      <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading solutions...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* No Solutions */}
          {!loading && !error && solutions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Solutions Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your filters or search terms.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Solutions Grid */}
          {!loading && !error && solutions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map((solution) => (
                <Card key={solution.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">
                        {solution.chapter}
                      </CardTitle>
                      {getTierBadge(solution.requiredTier)}
                    </div>
                    <CardDescription>
                      {solution.board} • Class {solution.class} • {solution.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {getDifficultyBadge(solution.difficulty)}
                        {solution.hasAIHelp && (
                          <Badge variant="outline" className="text-purple-600">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Help
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {solution.totalQuestions} Questions
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>Uploaded: {new Date(solution.uploadedAt).toLocaleDateString()}</p>
                    </div>

                    <Button 
                      onClick={() => loadSolution(solution.id)}
                      disabled={solutionLoading}
                      className="w-full"
                      variant={userTier === 'free' && solution.requiredTier !== 'free' ? "outline" : "default"}
                    >
                      {userTier === 'free' && solution.requiredTier !== 'free' ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Upgrade to Access
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Solutions
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Solution Detail Dialog */}
          <Dialog open={isSolutionDialogOpen} onOpenChange={setIsSolutionDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{selectedSolution?.metadata.chapter}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedSolution?.metadata.board} • Class {selectedSolution?.metadata.class} • {selectedSolution?.metadata.subject}
                </DialogDescription>
              </DialogHeader>

              {selectedSolution && (
                <div className="space-y-6">
                  
                  {/* Solution Info */}
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Solution Information</AlertTitle>
                    <AlertDescription>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div><strong>Total Questions:</strong> {selectedSolution.questions.length}</div>
                        <div><strong>AI Help Available:</strong> {userTier !== 'free' ? 'Yes' : 'Upgrade Required'}</div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Questions and Answers */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Questions & Solutions</h3>
                    
                    {selectedSolution.questions.map((question, index) => (
                      <Card key={question.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline">Q{question.questionNumber}</Badge>
                            <div className="flex space-x-2">
                              <Badge className="bg-green-100 text-green-800">
                                {Math.round(question.confidence * 100)}% Confidence
                              </Badge>
                              {userTier !== 'free' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => getAIHelp(question)}
                                >
                                  <Brain className="h-3 w-3 mr-1" />
                                  AI Help
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Question:
                              </h4>
                              <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                {question.question}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Solution:
                              </h4>
                              <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                {question.answer}
                              </p>
                            </div>

                            {question.tags && question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {question.tags.map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  onClick={() => {
                    setIsSolutionDialogOpen(false);
                    setSelectedSolution(null);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* AI Help Dialog */}
          <Dialog open={isAIHelpOpen} onOpenChange={setIsAIHelpOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI-Powered Help</span>
                  <Badge className="bg-purple-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Feature
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Get detailed AI explanations for better understanding
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedQuestion && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Question</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">
                      {selectedQuestion.question}
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ask AI for help:
                  </label>
                  <Textarea
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask for detailed explanation, examples, or clarification..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {aiResponse && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      AI Response:
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                      <div className="whitespace-pre-wrap text-sm">
                        {aiResponse}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAIHelpOpen(false);
                    setAiQuery('');
                    setAiResponse('');
                    setSelectedQuestion(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={submitAIHelp}
                  disabled={aiLoading || !aiQuery.trim()}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting AI Help...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Get AI Help
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Upgrade Prompt Dialog */}
          <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <span>Upgrade Required</span>
                </DialogTitle>
                <DialogDescription>
                  Access to NCERT Solutions and AI Help requires a Pro or Goat subscription
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Pro Features Include:</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Access to all NCERT Solutions</li>
                      <li>AI-powered explanations</li>
                      <li>Step-by-step solutions</li>
                      <li>Practice questions</li>
                      <li>Priority support</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 text-center">
                    <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Pro Plan</h3>
                    <p className="text-sm text-gray-600">₹299/month</p>
                  </Card>
                  <Card className="p-4 text-center border-purple-200">
                    <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Goat Plan</h3>
                    <p className="text-sm text-gray-600">₹599/month</p>
                  </Card>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradePrompt(false)}
                >
                  Maybe Later
                </Button>
                <Button onClick={() => window.location.href = '/pricing'}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default EnhancedNCERTSolutions;