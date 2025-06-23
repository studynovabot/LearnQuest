import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/config';
import QACard from '@/components/QACard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  BookOpen, 
  Brain,
  MoreHorizontal,
  Eye,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Zap,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced interfaces for real solution data
interface QAPair {
  board: string;
  class: string;
  subject: string;
  chapter: string;
  question: string;
  answer: string;
  questionNumber: number;
  extractedAt: string;
  confidence: number;
}

interface ProcessedSolution {
  id: string;
  metadata: {
    board: string;
    class: string;
    subject: string;
    chapter: string;
  };
  qaPairs: QAPair[];
  filename: string;
  totalQuestions: number;
  processedAt: string;
  status: string;
}

interface NCERTSolution {
  id: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  chapterNumber: number;
  exercise: string;
  totalQuestions: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isAvailable: boolean;
  lastUpdated?: string;
  viewCount?: number;
  solutionFile?: string;
  thumbnailImage?: string;
  createdBy?: string;
  aiHelpEnabled?: boolean;
}

interface SolutionContent {
  id: string;
  solutionId: string;
  questionNumber: number;
  question: string;
  solution: string;
  steps: string[];
  hints?: string[];
  relatedConcepts?: string[];
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// New interface for chapter-based navigation
interface ChapterSummary {
  id: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionsBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  lastUpdated: string;
  isAvailable: boolean;
}

interface QuestionDetail {
  id: string;
  questionNumber?: number;
  question: string;
  answer: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  chapter: string;
  board: string;
  class: string;
  subject: string;
}

const NCERTSolutions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // New state structure for funnel approach
  const [viewMode, setViewMode] = useState<'chapters' | 'questions'>('chapters');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  
  // State for chapter summaries and questions
  const [chapterSummaries, setChapterSummaries] = useState<ChapterSummary[]>([]);
  const [chapterQuestions, setChapterQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User data
  const [userData] = useState({
    id: user?.id || 'user123',
    tier: (user?.subscriptionPlan || 'free') as 'free' | 'pro' | 'goat',
    name: user?.displayName || 'User'
  });
  
  // Pagination
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('cbse');
  const [classFilter, setClassFilter] = useState('10');
  const [subjectFilter, setSubjectFilter] = useState('science');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  // Solution management
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetail | null>(null);
  const [isSolutionDialogOpen, setIsSolutionDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [solutionContent, setSolutionContent] = useState<SolutionContent[]>([]);

  // AI help
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Fetch chapter summaries from API
  const fetchChapterSummaries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        ...(boardFilter && { board: boardFilter }),
        ...(classFilter && { class: classFilter }),
        ...(subjectFilter && { subject: subjectFilter }),
        limit: '100' // Get all to group by chapters
      });

      const response = await fetch(`${config.apiUrl}/ncert-solutions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const questions = data.solutions || [];
      
      // Group questions by chapter to create chapter summaries
      const chapterMap = new Map<string, ChapterSummary>();
      
      questions.forEach((q: any) => {
        const chapterKey = `${q.board}_${q.class}_${q.subject}_${q.chapter}`;
        
        if (!chapterMap.has(chapterKey)) {
          chapterMap.set(chapterKey, {
            id: chapterKey,
            board: q.board || 'CBSE',
            class: q.class || '10',
            subject: q.subject || 'Science',
            chapter: q.chapter || 'Unknown Chapter',
            totalQuestions: 0,
            difficulty: 'medium',
            questionsBreakdown: { easy: 0, medium: 0, hard: 0 },
            lastUpdated: q.createdAt || new Date().toISOString(),
            isAvailable: true
          });
        }
        
        const chapter = chapterMap.get(chapterKey)!;
        chapter.totalQuestions++;
        
        // Count difficulty breakdown
        const difficulty = q.difficulty || 'medium';
        if (difficulty in chapter.questionsBreakdown) {
          chapter.questionsBreakdown[difficulty as keyof typeof chapter.questionsBreakdown]++;
        }
      });
      
      const summaries = Array.from(chapterMap.values());
      setChapterSummaries(summaries);
      setPagination(prev => ({
        ...prev,
        total: summaries.length,
        pages: Math.ceil(summaries.length / prev.limit)
      }));
      
    } catch (err) {
      console.error('Error fetching chapter summaries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chapters');
      setChapterSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions for a specific chapter
  const fetchChapterQuestions = async (chapter: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        board: boardFilter,
        class: classFilter,
        subject: subjectFilter,
        limit: '100'
      });

      const response = await fetch(`${config.apiUrl}/ncert-solutions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const allQuestions = data.solutions || [];
      
      // Filter questions for the selected chapter
      const chapterQuestions = allQuestions
        .filter((q: any) => q.chapter === chapter)
        .map((q: any) => ({
          id: q.id,
          questionNumber: q.questionNumber,
          question: q.question,
          answer: q.answer,
          type: q.type || 'concept',
          difficulty: q.difficulty || 'medium',
          chapter: q.chapter,
          board: q.board,
          class: q.class,
          subject: q.subject
        }));
      
      setChapterQuestions(chapterQuestions);
      
    } catch (err) {
      console.error('Error fetching chapter questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      setChapterQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleChapterClick = (chapterName: string) => {
    setSelectedChapter(chapterName);
    setViewMode('questions');
    fetchChapterQuestions(chapterName);
  };

  const handleBackToChapters = () => {
    setViewMode('chapters');
    setSelectedChapter(null);
    setChapterQuestions([]);
  };

  // Action handlers
  const handleViewSolution = (question: QuestionDetail) => {
    setSelectedQuestion(question);
    setIsSolutionDialogOpen(true);
  };

  const handleAIHelp = async (question: QuestionDetail) => {
    if (userData.tier === 'free') {
      toast({
        title: "Premium Feature",
        description: "AI Help is available for Pro and Goat tier users only.",
        variant: "destructive",
      });
      return;
    }

    setSelectedQuestion(question);
    setAiQuery(`Help me understand this question: ${question.question}`);
    setIsAIHelpOpen(true);
    setAiLoading(true);

    // Call AI help API
    try {
      const response = await fetch(`${config.apiUrl}/ai-help`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          context: question.answer,
          subject: question.subject,
          class: question.class
        }),
      });

      const data = await response.json();
      setAiResponse(data.response || 'AI help is not available at the moment.');
    } catch (error) {
      setAiResponse('Failed to get AI help. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Check if user can access AI help
  const canAccessAIHelp = () => {
    const userPlan = userData.tier;
    return userPlan === 'pro' || userPlan === 'goat';
  };

  // Get AI assistance function
  const getAIAssistance = async () => {
    if (!aiQuery.trim() || !selectedQuestion) return;

    setAiLoading(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Help me understand this NCERT question: ${aiQuery}\n\nContext: ${selectedQuestion.question}\nAnswer: ${selectedQuestion.answer}`,
          type: 'help'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }

      const data = await response.json();
      setAiResponse(data.response || data.message || 'AI help is not available at the moment.');

    } catch (err) {
      console.error('Error getting AI help:', err);
      setAiResponse('Failed to get AI help. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };




  // Load solution content
  const loadSolutionContent = async (solution: NCERTSolution) => {
    setContentLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/ncert-solutions/${solution.id}/content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.solution && data.solution.qaPairs) {
        // Convert Q&A pairs to SolutionContent format
        const content: SolutionContent[] = data.solution.qaPairs.map((qa: QAPair, index: number) => ({
          id: `content-${solution.id}-${index + 1}`,
          solutionId: solution.id,
          questionNumber: qa.questionNumber || index + 1,
          question: qa.question,
          solution: qa.answer,
          steps: qa.answer.split('\n').filter(line => line.trim().startsWith('Step')).slice(0, 5) // Extract steps if available
        }));
        
        setSolutionContent(content);
      } else {
        // Fallback to mock data if no Q&A pairs available
        const content: SolutionContent[] = Array.from({ length: solution.totalQuestions }, (_, i) => ({
          id: `content-${solution.id}-${i + 1}`,
          solutionId: solution.id,
          questionNumber: i + 1,
          question: `Question ${i + 1} for ${solution.chapter}`,
          solution: `This solution is being prepared. Please check back later.`,
          steps: [
            `Step 1: Identify the problem`,
            `Step 2: Apply relevant concepts`,
            `Step 3: Calculate and verify`
          ]
        }));
        
        setSolutionContent(content);
      }

    } catch (err) {
      console.error('Error loading solution content:', err);
      toast({
        title: "Error",
        description: "Failed to load solution content. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to mock data on error
      const content: SolutionContent[] = Array.from({ length: solution.totalQuestions || 1 }, (_, i) => ({
        id: `content-${solution.id}-${i + 1}`,
        solutionId: solution.id,
        questionNumber: i + 1,
        question: `Question ${i + 1} for ${solution.chapter}`,
        solution: `Solution temporarily unavailable. Please try again later.`,
        steps: []
      }));
      
      setSolutionContent(content);
    } finally {
      setContentLoading(false);
    }
  };
  
  // Check if user has access to NCERT solutions
  const hasAccess = () => {
    return userData.tier === 'pro' || userData.tier === 'goat';
  };

  // Access denied component
  const AccessDeniedComponent = () => (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            🔒 Access Denied
          </CardTitle>
          <CardDescription className="text-lg">
            NCERT Solutions require a PRO or GOAT subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              You currently have a <Badge variant="outline">{userData.tier.toUpperCase()}</Badge> plan.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Upgrade to PRO or GOAT to access:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Complete NCERT Solutions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">AI-Powered Help</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Step-by-step Solutions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">All Subjects & Classes</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/subscription'}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to PRO
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/pricing'}
              size="lg"
            >
              View Pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Initial data fetch
  useEffect(() => {
    if (hasAccess()) {
      fetchChapterSummaries();
    }
  }, []);
  
  // Fetch when filters change
  useEffect(() => {
    if (!loading && hasAccess()) {
      if (viewMode === 'chapters') {
        fetchChapterSummaries();
      } else if (viewMode === 'questions' && selectedChapter) {
        fetchChapterQuestions(selectedChapter);
      }
    }
  }, [boardFilter, classFilter, subjectFilter, difficultyFilter, viewMode]);
  
  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    if (viewMode === 'chapters') {
      fetchChapterSummaries();
    } else if (selectedChapter) {
      fetchChapterQuestions(selectedChapter);
    }
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Get difficulty badge
  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Easy
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Medium
          </Badge>
        );
      case 'hard':
        return (
          <Badge className="bg-red-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Hard
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-300">
            Unknown
          </Badge>
        );
    }
  };
  
  // Get availability badge
  const getAvailabilityBadge = (isAvailable: boolean) => {
    if (isAvailable) {
      return (
        <Badge className="bg-green-500">
          Available
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-slate-500 border-slate-300">
        Coming Soon
      </Badge>
    );
  };
  

  
  // Render pagination controls
  const renderPagination = () => {
    const { page, pages } = pagination;
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => page < pages && handlePageChange(page + 1)}
              className={page >= pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Show access denied for free users
  if (!hasAccess()) {
    return (
      <>
        <Helmet>
          <title>NCERT Solutions - LearnQuest</title>
          <meta name="description" content="Access comprehensive NCERT solutions for all classes and subjects with AI-powered help." />
        </Helmet>
        <AccessDeniedComponent />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>NCERT Solutions - LearnQuest</title>
        <meta name="description" content="Access comprehensive NCERT solutions for all classes and subjects with AI-powered help." />
      </Helmet>

      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">NCERT Solutions</h1>
            <p className="text-muted-foreground">
              Browse and access NCERT solutions for all classes and subjects with AI-powered help
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                if (viewMode === 'chapters') {
                  fetchChapterSummaries();
                } else if (selectedChapter) {
                  fetchChapterQuestions(selectedChapter);
                }
              }}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
        
        {/* Solutions Content */}
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter NCERT solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by chapter, subject, or keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Select value={boardFilter} onValueChange={setBoardFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Boards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Boards</SelectItem>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="NCERT">NCERT</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
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
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Social Science">Social Science</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Breadcrumb */}
          {viewMode === 'questions' && selectedChapter && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-sm">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBackToChapters}
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                  >
                    All Chapters
                  </Button>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-medium">{selectedChapter}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chapter View */}
          {viewMode === 'chapters' && (
            <Card>
              <CardHeader>
                <CardTitle>Available Chapters</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${chapterSummaries.length} chapters found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={fetchChapterSummaries} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : chapterSummaries.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Chapters Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or check back later
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapterSummaries.map((chapter) => (
                      <Card 
                        key={chapter.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleChapterClick(chapter.chapter)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{chapter.chapter}</CardTitle>
                          <CardDescription>
                            Class {chapter.class} • {chapter.subject} • {chapter.board}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total Questions</span>
                              <Badge variant="outline">{chapter.totalQuestions}</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Difficulty Breakdown:</div>
                              <div className="flex gap-2">
                                {chapter.questionsBreakdown.easy > 0 && (
                                  <Badge className="bg-green-600 text-xs">
                                    Easy: {chapter.questionsBreakdown.easy}
                                  </Badge>
                                )}
                                {chapter.questionsBreakdown.medium > 0 && (
                                  <Badge className="bg-yellow-600 text-xs">
                                    Medium: {chapter.questionsBreakdown.medium}
                                  </Badge>
                                )}
                                {chapter.questionsBreakdown.hard > 0 && (
                                  <Badge className="bg-red-600 text-xs">
                                    Hard: {chapter.questionsBreakdown.hard}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t">
                              <Button 
                                className="w-full" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChapterClick(chapter.chapter);
                                }}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                View Questions ({chapter.totalQuestions})
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Questions View */}
          {viewMode === 'questions' && (
            <Card>
              <CardHeader>
                <CardTitle>Questions in {selectedChapter}</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${chapterQuestions.length} questions found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={() => selectedChapter && fetchChapterQuestions(selectedChapter)} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : chapterQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Questions Found</h3>
                    <p className="text-muted-foreground">
                      No questions available for this chapter yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Q. No</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead className="w-24">Type</TableHead>
                          <TableHead className="w-24">Difficulty</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chapterQuestions.map((question, index) => (
                          <TableRow key={question.id}>
                            <TableCell className="font-mono text-sm">
                              {question.questionNumber || index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md">
                                <p className="text-sm leading-relaxed">
                                  {question.question.length > 150 
                                    ? `${question.question.substring(0, 150)}...` 
                                    : question.question
                                  }
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {question.type || 'concept'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getDifficultyBadge(question.difficulty)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleViewSolution(question)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Solution
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleAIHelp(question)}
                                    disabled={!canAccessAIHelp()}
                                  >
                                    <Brain className="mr-2 h-4 w-4" />
                                    Get AI Help {!canAccessAIHelp() && '(PRO/GOAT)'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {!loading && !error && pagination.pages > 1 && (
                      <div className="flex justify-center mt-6">
                        {renderPagination()}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Solution Dialog */}
      <Dialog open={isSolutionDialogOpen} onOpenChange={setIsSolutionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedQuestion?.chapter} - Question {selectedQuestion?.questionNumber || ''}
            </DialogTitle>
            <DialogDescription>
              Class {selectedQuestion?.class} • {selectedQuestion?.subject} • {selectedQuestion?.board}
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <h3 className="font-medium mb-2">Question Information:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Question Type:</span> <Badge variant="outline">{selectedQuestion.type}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {getDifficultyBadge(selectedQuestion.difficulty)}
                  </div>
                  <div>
                    <span className="font-medium">Chapter:</span> {selectedQuestion.chapter}
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span> {selectedQuestion.subject}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Question
                  </h3>
                  <p className="text-sm leading-relaxed">{selectedQuestion.question}</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Solution
                  </h3>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedQuestion.answer}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => handleAIHelp(selectedQuestion)}
                    disabled={!canAccessAIHelp()}
                    className="flex-1"
                    variant="outline"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Help {!canAccessAIHelp() && '(PRO/GOAT)'}
                  </Button>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(`Q: ${selectedQuestion.question}\n\nA: ${selectedQuestion.answer}`);
                      toast({
                        title: "Copied!",
                        description: "Question and answer copied to clipboard",
                      });
                    }}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Copy Q&A
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSolutionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Help Dialog */}
      <Dialog open={isAIHelpOpen} onOpenChange={setIsAIHelpOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Study Assistant
            </DialogTitle>
            <DialogDescription>
              Get help with {selectedQuestion?.chapter} question
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="aiQuery">What would you like help with?</Label>
              <Textarea
                id="aiQuery"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g., Can you explain the concept of linear equations? How do I solve question 5?"
                rows={3}
              />
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={getAIAssistance}
                disabled={aiLoading || !aiQuery.trim()}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Help...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Get AI Help
                  </>
                )}
              </Button>
            </div>
            
            {aiResponse && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  AI Response:
                </h4>
                <div className="text-sm whitespace-pre-wrap">{aiResponse}</div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAIHelpOpen(false);
              setAiQuery('');
              setAiResponse('');
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NCERTSolutions;