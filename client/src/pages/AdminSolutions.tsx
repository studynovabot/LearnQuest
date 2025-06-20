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
  AlertCircle
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

const AdminSolutions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [solutions, setSolutions] = useState<NCERTSolution[]>([]);
  const [stats, setStats] = useState<SolutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
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
        fetch(`${config.apiUrl}/api/ncert-solutions?limit=100`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${config.apiUrl}/api/ncert-solutions/stats`, {
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
        description: result.pdfProcessing?.success 
          ? `Solution uploaded and ${result.pdfProcessing.questionsProcessed} questions extracted!`
          : "Solution uploaded successfully!",
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
      
      // Refresh data
      fetchData();

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

  // Initial load
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
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
              <Upload className="w-4 h-4 mr-2" />
              Upload Solution
            </Button>
            <Button variant="outline" onClick={fetchData}>
              <FileText className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Solutions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSolutions || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.availableSolutions || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Difficulty Distribution</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Easy: {stats?.easySolutions || 0} | Medium: {stats?.mediumSolutions || 0} | Hard: {stats?.hardSolutions || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solutions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Solutions</CardTitle>
            <CardDescription>
              Manage uploaded NCERT solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No solutions uploaded yet</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Solution
                </Button>
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Solution
              </DialogTitle>
              <DialogDescription>
                Upload a new NCERT solution PDF with metadata
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
                <Label htmlFor="exercise">Exercise</Label>
                <Input
                  id="exercise"
                  value={uploadData.exercise}
                  onChange={(e) => setUploadData(prev => ({ ...prev, exercise: e.target.value }))}
                  placeholder="e.g., Exercise 1.1"
                />
              </div>
              
              <div>
                <Label htmlFor="solutionFile">Solution File (PDF) *</Label>
                <Input
                  id="solutionFile"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a PDF file containing the complete solution
                </p>
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
      </div>
    </>
  );
};

export default AdminSolutions;