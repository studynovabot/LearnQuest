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
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types - exactly like AdminUsers but for NCERT solutions
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
  
  // State for filters - exactly like AdminUsers
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
  
  // Mock data - similar to how AdminUsers has mock users
  const generateMockSolutions = (count: number): NCERTSolution[] => {
    const boards = ['CBSE', 'NCERT', 'State Board'];
    const classes = ['6', '7', '8', '9', '10', '11', '12'];
    const subjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Science'];
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    
    const mathChapters = [
      'Rational Numbers', 'Linear Equations', 'Understanding Quadrilaterals', 'Practical Geometry',
      'Data Handling', 'Squares and Square Roots', 'Cubes and Cube Roots', 'Comparing Quantities',
      'Algebraic Expressions', 'Visualising Solid Shapes', 'Mensuration', 'Exponents and Powers',
      'Direct and Inverse Proportions', 'Factorisation', 'Introduction to Graphs'
    ];
    
    const scienceChapters = [
      'Crop Production', 'Microorganisms', 'Synthetic Fibres', 'Materials and Combustion',
      'Conservation of Plants', 'Reproduction in Animals', 'Reaching the Age of Adolescence',
      'Force And Pressure', 'Friction', 'Sound', 'Chemical Effects', 'Natural Phenomena',
      'Light', 'Stars and Solar System', 'Pollution of Air and Water'
    ];
    
    return Array.from({ length: count }).map((_, index) => {
      const board = boards[Math.floor(Math.random() * boards.length)];
      const cls = classes[Math.floor(Math.random() * classes.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const chapterNumber = Math.floor(Math.random() * 15) + 1;
      
      let chapterTitle = '';
      if (subject === 'Mathematics') {
        chapterTitle = mathChapters[chapterNumber - 1] || `Mathematics Topic ${chapterNumber}`;
      } else if (subject === 'Science') {
        chapterTitle = scienceChapters[chapterNumber - 1] || `Science Topic ${chapterNumber}`;
      } else {
        chapterTitle = `${subject} Chapter ${chapterNumber}`;
      }
      
      return {
        id: `solution-${index + 1}`,
        board,
        class: cls,
        subject,
        chapter: `Chapter ${chapterNumber}: ${chapterTitle}`,
        chapterNumber,
        exercise: `Exercise ${chapterNumber}.${Math.floor(Math.random() * 5) + 1}`,
        totalQuestions: Math.floor(Math.random() * 20) + 10,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        isAvailable: Math.random() > 0.1, // 90% available
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: Math.floor(Math.random() * 1000) + 10
      };
    });
  };
  
  // Generate mock solutions
  const mockSolutions = generateMockSolutions(50);
  
  // Fetch solutions data - similar to AdminUsers fetchUsers
  const fetchSolutions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply filters to mock data
      let filteredSolutions = mockSolutions;
      
      if (boardFilter && boardFilter !== 'all') {
        filteredSolutions = filteredSolutions.filter(solution => solution.board === boardFilter);
      }
      
      if (classFilter && classFilter !== 'all') {
        filteredSolutions = filteredSolutions.filter(solution => solution.class === classFilter);
      }
      
      if (subjectFilter && subjectFilter !== 'all') {
        filteredSolutions = filteredSolutions.filter(solution => solution.subject === subjectFilter);
      }
      
      if (difficultyFilter && difficultyFilter !== 'all') {
        filteredSolutions = filteredSolutions.filter(solution => solution.difficulty === difficultyFilter);
      }
      
      if (search) {
        filteredSolutions = filteredSolutions.filter(solution =>
          solution.chapter.toLowerCase().includes(search.toLowerCase()) ||
          solution.subject.toLowerCase().includes(search.toLowerCase()) ||
          solution.exercise.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Sort solutions
      filteredSolutions.sort((a, b) => {
        let aValue = a[sortBy as keyof NCERTSolution];
        let bValue = b[sortBy as keyof NCERTSolution];
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Pagination
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedSolutions = filteredSolutions.slice(startIndex, endIndex);
      
      setSolutions(paginatedSolutions);
      setPagination(prev => ({
        ...prev,
        total: filteredSolutions.length,
        pages: Math.ceil(filteredSolutions.length / prev.limit)
      }));
      
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch solutions');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch solution stats - similar to AdminUsers fetchUserStats
  const fetchSolutionStats = async () => {
    setStatsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const stats: SolutionStats = {
        totalSolutions: mockSolutions.length,
        availableSolutions: mockSolutions.filter(s => s.isAvailable).length,
        easySolutions: mockSolutions.filter(s => s.difficulty === 'easy').length,
        mediumSolutions: mockSolutions.filter(s => s.difficulty === 'medium').length,
        hardSolutions: mockSolutions.filter(s => s.difficulty === 'hard').length,
        mostViewed: Math.max(...mockSolutions.map(s => s.viewCount || 0))
      };
      
      setSolutionStats(stats);
    } catch (err) {
      console.error('Error fetching solution stats:', err);
    } finally {
      setStatsLoading(false);
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
  const handleViewSolution = (solution: NCERTSolution) => {
    setSelectedSolution(solution);
    setIsSolutionDialogOpen(true);
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
        <meta name="description" content="Access comprehensive NCERT solutions for all classes and subjects." />
      </Helmet>

      <div className="container mx-auto py-8 space-y-8">
        {/* Header - exactly like AdminUsers */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">NCERT Solutions</h1>
            <p className="text-muted-foreground">
              Browse and access NCERT solutions for all classes and subjects
            </p>
          </div>
          
          <Button 
            onClick={() => {
              fetchSolutions();
              fetchSolutionStats();
            }}
            variant="outline"
            className="self-start"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
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
                                {solution.viewCount}
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
                                  <DropdownMenuItem>
                                    <Brain className="mr-2 h-4 w-4" />
                                    Get AI Help
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
              
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Solution Content</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed step-by-step solutions for all {selectedSolution.totalQuestions} questions
                </p>
                <Button>
                  Access Full Solutions
                </Button>
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
    </>
  );
};

export default NCERTSolutions;