import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Upload, FileText, CheckCircle, XCircle, Eye, Clock, AlertTriangle } from 'lucide-react';
import { config } from '../config';

interface PendingReview {
  id: string;
  processingId: string;
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

interface UploadStatus {
  status: string;
  progress: number;
  message: string;
  solutionId?: string;
  totalQuestions?: number;
}

export default function AdminPDFReview() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    board: '',
    class: '',
    subject: '',
    chapter: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  // Fetch pending reviews
  const fetchPendingReviews = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/admin-pdf-upload?action=pending-reviews`);
      if (!response.ok) throw new Error('Failed to fetch pending reviews');
      
      const data = await response.json();
      setPendingReviews(data.pendingReviews || []);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file || !metadata.board || !metadata.class || !metadata.subject || !metadata.chapter) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('board', metadata.board);
      formData.append('class', metadata.class);
      formData.append('subject', metadata.subject);
      formData.append('chapter', metadata.chapter);

      const response = await fetch(`${config.apiUrl}/admin-pdf-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Poll for status updates
      pollUploadStatus(data.processingId);

      toast({
        title: "Upload Started",
        description: "PDF processing has begun. Please wait...",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Poll upload status
  const pollUploadStatus = async (processingId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/admin-pdf-upload?action=status&id=${processingId}`);
        if (!response.ok) return;

        const status = await response.json();
        setUploadStatus(status);

        if (status.status === 'ready_for_review') {
          fetchPendingReviews(); // Refresh pending reviews
          toast({
            title: "Processing Complete",
            description: `PDF processed successfully! ${status.totalQuestions} questions extracted and ready for review.`,
          });
        } else if (status.status === 'failed') {
          toast({
            title: "Processing Failed",
            description: status.message || 'PDF processing failed',
            variant: "destructive",
          });
        } else if (status.progress < 100) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    };

    poll();
  };

  // View review details
  const viewReviewDetails = async (reviewId: string) => {
    setReviewLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/admin-pdf-upload?action=review-details&id=${reviewId}`);
      if (!response.ok) throw new Error('Failed to fetch review details');
      
      const data = await response.json();
      setSelectedReview(data.review);
    } catch (error) {
      console.error('Error fetching review details:', error);
      toast({
        title: "Error",
        description: "Failed to load review details",
        variant: "destructive",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  // Approve or reject review
  const handleReviewDecision = async (reviewId: string, approved: boolean) => {
    try {
      const response = await fetch(`${config.apiUrl}/admin-pdf-upload?action=approve-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          approved
        }),
      });

      if (!response.ok) throw new Error('Failed to process review decision');

      toast({
        title: approved ? "Review Approved" : "Review Rejected",
        description: approved 
          ? "Solution has been added to the database" 
          : "Review has been rejected and removed",
      });

      // Refresh pending reviews and close detail view
      fetchPendingReviews();
      setSelectedReview(null);

    } catch (error) {
      console.error('Review decision error:', error);
      toast({
        title: "Error",
        description: "Failed to process review decision",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            PDF Upload & Review System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload PDF files, extract Q&A pairs, and review before publishing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload PDF</span>
              </CardTitle>
              <CardDescription>
                Upload a PDF file to extract Q&A pairs for review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium mb-2">PDF File</label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {file && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              {/* Processing Error Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">PDF Processing Setup Required</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      PDF text extraction is not yet configured. Please install a PDF parsing library (like pdf-parse) to enable actual PDF processing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Board</label>
                  <Select value={metadata.board} onValueChange={(value) => setMetadata({...metadata, board: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="NCERT">NCERT</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <Select value={metadata.class} onValueChange={(value) => setMetadata({...metadata, class: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Select value={metadata.subject} onValueChange={(value) => setMetadata({...metadata, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Social Science">Social Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chapter</label>
                <Input
                  placeholder="Enter chapter name"
                  value={metadata.chapter}
                  onChange={(e) => setMetadata({...metadata, chapter: e.target.value})}
                  disabled={uploading}
                />
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Processing...' : 'Upload & Process PDF'}
              </Button>

              {/* Upload Status */}
              {uploadStatus && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Processing Status</span>
                      <Badge variant={uploadStatus.status === 'ready_for_review' ? 'default' : 'secondary'}>
                        {uploadStatus.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{uploadStatus.message}</p>
                    {uploadStatus.progress >= 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadStatus.progress}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pending Reviews ({pendingReviews.length})</span>
              </CardTitle>
              <CardDescription>
                Review extracted Q&A pairs before publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending reviews</p>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{review.metadata.chapter}</h4>
                          <p className="text-sm text-gray-500">
                            {review.metadata.board} • Class {review.metadata.class} • {review.metadata.subject}
                          </p>
                          <p className="text-sm text-gray-500">
                            {review.totalQuestions} questions • {review.filename}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewReviewDetails(review.id)}
                          disabled={reviewLoading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Details */}
        {selectedReview && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Review: {selectedReview.metadata.chapter}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReviewDecision(selectedReview.id, false)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleReviewDecision(selectedReview.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {selectedReview.totalQuestions} questions extracted from {selectedReview.filename}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-4">
                {selectedReview.qaPairs.map((qa, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">Q{qa.questionNumber}</h4>
                      <Badge variant="outline">
                        Confidence: {(qa.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-sm mb-3 text-gray-800 dark:text-gray-200">
                      <strong>Question:</strong> {qa.question}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Answer:</strong> {qa.answer}
                    </p>
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