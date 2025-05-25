import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UploadIcon, FileTextIcon, TrashIcon, DownloadIcon, CheckCircleIcon, LoaderIcon } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UploadedContent {
  id: string;
  filename: string;
  type: 'flash-notes' | 'flow-charts' | 'ncert-solutions';
  class: string;
  subject: string;
  chapter?: string;
  uploadDate: string;
  fileSize: number;
  status: 'processing' | 'completed' | 'error';
  downloadUrl?: string;
}

const ContentManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedContent[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  const contentTypes = [
    { value: 'flash-notes', label: 'Flash Notes' },
    { value: 'flow-charts', label: 'Flow Charts' },
    { value: 'ncert-solutions', label: 'NCERT Solutions' }
  ];

  useEffect(() => {
    fetchUploadedContent();
  }, []);

  const fetchUploadedContent = async () => {
    try {
      const response = await fetch('/api/content-manager', {
        headers: {
          'x-user-id': user?.uid || 'admin'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedType || !selectedClass || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select content type, class, and subject before uploading.",
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
      xhr.setRequestHeader('x-user-id', user?.uid || 'admin');
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
          'x-user-id': user?.uid || 'admin'
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

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileTextIcon size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">Content Manager</h1>
          </div>
          <p className="text-muted-foreground">
            Upload and manage PDFs for flash notes, flow charts, and NCERT solutions
          </p>
        </motion.div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="upload">Upload Content</TabsTrigger>
            <TabsTrigger value="manage">Manage Content</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadIcon size={24} />
                  Upload Educational Content
                </CardTitle>
                <p className="text-muted-foreground">
                  Upload PDF files for flash notes, flow charts, and NCERT solutions
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Chapter (optional)"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                  />
                </div>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  {uploading ? (
                    <div className="space-y-4">
                      <LoaderIcon size={48} className="mx-auto text-primary animate-spin" />
                      <div>
                        <p className="text-lg font-semibold">Uploading...</p>
                        <Progress value={uploadProgress} className="mt-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {Math.round(uploadProgress)}% complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold mb-2">Upload PDF Files</p>
                      <p className="text-muted-foreground mb-4">
                        Drag and drop your PDF files here, or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading || !selectedType || !selectedClass || !selectedSubject}
                      />
                      <label htmlFor="file-upload">
                        <Button 
                          asChild
                          disabled={uploading || !selectedType || !selectedClass || !selectedSubject}
                        >
                          <span className="cursor-pointer">Choose PDF File</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {/* Upload Instructions */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Upload Guidelines:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Only PDF files are accepted</li>
                    <li>• Maximum file size: 50MB</li>
                    <li>• Files will be processed automatically after upload</li>
                    <li>• Content will be available in the respective sections once processed</li>
                    <li>• Make sure to select the correct content type, class, and subject</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Content</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {contentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Classes</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileTextIcon size={24} className="text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{file.filename}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Class {file.class}</span>
                              <span>•</span>
                              <span>{file.subject}</span>
                              {file.chapter && (
                                <>
                                  <span>•</span>
                                  <span>{file.chapter}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{formatFileSize(file.fileSize)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(file.status)}
                            <Badge className={getStatusColor(file.status)}>
                              {file.status}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            {file.downloadUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={file.downloadUrl} download>
                                  <DownloadIcon size={16} />
                                </a>
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDelete(file.id)}
                            >
                              <TrashIcon size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {filteredFiles.length === 0 && (
                    <div className="text-center py-12">
                      <FileTextIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
                      <p className="text-muted-foreground">
                        Upload some PDF files to get started.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ContentManager;
