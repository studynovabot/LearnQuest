import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import { Upload, FileText, Brain, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { config } from '../config';

interface UploadStatus {
  processingId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  filename: string;
  metadata: any;
  totalQuestions?: number;
}

export default function AdminPDFUpload() {
  const [uploadData, setUploadData] = useState({
    board: '',
    class: '',
    subject: '',
    chapter: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [processingHistory, setProcessingHistory] = useState<UploadStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setUploadData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        toast({
          title: "File Selected",
          description: `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file only.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = ['board', 'class', 'subject', 'chapter'];
    const missingFields = requiredFields.filter(field => !uploadData[field as keyof typeof uploadData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('board', uploadData.board);
      formData.append('class', uploadData.class);
      formData.append('subject', uploadData.subject);
      formData.append('chapter', uploadData.chapter);

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/admin-pdf-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setUploadStatus({
        processingId: result.processingId,
        status: 'processing',
        progress: 0,
        message: 'Upload successful, processing started...',
        filename: result.filename,
        metadata: result.metadata
      });

      // Start polling for progress
      pollProcessingStatus(result.processingId);

      toast({
        title: "Upload Successful! 🎉",
        description: "PDF uploaded successfully. Processing Q&A extraction...",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const pollProcessingStatus = async (processingId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${config.apiUrl}/admin-pdf-upload?action=status&id=${processingId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (response.ok) {
          const status = await response.json();
          setUploadStatus(status);

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setProcessingHistory(prev => [...prev, status]);
            toast({
              title: "Processing Completed! ✅",
              description: `Successfully extracted ${status.totalQuestions} Q&A pairs`,
            });
            
            // Reset form
            setSelectedFile(null);
            setUploadData({ board: '', class: '', subject: '', chapter: '' });
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            toast({
              title: "Processing Failed",
              description: status.message || 'PDF processing failed',
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Smart PDF Upload & AI Processing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload educational PDFs to automatically extract Q&A pairs and enable AI explanations
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Educational PDF</span>
            </CardTitle>
            <CardDescription>
              Select a PDF file and provide metadata to automatically extract questions and answers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Metadata Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Select value={uploadData.board} onValueChange={(value) => handleInputChange('board', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="NCERT">NCERT</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={uploadData.class} onValueChange={(value) => handleInputChange('class', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={uploadData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Social Science">Social Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter Name</Label>
                <Input
                  id="chapter"
                  placeholder="e.g., Chemical Reactions and Equations"
                  value={uploadData.chapter}
                  onChange={(e) => handleInputChange('chapter', e.target.value)}
                />
              </div>
            </div>

            {/* File Selection */}
            <div className="space-y-2">
              <Label htmlFor="pdf-file">PDF File</Label>
              <div className="flex items-center space-x-4">
                <Input
                  ref={fileInputRef}
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                {selectedFile && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Process PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {uploadStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {uploadStatus.status === 'processing' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
                {uploadStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {uploadStatus.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                <span>Processing Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadStatus.message}</span>
                  <span>{uploadStatus.progress}%</span>
                </div>
                <Progress value={uploadStatus.progress} className="w-full" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>File:</strong> {uploadStatus.filename}
                </div>
                <div>
                  <strong>Status:</strong> {uploadStatus.status}
                </div>
                {uploadStatus.totalQuestions && (
                  <div>
                    <strong>Q&A Pairs:</strong> {uploadStatus.totalQuestions}
                  </div>
                )}
                <div>
                  <strong>Board:</strong> {uploadStatus.metadata?.board}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing History */}
        {processingHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Processing History</CardTitle>
              <CardDescription>Recently processed PDF files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">{item.filename}</div>
                        <div className="text-sm text-gray-500">
                          {item.metadata?.board} • Class {item.metadata?.class} • {item.metadata?.subject}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{item.totalQuestions} Q&A pairs</div>
                      <div className="text-gray-500">Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}