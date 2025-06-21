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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  BookOpen,
  Users,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  Database,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SolutionStats {
  totalSolutions: number;
  availableSolutions: number;
  easySolutions: number;
  mediumSolutions: number;
  hardSolutions: number;
  totalViews: number;
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
  difficulty: 'easy' | 'medium' | 'hard';
  isAvailable: boolean;
  viewCount: number;
  lastUpdated: string;
  createdBy: string;
  solutionFile?: string;
  contentExtracted?: boolean;
}

interface QAPair {
  question: string;
  answer: string;
  questionNumber: number;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  confidence: number;
}

interface ProcessingSession {
  sessionId: string;
  status: 'pending_review' | 'uploaded_to_database' | 'rejected';
  metadata: {
    board: string;
    class: string;
    subject: string;
    chapter: string;
    originalFilename: string;
    fileSize: number;
    uploadedAt: string;
  };
  qaPairs: QAPair[];
  totalQuestions: number;
  createdAt: string;
}

const AdminSolutions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [solutions, setSolutions] = useState<NCERTSolution[]>([]);
  const [stats, setStats] = useState<SolutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Smart PDF Upload State
  const [processingSessions, setProcessingSessions] = useState<ProcessingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ProcessingSession | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [uploadingToDatabase, setUploadingToDatabase] = useState(false);
  
  // Upload form state
  const [uploadData, setUploadData] = useState({
    board: '',
    class: '',
    subject: '',
    chapter: '',
    chapterNumber: 1,
    exercise: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    file: null as File | null,
    thumbnailImage: null as File | null
  });

  // Smart PDF upload form state
  const [smartUploadData, setSmartUploadData] = useState({
    board: '',
    class: '',
    subject: '',
    chapter: '',
    pdfFile: null as File | null
  });

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      // Redirect to dashboard or solutions page
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Fetch solutions and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const [solutionsResponse, statsResponse] = await Promise.all([
        fetch(`${config.apiUrl}/ncert-solutions?limit=100&isAdmin=true`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${config.apiUrl}/ncert-solutions/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (solutionsResponse.ok) {
        const solutionsData = await solutionsResponse.json();
        setSolutions(solutionsData.solutions || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load solutions data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle solution upload
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

      const response = await fetch(`${config.apiUrl}/ncert-solutions/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': user?.id || 'admin',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload solution');
      }

      const result = await response.json();
      
      toast({
        title: result.pdfProcessing?.success ? "PDF Processed Successfully! 🎉" : "Solution Uploaded! 📁",
        description: result.pdfProcessing?.success 
          ? `Solution uploaded and ${result.data?.totalQuestions || result.pdfProcessing.totalQuestions} Q&A pairs extracted! Check Processing Sessions to review them.`
          : result.message || "Solution uploaded successfully!",
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
      
      // Refresh data and processing sessions
      fetchData();
      fetchProcessingSessions();

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

  // Handle smart PDF upload
  const handleSmartPDFUpload = async () => {
    if (!smartUploadData.pdfFile || !smartUploadData.board || !smartUploadData.class || 
        !smartUploadData.subject || !smartUploadData.chapter) {
      toast({
        title: "Error",
        description: "Please fill all fields and select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('board', smartUploadData.board);
      formData.append('class', smartUploadData.class);
      formData.append('subject', smartUploadData.subject);
      formData.append('chapter', smartUploadData.chapter);
      formData.append('pdfFile', smartUploadData.pdfFile);

      const response = await fetch(`${config.apiUrl}/smart-pdf-upload?action=upload`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || 'admin',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const result = await response.json();
      
      if (result.success) {
        const title = result.processingSuccess 
          ? "PDF Processed Successfully! 🎉"
          : "PDF Uploaded Successfully! ⚠️";
        
        const description = result.processingSuccess 
          ? `Extracted ${result.totalQuestions} Q&A pairs. Check the Processing Sessions tab to review them.`
          : `PDF uploaded but processing failed: ${result.processingError}. The file is saved and you can review it manually.`;
        
        toast({
          title,
          description,
        });
        toast({
          title,
          description,
        });

        // Reset form
        setSmartUploadData({
          board: '',
          class: '',
          subject: '',
          chapter: '',
          pdfFile: null
        });

        // Refresh processing sessions
        fetchProcessingSessions();
      } else {
        throw new Error(result.message || 'Failed to process PDF');
      }

    } catch (err) {
      console.error('Error processing PDF:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to process PDF",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Fetch processing sessions
  const fetchProcessingSessions = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/smart-pdf-upload?action=sessions`, {
        headers: {
          'x-user-id': user?.id || 'admin',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProcessingSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching processing sessions:', error);
    }
  };

  // Handle upload to database
  const handleUploadToDatabase = async (sessionId: string) => {
    setUploadingToDatabase(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/smart-pdf-upload?action=upload-to-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload to database');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success! 🚀",
          description: `Uploaded ${result.uploadedCount} Q&A pairs to database`,
        });

        // Refresh data
        fetchProcessingSessions();
        fetchData();
        setIsReviewDialogOpen(false);
      } else {
        throw new Error(result.message || 'Failed to upload to database');
      }

    } catch (err) {
      console.error('Error uploading to database:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload to database",
        variant: "destructive",
      });
    } finally {
      setUploadingToDatabase(false);
    }
  };

  // Open review dialog
  const openReviewDialog = (session: ProcessingSession) => {
    setSelectedSession(session);
    setIsReviewDialogOpen(true);
  };

  // Initial load
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
      fetchProcessingSessions();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Admin access required to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Solutions - LearnQuest</title>
        <meta name="description" content="Manage NCERT solutions and content." />
      </Helmet>

      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Solutions Management</h1>
            <p className="text-muted-foreground">
              Upload and manage NCERT solutions for students
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Brain className="w-4 h-4 mr-2" />
              Smart PDF Upload
            </Button>
            <Button variant="outline" onClick={() => {fetchData(); fetchProcessingSessions();}}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats?.totalSolutions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total NCERT solutions in database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats?.availableSolutions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Solutions available to students
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats?.totalViews || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total solution views by students
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Difficulty Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  Easy: {loading ? '...' : stats?.easySolutions || 0}
                </Badge>
                <Badge variant="secondary">
                  Medium: {loading ? '...' : stats?.mediumSolutions || 0}
                </Badge>
                <Badge variant="destructive">
                  Hard: {loading ? '...' : stats?.hardSolutions || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Processing Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Smart PDF Processing Sessions
            </CardTitle>
            <CardDescription>
              Review and manage PDF processing sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processingSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No processing sessions found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a PDF using Smart PDF Upload to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processingSessions.map((session) => (
                    <TableRow key={session.sessionId}>
                      <TableCell>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {session.metadata.originalFilename}
                      </TableCell>
                      <TableCell>
                        {session.metadata.board} | Class {session.metadata.class} | {session.metadata.subject}
                      </TableCell>
                      <TableCell>{session.totalQuestions}</TableCell>
                      <TableCell>
                        <Badge variant={
                          session.status === 'pending_review' ? 'default' :
                          session.status === 'uploaded_to_database' ? 'secondary' : 'destructive'
                        }>
                          {session.status === 'pending_review' ? 'Pending Review' :
                           session.status === 'uploaded_to_database' ? 'Uploaded' : 'Rejected'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => openReviewDialog(session)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                          {session.status === 'pending_review' && (
                            <Button size="sm" onClick={() => handleUploadToDatabase(session.sessionId)}>
                              <Database className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Solutions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              NCERT Solutions
            </CardTitle>
            <CardDescription>
              Manage uploaded NCERT solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading solutions...</p>
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No solutions found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a solution to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solutions.map((solution) => (
                    <TableRow key={solution.id}>
                      <TableCell className="font-medium">{solution.subject}</TableCell>
                      <TableCell>{solution.class}</TableCell>
                      <TableCell>{solution.chapter}</TableCell>
                      <TableCell>{solution.exercise}</TableCell>
                      <TableCell>
                        <Badge variant={
                          solution.difficulty === 'easy' ? 'default' :
                          solution.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {solution.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{solution.totalQuestions}</TableCell>
                      <TableCell>{solution.viewCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {solution.isAvailable ? (
                            <Badge className="bg-green-600">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {solution.contentExtracted && (
                            <Badge variant="outline">Processed</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload NCERT Solution
              </DialogTitle>
              <DialogDescription>
                Add a new NCERT solution to the database
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="smart-upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="smart-upload" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Smart PDF Upload
                </TabsTrigger>
                <TabsTrigger value="manual-upload" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Manual Upload
                </TabsTrigger>
              </TabsList>
              
              {/* Smart PDF Upload Tab */}
              <TabsContent value="smart-upload" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smart-board">Board</Label>
                      <Select
                        value={smartUploadData.board}
                        onValueChange={(value) => setSmartUploadData({...smartUploadData, board: value})}
                      >
                        <SelectTrigger id="smart-board">
                          <SelectValue placeholder="Select Board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CBSE">CBSE</SelectItem>
                          <SelectItem value="ICSE">ICSE</SelectItem>
                          <SelectItem value="State">State Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smart-class">Class</Label>
                      <Select
                        value={smartUploadData.class}
                        onValueChange={(value) => setSmartUploadData({...smartUploadData, class: value})}
                      >
                        <SelectTrigger id="smart-class">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              Class {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smart-subject">Subject</Label>
                      <Select
                        value={smartUploadData.subject}
                        onValueChange={(value) => setSmartUploadData({...smartUploadData, subject: value})}
                      >
                        <SelectTrigger id="smart-subject">
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
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Geography">Geography</SelectItem>
                          <SelectItem value="Civics">Civics</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smart-chapter">Chapter</Label>
                      <Input
                        id="smart-chapter"
                        placeholder="Enter Chapter Name"
                        value={smartUploadData.chapter}
                        onChange={(e) => setSmartUploadData({...smartUploadData, chapter: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smart-pdf-file">PDF File</Label>
                    <Input
                      id="smart-pdf-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSmartUploadData({...smartUploadData, pdfFile: file});
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload a PDF file containing NCERT solutions. The system will automatically extract questions and answers.
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleSmartPDFUpload}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                    Process PDF & Extract Q&A Pairs
                  </Button>
                </div>
              </TabsContent>

              {/* Manual Upload Tab */}
              <TabsContent value="manual-upload" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          {Array.from({length: 7}, (_, i) => i + 6).map(cls => (
                            <SelectItem key={cls} value={cls.toString()}>Class {cls}</SelectItem>
                          ))}
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
                      placeholder="e.g., Chapter 1: Rational Numbers"
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
                    <Label htmlFor="exercise">Exercise (Optional)</Label>
                    <Input
                      id="exercise"
                      value={uploadData.exercise}
                      onChange={(e) => setUploadData(prev => ({ ...prev, exercise: e.target.value }))}
                      placeholder="e.g., Exercise 1.2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="solution-file">Solution PDF</Label>
                    <Input
                      id="solution-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadData(prev => ({ ...prev, file }));
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a PDF file containing NCERT solutions
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadData(prev => ({ ...prev, thumbnailImage: file }));
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a thumbnail image for this solution
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleUploadSolution}
                    disabled={uploadLoading || !uploadData.file}
                    className="w-full"
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
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Review Extracted Q&A Pairs
              </DialogTitle>
              <DialogDescription>
                {selectedSession && (
                  <div className="flex flex-col gap-1 mt-2">
                    <p>
                      <strong>PDF:</strong> {selectedSession.metadata.originalFilename}
                    </p>
                    <p>
                      <strong>Details:</strong> {selectedSession.metadata.board} | Class {selectedSession.metadata.class} | {selectedSession.metadata.subject} | {selectedSession.metadata.chapter}
                    </p>
                    <p>
                      <strong>Extracted:</strong> {selectedSession.totalQuestions} Q&A pairs
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedSession && (
              <div className="space-y-6 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {selectedSession.qaPairs.length} Q&A Pairs
                    </Badge>
                    <Badge variant={
                      selectedSession.status === 'pending_review' ? 'default' :
                      selectedSession.status === 'uploaded_to_database' ? 'secondary' : 'destructive'
                    }>
                      {selectedSession.status === 'pending_review' ? 'Pending Review' :
                       selectedSession.status === 'uploaded_to_database' ? 'Uploaded' : 'Rejected'}
                    </Badge>
                  </div>
                  
                  {selectedSession.status === 'pending_review' && (
                    <Button 
                      onClick={() => handleUploadToDatabase(selectedSession.sessionId)}
                      disabled={uploadingToDatabase}
                    >
                      {uploadingToDatabase ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="mr-2 h-4 w-4" />
                      )}
                      Upload All to Database
                    </Button>
                  )}
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">#</TableHead>
                        <TableHead className="w-[40%]">Question</TableHead>
                        <TableHead>Answer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSession.qaPairs.map((pair, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {pair.questionNumber || index + 1}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="max-h-[200px] overflow-y-auto">
                              {pair.question}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="max-h-[200px] overflow-y-auto">
                              {pair.answer}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                    Close
                  </Button>
                  {selectedSession.status === 'pending_review' && (
                    <Button onClick={() => handleUploadToDatabase(selectedSession.sessionId)} disabled={uploadingToDatabase}>
                      {uploadingToDatabase ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                      Upload to Database
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminSolutions;