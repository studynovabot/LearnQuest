import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit2, 
  Save, 
  X, 
  AlertTriangle,
  Clock,
  Brain,
  Sparkles,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';
import { config } from '../config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/ui/alert";

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
  updatedAt?: string;
}

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
  extractedText?: string;
}

export default function EnhancedAdminPDFReview() {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  // Fetch pending reviews
  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/admin-pdf-upload?action=pending-reviews`);
      if (!response.ok) throw new Error('Failed to fetch pending reviews');
      
      const data = await response.json();
      setPendingReviews(data.pendingReviews || []);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // View review details
  const viewReviewDetails = async (reviewId: string) => {
    setReviewLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/admin-pdf-upload?action=review-details&id=${reviewId}`);
      if (!response.ok) throw new Error('Failed to fetch review details');
      
      const data = await response.json();
      setSelectedReview(data.review);
      setIsDialogOpen(true);
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

  // Start editing a Q&A pair
  const startEditing = (index: number, question: string, answer: string) => {
    setEditingQuestion(index);
    setEditedQuestion(question);
    setEditedAnswer(answer);
  };

  // Save edited Q&A pair
  const saveEditedQA = async (index: number) => {
    if (!selectedReview) return;

    try {
      const response = await fetch(`${config.apiUrl}/admin-pdf-upload?action=update-qa-pair`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          questionIndex: index,
          updatedPair: {
            question: editedQuestion.trim(),
            answer: editedAnswer.trim(),
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to update Q&A pair');

      const result = await response.json();
      
      // Update local state
      const updatedReview = { ...selectedReview };
      updatedReview.qaPairs[index] = {
        ...updatedReview.qaPairs[index],
        question: editedQuestion.trim(),
        answer: editedAnswer.trim(),
        updatedAt: new Date().toISOString()
      };
      
      setSelectedReview(updatedReview);
      setEditingQuestion(null);
      
      toast({
        title: "Success",
        description: "Q&A pair updated successfully",
      });

    } catch (error) {
      console.error('Error updating Q&A pair:', error);
      toast({
        title: "Error",
        description: "Failed to update Q&A pair",
        variant: "destructive",
      });
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingQuestion(null);
    setEditedQuestion('');
    setEditedAnswer('');
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
          approved,
          updatedQAPairs: selectedReview?.qaPairs
        }),
      });

      if (!response.ok) throw new Error('Failed to process review decision');

      const result = await response.json();

      toast({
        title: approved ? "Review Approved! 🎉" : "Review Rejected",
        description: approved 
          ? `Solution has been uploaded to Firebase and is now available to Pro/Goat users` 
          : "Review has been rejected and removed",
      });

      // Refresh pending reviews and close dialog
      fetchPendingReviews();
      setIsDialogOpen(false);
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

  // Add new Q&A pair
  const addNewQAPair = () => {
    if (!selectedReview) return;

    const newPair: QAPair = {
      board: selectedReview.metadata.board,
      class: selectedReview.metadata.class,
      subject: selectedReview.metadata.subject,
      chapter: selectedReview.metadata.chapter,
      question: 'New question...',
      answer: 'New answer...',
      questionNumber: selectedReview.qaPairs.length + 1,
      extractedAt: new Date().toISOString(),
      confidence: 0.8
    };

    const updatedReview = {
      ...selectedReview,
      qaPairs: [...selectedReview.qaPairs, newPair],
      totalQuestions: selectedReview.qaPairs.length + 1
    };

    setSelectedReview(updatedReview);
    
    // Start editing the new question immediately
    startEditing(updatedReview.qaPairs.length - 1, newPair.question, newPair.answer);
  };

  // Remove Q&A pair
  const removeQAPair = (index: number) => {
    if (!selectedReview) return;

    const updatedReview = {
      ...selectedReview,
      qaPairs: selectedReview.qaPairs.filter((_, i) => i !== index),
      totalQuestions: selectedReview.qaPairs.length - 1
    };

    setSelectedReview(updatedReview);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge className="bg-green-500">High ({Math.round(confidence * 100)}%)</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge className="bg-yellow-500">Medium ({Math.round(confidence * 100)}%)</Badge>;
    } else {
      return <Badge className="bg-red-500">Low ({Math.round(confidence * 100)}%)</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Enhanced PDF Review System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Review and edit extracted Q&A pairs before publishing to Firebase
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Pending Reviews</h2>
          <Button 
            onClick={fetchPendingReviews} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading pending reviews...</p>
            </CardContent>
          </Card>
        )}

        {/* No Pending Reviews */}
        {!loading && pendingReviews.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Pending Reviews
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload some PDFs to see them here for review.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pending Reviews List */}
        {!loading && pendingReviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{review.metadata.chapter}</span>
                    <Badge variant="outline">
                      {review.totalQuestions} Q&As
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {review.metadata.board} • Class {review.metadata.class} • {review.metadata.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>File:</strong> {review.filename}</p>
                    <p><strong>Processed:</strong> {new Date(review.processedAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                      <Badge className="ml-2 bg-orange-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </Badge>
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => viewReviewDetails(review.id)}
                    className="w-full"
                    disabled={reviewLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review & Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Review: {selectedReview?.metadata.chapter}</span>
              </DialogTitle>
              <DialogDescription>
                {selectedReview?.metadata.board} • Class {selectedReview?.metadata.class} • {selectedReview?.metadata.subject}
              </DialogDescription>
            </DialogHeader>

            {selectedReview && (
              <div className="space-y-6">
                
                {/* Metadata Info */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Review Information</AlertTitle>
                  <AlertDescription>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div><strong>File:</strong> {selectedReview.filename}</div>
                      <div><strong>Total Questions:</strong> {selectedReview.qaPairs.length}</div>
                      <div><strong>Processed:</strong> {new Date(selectedReview.processedAt).toLocaleString()}</div>
                      <div>
                        <strong>Avg Confidence:</strong> {' '}
                        {getConfidenceBadge(
                          selectedReview.qaPairs.reduce((sum, pair) => sum + pair.confidence, 0) / selectedReview.qaPairs.length
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setPreviewMode(!previewMode)}
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {previewMode ? 'Edit Mode' : 'Preview Mode'}
                    </Button>
                    <Button 
                      onClick={addNewQAPair}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {selectedReview.qaPairs.length} Questions
                  </div>
                </div>

                {/* Q&A Pairs */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedReview.qaPairs.map((pair, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            {getConfidenceBadge(pair.confidence)}
                            {pair.updatedAt && (
                              <Badge className="bg-green-100 text-green-800">
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edited
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {editingQuestion === index ? (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => saveEditedQA(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={cancelEditing}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => startEditing(index, pair.question, pair.answer)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => removeQAPair(index)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingQuestion === index ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question:</label>
                              <Textarea
                                value={editedQuestion}
                                onChange={(e) => setEditedQuestion(e.target.value)}
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer:</label>
                              <Textarea
                                value={editedAnswer}
                                onChange={(e) => setEditedAnswer(e.target.value)}
                                className="mt-1"
                                rows={4}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question:</label>
                              <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                {pair.question}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer:</label>
                              <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                {pair.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedReview(null);
                }}
              >
                Close
              </Button>
              <div className="space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => selectedReview && handleReviewDecision(selectedReview.id, false)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => selectedReview && handleReviewDecision(selectedReview.id, true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Upload to Firebase
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}