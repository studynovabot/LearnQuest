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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText, 
  Brain,
  MoreHorizontal,
  Eye,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Plus,
  Download,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced interfaces for real solution data
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
  solutionFile?: string; // Path to solution file
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

interface SolutionStats {
  totalSolutions: number;
  availableSolutions: number;
  easySolutions: number;
  mediumSolutions: number;
  hardSolutions: number;
  mostViewed: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UploadSolution {
  board: string;
  class: string;
  subject: string;
  chapter: string;
  chapterNumber: number;
  exercise: string;
  difficulty: 'easy' | 'medium' | 'hard';
  file: File | null;
  thumbnailImage: File | null;
}

const NCERTSolutions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for solutions data
  const [solutions, setSolutions] = useState<NCERTSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  
  // State for solution stats
  const [solutionStats, setSolutionStats] = useState<SolutionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // State for solution management
  const [selectedSolution, setSelectedSolution] = useState<NCERTSolution | null>(null);
  const [isSolutionDialogOpen, setIsSolutionDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // State for solution upload
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState<UploadSolution>({
    board: '',
    class: '',
    subject: '',
    chapter: '',
    chapterNumber: 1,
    exercise: '',
    difficulty: 'medium',
    file: null,
    thumbnailImage: null
  });
  const [uploadLoading, setUploadLoading] = useState(false);

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

      // Try the main API first, fallback to test API if it fails
      let response;
      let data;
      
      try {
        response = await fetch(`${config.apiUrl}/api/ncert-solutions?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        data = await response.json();
      } catch (mainApiError) {
        console.warn('Main API failed, trying test API:', mainApiError);
        
        // Fallback to test API
        response = await fetch(`${config.apiUrl}/api/ncert-solutions-test?action=solutions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Both main and test APIs failed');
        }

        data = await response.json();
        
        toast({
          title: "Info",
          description: "Using demo data - full functionality will be available soon",
          variant: "default",
        });
      }
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
  
  // Fetch solution stats
  const fetchSolutionStats = async () => {
    setStatsLoading(true);
    
    try {
      // Try the main API first, fallback to test API if it fails
      let response;
      let stats;
      
      try {
        response = await fetch(`${config.apiUrl}/api/ncert-solutions/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        stats = await response.json();
      } catch (mainApiError) {
        console.warn('Main stats API failed, trying test API:', mainApiError);
        
        // Fallback to test API
        response = await fetch(`${config.apiUrl}/api/ncert-solutions-test?action=stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Both main and test stats APIs failed');
        }

        stats = await response.json();
      }
      
      setSolutionStats(stats);
    } catch (err) {
      console.error('Error fetching solution stats:', err);
      toast({
        title: "Error",
        description: "Failed to load solution statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Upload solution
  const handleUploadSolution = async () => {
    if (!uploadData.file) {
      toast({
        title: "Error",
        description: "Please select a solution file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('board', uploadData.board);
      formData.append('class', uploadData.class);
      formData.append('subject', uploadData.subject);
      formData.append('chapter', uploadData.chapter);
      formData.append('chapterNumber', uploadData.chapterNumber.toString());
      formData.append('exercise', uploadData.exercise);
      formData.append('difficulty', uploadData.difficulty);
      formData.append('solutionFile', uploadData.file);
      
      if (uploadData.thumbnailImage) {
        formData.append('thumbnailImage', uploadData.thumbnailImage);
      }

      const response = await fetch(`${config.apiUrl}/api/ncert-solutions/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload solution');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Solution uploaded successfully!",
      });

      setIsUploadDialogOpen(false);
      setUploadData({
        board: '',
        class: '',
        subject: '',
        chapter: '',
        chapterNumber: 1,
        exercise: '',
        difficulty: 'medium',
        file: null,
        thumbnailImage: null
      });
      
      // Refresh solutions list
      fetchSolutions();
      fetchSolutionStats();

    } catch (err) {
      console.error('Error uploading solution:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload solution",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Get AI help for solution
  const handleAIHelp = async (solution: NCERTSolution) => {
    setSelectedSolution(solution);
    setIsAIHelpOpen(true);
  };

  const getAIAssistance = async () => {
    if (!aiQuery.trim() || !selectedSolution) return;

    setAiLoading(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/ai/help`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solutionId: selectedSolution.id,
          query: aiQuery,
          context: {
            subject: selectedSolution.subject,
            class: selectedSolution.class,
            chapter: selectedSolution.chapter,
            exercise: selectedSolution.exercise
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }

      const result = await response.json();
      setAiResponse(result.response);

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
  const loadSolutionContent = async (solutionId: string) => {
    setContentLoading(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/ncert-solutions/${solutionId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load solution content');
      }

      const content = await response.json();
      setSolutionContent(content);

    } catch (err) {
      console.error('Error loading solution content:', err);
      toast({
        title: "Error",
        description: "Failed to load solution content",
        variant: "destructive",
      });
    } finally {
      setContentLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchSolutions();
    fetchSolutionStats();
  }, []);
  
  // Fetch when filters or pagination changes
  useEffect(() => {
    if (!loading) {
      fetchSolutions();
    }
  }, [pagination.page, sortBy, sortOrder, boardFilter, classFilter, subjectFilter, difficultyFilter]);
  
  // Handle search - exactly like AdminUsers
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
  
  // Get difficulty badge - similar to AdminUsers subscription badge
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
    await loadSolutionContent(solution.id);
  };
  
  // Render pagination controls - exactly like AdminUsers
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
            {user?.role === 'admin' && (
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Solution
              </Button>
            )}
            <Button 
              onClick={() => {
                fetchSolutions();
                fetchSolutionStats();
              }}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
        
        {/* Tabs - exactly like AdminUsers */}
        <Tabs defaultValue="solutions">
          <TabsList>
            <TabsTrigger value="solutions">
              <BookOpen className="w-4 h-4 mr-2" />
              Solutions List
            </TabsTrigger>
            <TabsTrigger value="stats">
              <FileText className="w-4 h-4 mr-2" />
              Solution Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="solutions" className="space-y-6">
            {/* Filters - exactly like AdminUsers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter and search NCERT solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by chapter, subject, or exercise..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Select
                        value={boardFilter}
                        onValueChange={setBoardFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Boards</SelectItem>
                          <SelectItem value="CBSE">CBSE</SelectItem>
                          <SelectItem value="NCERT">NCERT</SelectItem>
                          <SelectItem value="State Board">State Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={classFilter}
                        onValueChange={setClassFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Class" />
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
                    </div>
                    
                    <div>
                      <Select
                        value={subjectFilter}
                        onValueChange={setSubjectFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Subject" />
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
                    </div>
                    
                    <div>
                      <Select
                        value={difficultyFilter}
                        onValueChange={setDifficultyFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={handleSearch}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Solutions Table - exactly like AdminUsers table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Available Solutions</CardTitle>
                <CardDescription>
                  {pagination.total} total solutions • Page {pagination.page} of {pagination.pages}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error Loading Solutions</h3>
                      <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
                    </div>
                    <Button variant="outline" onClick={fetchSolutions}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : solutions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No solutions found</p>
                    {user?.role === 'admin' && (
                      <Button 
                        className="mt-4"
                        onClick={() => setIsUploadDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Upload First Solution
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Chapter</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Board</TableHead>
                          <TableHead>Exercise</TableHead>
                          <TableHead>Questions</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solutions.map((solution) => (
                          <TableRow key={solution.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{solution.chapter}</div>
                                <div className="text-sm text-muted-foreground">Chapter {solution.chapterNumber}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{solution.subject}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Class {solution.class}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{solution.board}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{solution.exercise}</div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{solution.totalQuestions}</span>
                            </TableCell>
                            <TableCell>
                              {getDifficultyBadge(solution.difficulty)}
                            </TableCell>
                            <TableCell>
                              {getAvailabilityBadge(solution.isAvailable)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Eye className="w-3 h-3 mr-1 text-muted-foreground" />
                                {solution.viewCount || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(solution.lastUpdated)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoading}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    onClick={() => handleViewSolution(solution)}
                                    disabled={!solution.isAvailable}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Solutions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Star className="mr-2 h-4 w-4" />
                                    Add to Favorites
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleAIHelp(solution)}
                                    disabled={!solution.aiHelpEnabled}
                                  >
                                    <Brain className="mr-2 h-4 w-4" />
                                    Get AI Help
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {/* Pagination */}
                {!loading && !error && pagination.pages > 1 && (
                  <div className="flex justify-center mt-6">
                    {renderPagination()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Stats Tab - like AdminUsers */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Solutions</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      solutionStats?.totalSolutions || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all subjects and classes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Now</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      solutionStats?.availableSolutions || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ready to access
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Easy Solutions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      solutionStats?.easySolutions || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Beginner friendly
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Viewed</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      solutionStats?.mostViewed || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum views
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
                      disabled={!selectedSolution.aiHelpEnabled}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Get AI Help
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

      {/* Solution Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Solution
            </DialogTitle>
            <DialogDescription>
              Upload a new NCERT solution for students to access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="board">Board</Label>
                <Select 
                  value={uploadData.board} 
                  onValueChange={(value) => setUploadData(prev => ({ ...prev, board: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="NCERT">NCERT</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="class">Class</Label>
                <Select 
                  value={uploadData.class} 
                  onValueChange={(value) => setUploadData(prev => ({ ...prev, class: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={uploadData.subject} 
                onValueChange={(value) => setUploadData(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
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
            </div>
            
            <div>
              <Label htmlFor="chapter">Chapter Title</Label>
              <Input
                id="chapter"
                value={uploadData.chapter}
                onChange={(e) => setUploadData(prev => ({ ...prev, chapter: e.target.value }))}
                placeholder="e.g., Linear Equations in One Variable"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chapterNumber">Chapter Number</Label>
                <Input
                  id="chapterNumber"
                  type="number"
                  min="1"
                  max="20"
                  value={uploadData.chapterNumber}
                  onChange={(e) => setUploadData(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  value={uploadData.difficulty} 
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => setUploadData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="exercise">Exercise</Label>
              <Input
                id="exercise"
                value={uploadData.exercise}
                onChange={(e) => setUploadData(prev => ({ ...prev, exercise: e.target.value }))}
                placeholder="e.g., Exercise 2.1"
              />
            </div>
            
            <div>
              <Label htmlFor="solutionFile">Solution File (PDF)</Label>
              <Input
                id="solutionFile"
                type="file"
                accept=".pdf"
                onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              />
            </div>
            
            <div>
              <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setUploadData(prev => ({ ...prev, thumbnailImage: e.target.files?.[0] || null }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={uploadLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadSolution}
              disabled={uploadLoading || !uploadData.file}
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Solution
                </>
              )}
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
              AI Learning Assistant
            </DialogTitle>
            <DialogDescription>
              Get personalized help with {selectedSolution?.chapter} - {selectedSolution?.exercise}
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