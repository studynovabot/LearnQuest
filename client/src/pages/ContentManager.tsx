import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "@/components/ui/premium-card";
import { PremiumUpload, PremiumFilePreview, PremiumProgressBar } from "@/components/ui/premium-upload";
import { PremiumSelect, PremiumInput } from "@/components/ui/premium-form";
import { GradientButton, GlassButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UploadIcon, FileTextIcon, TrashIcon, DownloadIcon, CheckCircleIcon, LoaderIcon, SparklesIcon, FolderIcon, ShieldIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UploadedContent {
  id: string;
  filename: string;
  type: 'flash-notes' | 'flow-charts' | 'ncert-solutions' | 'textbook-solutions';
  board: string;
  class: string;
  subject: string;
  chapter?: string;
  uploadDate: string;
  fileSize: number;
  status: 'processing' | 'completed' | 'error' | 'draft' | 'published';
  downloadUrl?: string;
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  tags?: string[];
  verifiedBy?: string;
}

const ContentManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedContent[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email === 'thakurranveersingh505@gmail.com' || user?.email === 'tradingproffical@gmail.com';

  const boards = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics'];
  const contentTypes = [
    { value: 'flash-notes', label: 'Flash Notes' },
    { value: 'flow-charts', label: 'Flow Charts' },
    { value: 'ncert-solutions', label: 'NCERT Solutions' },
    { value: 'textbook-solutions', label: 'Textbook Solutions' }
  ];
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'processing', label: 'Processing' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    fetchUploadedContent();
  }, []);

  const fetchUploadedContent = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBoard) params.append('board', selectedBoard);
      if (selectedClass) params.append('class', selectedClass);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedChapter) params.append('chapter', selectedChapter);
      if (selectedType) params.append('type', selectedType);
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/content-manager?${params.toString()}`, {
        headers: {
          'x-user-id': user?.id || 'admin',
          'x-user-email': user?.email || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data);
      } else {
        console.error('Failed to fetch content:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    fetchUploadedContent();
  }, [selectedBoard, selectedClass, selectedSubject, selectedChapter, selectedType, filterStatus, searchTerm]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check admin access
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can upload content.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedType || !selectedBoard || !selectedClass || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select content type, board, class, and subject before uploading.",
        variant: "destructive"
      });
      return;
    }

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload only PDF files.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      formData.append('board', selectedBoard);
      formData.append('class', selectedClass);
      formData.append('subject', selectedSubject);
      if (selectedChapter) {
        formData.append('chapter', selectedChapter);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          toast({
            title: "Upload Successful! 🎉",
            description: "Your content is being processed and will be available soon.",
          });
          fetchUploadedContent();
        } else {
          throw new Error('Upload failed');
        }
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        toast({
          title: "Upload Failed",
          description: "There was an error uploading your file. Please try again.",
          variant: "destructive"
        });
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', '/api/content-manager/upload');
      xhr.setRequestHeader('x-user-id', user?.id || 'admin');
      xhr.setRequestHeader('x-user-email', user?.email || '');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (contentId: string) => {
    try {
      const response = await fetch(`/api/content-manager/${contentId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || 'admin'
        }
      });

      if (response.ok) {
        toast({
          title: "Content Deleted",
          description: "The content has been successfully removed.",
        });
        fetchUploadedContent();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon size={16} className="text-green-500" />;
      case 'processing':
        return <LoaderIcon size={16} className="text-blue-500 animate-spin" />;
      case 'error':
        return <TrashIcon size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = uploadedFiles.filter(file => {
    return (!selectedType || file.type === selectedType) &&
           (!selectedClass || file.class === selectedClass) &&
           (!selectedSubject || file.subject === selectedSubject);
  });

  return (
    <>
      <Helmet>
        <title>Content Manager | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Upload and manage educational content including flash notes, flow charts, and NCERT solutions." />
      </Helmet>

      <div className="space-y-8">
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
              <FolderIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Content Manager
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Upload and manage educational content with premium tools
              </p>
            </div>
          </motion.div>

          {/* Admin Status Indicator */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full"
            >
              <ShieldIcon size={16} className="text-green-500" />
              <span className="text-sm font-medium text-green-500">Administrator Access</span>
            </motion.div>
          )}
        </motion.div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="upload">Upload Content</TabsTrigger>
            <TabsTrigger value="manage">Manage Content</TabsTrigger>
          </TabsList>

          {/* Premium Upload Tab */}
          <TabsContent value="upload">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {!isAdmin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <PremiumCard variant="glass" className="border-red-500/20 bg-red-500/5">
                    <PremiumCardContent className="pt-6">
                      <div className="text-center">
                        <div className="p-3 bg-red-500/20 rounded-full w-fit mx-auto mb-4">
                          <ShieldIcon size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-500 mb-2">Admin Access Required</h3>
                        <p className="text-muted-foreground">
                          Only administrators can upload educational content. Please contact an admin for access.
                        </p>
                      </div>
                    </PremiumCardContent>
                  </PremiumCard>
                </motion.div>
              )}

              <PremiumCard variant="glass" glow={true}>
                <PremiumCardHeader>
                  <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <UploadIcon size={24} className="text-blue-500" />
                    </div>
                    Upload Educational Content
                  </PremiumCardTitle>
                  <PremiumCardDescription className="text-base">
                    Upload PDF files for flash notes, flow charts, and NCERT solutions with our premium upload system
                  </PremiumCardDescription>
                </PremiumCardHeader>
                <PremiumCardContent className="space-y-6">
                  {/* Premium Content Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <SparklesIcon size={20} className="text-primary" />
                      Content Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <PremiumSelect
                        label="Content Type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        options={[
                          { value: "", label: "Select Type" },
                          ...contentTypes
                        ]}
                        variant="glass"
                      />

                      <PremiumSelect
                        label="Educational Board"
                        value={selectedBoard}
                        onChange={(e) => setSelectedBoard(e.target.value)}
                        options={[
                          { value: "", label: "Select Board" },
                          ...boards.map(board => ({ value: board, label: board }))
                        ]}
                        variant="glass"
                      />

                      <PremiumSelect
                        label="Class"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        options={[
                          { value: "", label: "Select Class" },
                          ...classes.map(cls => ({ value: cls, label: `Class ${cls}` }))
                        ]}
                        variant="glass"
                      />

                      <PremiumSelect
                        label="Subject"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        options={[
                          { value: "", label: "Select Subject" },
                          ...subjects.map(subject => ({ value: subject, label: subject }))
                        ]}
                        variant="glass"
                      />

                      <PremiumInput
                        label="Chapter (Optional)"
                        placeholder="e.g., Chapter 1: Introduction"
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        variant="glass"
                      />
                    </div>
                  </div>

                  {/* Premium File Upload Area */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UploadIcon size={20} className="text-blue-500" />
                      File Upload
                    </h3>

                    {uploading ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <PremiumCard variant="glass" className="p-6">
                          <div className="text-center space-y-4">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <LoaderIcon size={48} className="mx-auto text-primary" />
                            </motion.div>
                            <div>
                              <p className="text-lg font-semibold">Uploading Content...</p>
                              <Progress
                                value={uploadProgress}
                                className="mt-4"
                              />
                              <p className="text-sm text-muted-foreground mt-2">
                                {Math.round(uploadProgress)}% complete
                              </p>
                            </div>
                          </div>
                        </PremiumCard>
                      </motion.div>
                    ) : (
                      <PremiumUpload
                        onFileSelect={(files) => {
                          const file = files[0];
                          if (file) {
                            // Call handleFileUpload with a mock event
                            handleFileUpload({
                              target: { files: [file] }
                            } as any);
                          }
                        }}
                        accept=".pdf"
                        variant="document"
                        maxSize={50}
                        disabled={!selectedType || !selectedBoard || !selectedClass || !selectedSubject || !isAdmin}
                        className="min-h-[200px]"
                      />
                    )}
                  </div>

                  {/* Premium Upload Guidelines */}
                  <PremiumCard variant="glass" className="bg-blue-500/5 border-blue-500/20">
                    <PremiumCardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircleIcon size={18} className="text-blue-500" />
                        Upload Guidelines
                      </h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Only PDF files are accepted for educational content
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Maximum file size: 50MB per document
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Files are processed automatically with AI enhancement
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Content becomes available instantly after processing
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Ensure correct classification for optimal organization
                        </li>
                      </ul>
                    </PremiumCardContent>
                  </PremiumCard>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </TabsContent>

          {/* Premium Manage Tab */}
          <TabsContent value="manage">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PremiumCard variant="glass" glow={true}>
                <PremiumCardHeader>
                  <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <FolderIcon size={24} className="text-green-500" />
                    </div>
                    Content Library
                  </PremiumCardTitle>
                  <PremiumCardDescription className="text-base">
                    Browse and manage your uploaded educational content with advanced filtering
                  </PremiumCardDescription>

                  {/* Premium Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <PremiumSelect
                      label="Filter by Type"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      options={[
                        { value: "", label: "All Types" },
                        ...contentTypes
                      ]}
                      variant="glass"
                    />

                    <PremiumSelect
                      label="Filter by Class"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      options={[
                        { value: "", label: "All Classes" },
                        ...classes.map(cls => ({ value: cls, label: `Class ${cls}` }))
                      ]}
                      variant="glass"
                    />

                    <PremiumSelect
                      label="Filter by Subject"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      options={[
                        { value: "", label: "All Subjects" },
                        ...subjects.map(subject => ({ value: subject, label: subject }))
                      ]}
                      variant="glass"
                    />
                  </div>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredFiles.map((file, index) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <PremiumCard variant="glass" className="hover:shadow-premium transition-all duration-300">
                            <PremiumCardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-blue-500/20 rounded-lg">
                                    <FileTextIcon size={24} className="text-blue-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{file.filename}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                      <span className="px-2 py-1 bg-primary/10 rounded-md">Class {file.class}</span>
                                      <span className="px-2 py-1 bg-green-500/10 rounded-md">{file.subject}</span>
                                      {file.chapter && (
                                        <span className="px-2 py-1 bg-blue-500/10 rounded-md">{file.chapter}</span>
                                      )}
                                      <span className="px-2 py-1 bg-gray-500/10 rounded-md">{formatFileSize(file.fileSize)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(file.status)}
                                    <Badge className={cn(
                                      "capitalize",
                                      file.status === 'completed' && "bg-green-500/20 text-green-500 border-green-500/20",
                                      file.status === 'processing' && "bg-blue-500/20 text-blue-500 border-blue-500/20",
                                      file.status === 'error' && "bg-red-500/20 text-red-500 border-red-500/20"
                                    )}>
                                      {file.status}
                                    </Badge>
                                  </div>

                                  <div className="flex gap-2">
                                    {file.downloadUrl && (
                                      <GlassButton
                                        size="sm"
                                        onClick={() => window.open(file.downloadUrl, '_blank')}
                                      >
                                        <DownloadIcon size={16} className="mr-1" />
                                        Download
                                      </GlassButton>
                                    )}
                                    {isAdmin && (
                                      <GlassButton
                                        size="sm"
                                        onClick={() => handleDelete(file.id)}
                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/20"
                                      >
                                        <TrashIcon size={16} />
                                      </GlassButton>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </PremiumCardContent>
                          </PremiumCard>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredFiles.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <PremiumCard variant="glass" className="p-8">
                          <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-6">
                            <FileTextIcon size={48} className="text-muted-foreground" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3">No Content Found</h3>
                          <p className="text-muted-foreground mb-6">
                            Upload some PDF files to get started with your content library.
                          </p>
                          <GradientButton
                            gradient="primary"
                            onClick={() => {
                              // Switch to upload tab
                              const uploadTab = document.querySelector('[value="upload"]') as HTMLElement;
                              uploadTab?.click();
                            }}
                          >
                            <UploadIcon size={18} className="mr-2" />
                            Upload Content
                          </GradientButton>
                        </PremiumCard>
                      </motion.div>
                    )}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ContentManager;
