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

const NCERTSolutions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for solutions data
  const [solutions, setSolutions] = useState<NCERTSolution[]>([]);
  const [processedSolutions, setProcessedSolutions] = useState<ProcessedSolution[]>([]);
  const [selectedProcessedSolution, setSelectedProcessedSolution] = useState<ProcessedSolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock user data - in production get from auth
  const [userData] = useState({
    id: user?.id || 'user123',
    tier: (user?.subscriptionPlan || 'free') as 'free' | 'pro' | 'goat',
    name: user?.displayName || 'User'
  });
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });
  
  // State for filters
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sortBy, setSortBy] = useState('chapterNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // State for solution management
  const [selectedSolution, setSelectedSolution] = useState<NCERTSolution | null>(null);
  const [isSolutionDialogOpen, setIsSolutionDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // State for AI help
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // State for solution content
  const [solutionContent, setSolutionContent] = useState<SolutionContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  
  // Fetch solutions data with real API call
  const fetchSolutions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(boardFilter && boardFilter !== 'all' && { board: boardFilter }),
        ...(classFilter && classFilter !== 'all' && { class: classFilter }),
        ...(subjectFilter && subjectFilter !== 'all' && { subject: subjectFilter }),
        ...(difficultyFilter && difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
      });

      const response = await fetch(`${config.apiUrl}/ncert-solutions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Try to get error message from response body if it's JSON
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } catch (parseError) {
          // If we can't parse the error as JSON, keep the original message
          console.warn('Could not parse error response as JSON:', parseError);
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format. Expected JSON but received: ' + (contentType || 'unknown'));
      }

      const data = await response.json();
      setSolutions(data.solutions || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        pages: data.pages || 0
      }));
      
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch solutions');
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if user can access AI help
  const canAccessAIHelp = () => {
    const userPlan = userData.tier;
    return userPlan === 'pro' || userPlan === 'goat';
  };

  // Get AI help for solution
  const handleAIHelp = async (solution: NCERTSolution) => {
    if (!canAccessAIHelp()) {
      toast({
        title: "Upgrade Required",
        description: "AI Help is available for PRO and GOAT users only. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }
    setSelectedSolution(solution);
    setIsAIHelpOpen(true);
  };

  const getAIAssistance = async () => {
    if (!aiQuery.trim() || !selectedSolution) return;

    setAiLoading(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/ai-services?service=help`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: aiQuery,
          context: {
            board: selectedSolution.board,
            class: selectedSolution.class,
            subject: selectedSolution.subject,
            chapter: selectedSolution.chapter,
            exercise: selectedSolution.exercise
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }

      const data = await response.json();
      setAiResponse(data.response);

    } catch (err) {
      console.error('Error getting AI help:', err);
      toast({
        title: "Error",
        description: "Failed to get AI assistance",
        variant: "destructive",
      });
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
      fetchSolutions();
    }
  }, []);
  
  // Fetch when filters or pagination changes
  useEffect(() => {
    if (!loading) {
      fetchSolutions();
    }
  }, [pagination.page, sortBy, sortOrder, boardFilter, classFilter, subjectFilter, difficultyFilter]);
  
  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSolutions();
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
  
  // Handle solution view
  const handleViewSolution = async (solution: NCERTSolution) => {
    setSelectedSolution(solution);
    setIsSolutionDialogOpen(true);
    await loadSolutionContent(solution);
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
                fetchSolutions();
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

          {/* Solutions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Available Solutions</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${pagination.total} solutions found`}
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
                  <Button onClick={fetchSolutions} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : solutions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Solutions Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or check back later
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chapter</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Board</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solutions.map((solution) => (
                        <TableRow key={solution.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{solution.chapter}</div>
                              <div className="text-sm text-muted-foreground">
                                {solution.exercise}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>Class {solution.class}</TableCell>
                          <TableCell>{solution.subject}</TableCell>
                          <TableCell>{solution.board}</TableCell>
                          <TableCell>{solution.totalQuestions}</TableCell>
                          <TableCell>{getDifficultyBadge(solution.difficulty)}</TableCell>
                          <TableCell>{getAvailabilityBadge(solution.isAvailable)}</TableCell>
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
                                  onClick={() => handleViewSolution(solution)}
                                  disabled={!solution.isAvailable}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Solutions
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleAIHelp(solution)}
                                  disabled={!solution.aiHelpEnabled || !canAccessAIHelp()}
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
        </div>
      </div>

      {/* Solution Dialog */}
      <Dialog open={isSolutionDialogOpen} onOpenChange={setIsSolutionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedSolution?.chapter} - {selectedSolution?.exercise}
            </DialogTitle>
            <DialogDescription>
              Class {selectedSolution?.class} • {selectedSolution?.subject} • {selectedSolution?.board}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolution && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <h3 className="font-medium mb-2">Exercise Information:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Questions:</span> {selectedSolution.totalQuestions}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {getDifficultyBadge(selectedSolution.difficulty)}
                  </div>
                  <div>
                    <span className="font-medium">Views:</span> {selectedSolution.viewCount}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {formatDate(selectedSolution.lastUpdated)}
                  </div>
                </div>
              </div>
              
              {contentLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : solutionContent.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Solutions</h3>
                  {solutionContent.map((content) => (
                    <div key={content.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Question {content.questionNumber}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{content.question}</p>
                      <div className="text-sm">
                        <p className="mb-2">{content.solution}</p>
                        {content.steps && content.steps.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium text-xs text-muted-foreground mb-1">Steps:</p>
                            <ol className="list-decimal list-inside space-y-1 text-xs">
                              {content.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Solution Content</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed step-by-step solutions for all {selectedSolution.totalQuestions} questions
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAIHelp(selectedSolution)}
                      disabled={!selectedSolution.aiHelpEnabled || !canAccessAIHelp()}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Get AI Help {!canAccessAIHelp() && '(PRO/GOAT)'}
                    </Button>
                  </div>
                </div>
              )}
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
              Get help with {selectedSolution?.chapter} - {selectedSolution?.exercise}
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