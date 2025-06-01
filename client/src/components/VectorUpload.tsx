import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader, BookOpen, Database, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pdfProcessor, validateFile, FileMetadata, PDFProcessingResult } from '../lib/pdfProcessor';
import { useToast } from '@/hooks/use-toast';

interface VectorUploadProps {
  userId: string;
  userEmail?: string;
  onUploadComplete?: (results: PDFProcessingResult[]) => void;
}

interface FileWithMetadata {
  file: File;
  metadata: FileMetadata;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: PDFProcessingResult;
}

const VectorUpload: React.FC<VectorUploadProps> = ({ userId, userEmail, onUploadComplete }) => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'Hindi', 'History', 'Geography', 'Political Science', 'Economics',
    'Computer Science', 'General'
  ];

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithMetadata[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validation = validateFile(file);
      
      if (validation.valid) {
        newFiles.push({
          file,
          metadata: {
            title: file.name.replace(/\.[^/.]+$/, ''),
            subject: 'General',
            tags: []
          },
          status: 'pending'
        });
      } else {
        newFiles.push({
          file,
          metadata: {
            title: file.name,
            subject: 'General',
            tags: []
          },
          status: 'error',
          error: validation.error
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Update file metadata
  const updateFileMetadata = (index: number, metadata: Partial<FileMetadata>) => {
    setFiles(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, metadata: { ...item.metadata, ...metadata } }
        : item
    ));
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to vector database
  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const results: PDFProcessingResult[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const fileItem = validFiles[i];
        
        // Update status to uploading
        setFiles(prev => prev.map(item => 
          item.file === fileItem.file 
            ? { ...item, status: 'uploading' as const }
            : item
        ));

        // Process the file
        const result = await pdfProcessor.processPDF(
          fileItem.file,
          fileItem.metadata,
          userId,
          userEmail
        );

        results.push(result);

        // Update file status based on result
        setFiles(prev => prev.map(item => 
          item.file === fileItem.file 
            ? { 
                ...item, 
                status: result.success ? 'success' : 'error',
                error: result.error,
                result: result
              }
            : item
        ));

        if (result.success) {
          toast({
            title: "Upload Successful!",
            description: `${fileItem.metadata.title} uploaded and processed into ${result.chunks} chunks.`
          });
        } else {
          toast({
            title: "Upload Failed",
            description: result.error,
            variant: "destructive"
          });
        }
      }

      if (onUploadComplete) {
        onUploadComplete(results);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Upload to Vector Database
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload your study materials to create a personalized AI knowledge base. 
            Your documents will be processed and made searchable for AI tutoring.
          </p>
        </CardHeader>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Upload Study Materials
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="vector-file-upload"
            />
            <Button asChild>
              <label htmlFor="vector-file-upload" className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                Select Files
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: PDF, DOC, DOCX, TXT (Max 50MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((fileItem, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{fileItem.file.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {fileItem.status === 'success' && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    {fileItem.status === 'error' && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    )}
                    {fileItem.status === 'uploading' && (
                      <Badge variant="secondary">
                        <Loader className="h-3 w-3 mr-1 animate-spin" />
                        Processing...
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Success Info */}
                {fileItem.status === 'success' && fileItem.result && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-800">
                      ✅ Successfully processed into {fileItem.result.chunks} chunks and stored in vector database
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {fileItem.status === 'error' && fileItem.error && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-800">{fileItem.error}</p>
                  </div>
                )}

                {/* Metadata Form */}
                {fileItem.status === 'pending' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        value={fileItem.metadata.title}
                        onChange={(e) => updateFileMetadata(index, { title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <select
                        value={fileItem.metadata.subject}
                        onChange={(e) => updateFileMetadata(index, { subject: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Chapter (Optional)</label>
                      <input
                        type="text"
                        value={fileItem.metadata.chapter || ''}
                        onChange={(e) => updateFileMetadata(index, { chapter: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Chapter 1"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Upload Button */}
            {files.some(f => f.status === 'pending') && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" />
                      Processing Files...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Upload to Vector Database
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Search className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">How it works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your documents are processed and split into searchable chunks</li>
                <li>• AI tutors can reference your specific study materials</li>
                <li>• Get personalized answers based on your uploaded content</li>
                <li>• Search through all your documents instantly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorUpload;
