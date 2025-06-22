import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import { Upload, FileText, Brain, Sparkles, CheckCircle, AlertCircle, Eye, Edit } from 'lucide-react';
import { config } from '../config';
import { useAuth } from '../hooks/useAuth';

interface UploadStatus {
  processingId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  filename: string;
  metadata: any;
  totalQuestions?: number;
  sessionId?: string;
}

export default function AdminPDFUpload() {
  const { user } = useAuth();
  const [uploadData, setUploadData] = useState({
    board: 'cbse',
    class: '10',
    subject: 'science',
    chapter: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [processingHistory, setProcessingHistory] = useState<UploadStatus[]>([]);
  const [extractedQA, setExtractedQA] = useState<any[]>([]);
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
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required for PDF upload.",
        variant: "destructive",
      });
      return;
    }

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
    setExtractedQA([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('board', uploadData.board);
      formData.append('class', uploadData.class);
      formData.append('subject', uploadData.subject);
      formData.append('chapter', uploadData.chapter);

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/upload-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadStatus({
          processingId: result.sessionId,
          status: 'completed',
          progress: 100,
          message: `Successfully extracted ${result.totalQuestions} Q&A pairs. Ready for review.`,
          filename: selectedFile.name,
          metadata: result.metadata,
          totalQuestions: result.totalQuestions,
          sessionId: result.sessionId
        });

        setExtractedQA(result.qaPairs);

        toast({
          title: "Upload Successful!",
          description: `Extracted ${result.totalQuestions} Q&A pairs. Please review before uploading to Firebase.`,
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        processingId: '',
        status: 'failed',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed',
        filename: selectedFile?.name || 'Unknown',
        metadata: uploadData
      });
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReviewAndUpload = async () => {
    if (!uploadStatus?.sessionId) {
      toast({
        title: "No Session",
        description: "No upload session found. Please upload a PDF first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/admin-review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: uploadStatus.sessionId,
          qaPairs: extractedQA,
          metadata: uploadStatus.metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload to Firebase failed');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success! 🎉",
          description: `Successfully uploaded ${result.totalQuestions} Q&A pairs to Firebase!`,
        });

        // Reset form
        setSelectedFile(null);
        setUploadStatus(null);
        setExtractedQA([]);
        setUploadData({
          board: 'cbse',
          class: '10',
          subject: 'science',
          chapter: ''
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
       throw new Error(result.message || 'Upload to Firebase failed');
      }

    } catch (error) {
      console.error('Firebase upload error:', error);
       toast({
        title: "Firebase Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload to Firebase',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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

        {/* Q&A Review Section */}
        {extractedQA.length > 0 && uploadStatus?.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Review Q&A Pairs ({extractedQA.length})</span>
              </CardTitle>
              <CardDescription>
                Review and edit the extracted question-answer pairs before uploading to Firebase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-4">
                {extractedQA.map((qa, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">
                        Question {qa.questionNumber || index + 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newQA = extractedQA.filter((_, i) => i !== index);
                          setExtractedQA(newQA);
                          toast({
                            title: "Question Removed",
                            description: `Removed question ${qa.questionNumber || index + 1}`,
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`question-${index}`}>Question:</Label>
                      <textarea
                        id={`question-${index}`}
                        className="w-full p-2 border rounded-md min-h-[60px] resize-none"
                        value={qa.question}
                        onChange={(e) => {
                          const newQA = [...extractedQA];
                          newQA[index].question = e.target.value;
                          setExtractedQA(newQA);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`answer-${index}`}>Answer:</Label>
                      <textarea
                        id={`answer-${index}`}
                        className="w-full p-2 border rounded-md min-h-[80px] resize-none"
                        value={qa.answer}
                        onChange={(e) => {
                          const newQA = [...extractedQA];
                          newQA[index].answer = e.target.value;
                          setExtractedQA(newQA);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={handleReviewAndUpload}
                  disabled={isUploading || extractedQA.length === 0}
                  className="flex-1"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading to Firebase...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Upload {extractedQA.length} Q&A Pairs to Firebase
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Preview JSON:', {
                      metadata: uploadStatus?.metadata,
                      qaPairs: extractedQA,
                      totalQuestions: extractedQA.length
                    });
                    toast({
                      title: "Preview Generated",
                      description: "Check browser console for JSON preview",
                    });
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Preview JSON
                </Button>
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