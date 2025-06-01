import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VectorUpload from '@/components/VectorUpload';
import VectorDBTest from '@/components/VectorDBTest';
import { useAuth } from '@/hooks/useAuth';
import { 
  Upload, 
  Database, 
  Search, 
  MessageSquare, 
  BookOpen, 
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PDFProcessingResult } from '@/lib/pdfProcessor';

const VectorUploadPage: React.FC = () => {
  const { user } = useAuth();
  const [uploadResults, setUploadResults] = useState<PDFProcessingResult[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  const handleUploadComplete = (results: PDFProcessingResult[]) => {
    setUploadResults(results);
    // Auto-switch to test tab after successful upload
    if (results.some(r => r.success)) {
      setActiveTab('test');
    }
  };

  const steps = [
    {
      icon: Upload,
      title: "Upload Documents",
      description: "Upload your PDFs, notes, and study materials",
      status: uploadResults.length > 0 ? 'completed' : 'current'
    },
    {
      icon: Database,
      title: "Vector Processing",
      description: "Documents are processed and stored in vector database",
      status: uploadResults.some(r => r.success) ? 'completed' : 'pending'
    },
    {
      icon: Search,
      title: "Search & Test",
      description: "Test search functionality with your uploaded content",
      status: 'pending'
    },
    {
      icon: MessageSquare,
      title: "AI Integration",
      description: "Get personalized AI responses from your materials",
      status: 'pending'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Vector Database Upload | LearnQuest - AI-Powered Learning</title>
        <meta name="description" content="Upload your study materials to create a personalized AI knowledge base. Get AI tutoring based on your own documents." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Vector Database Upload
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your study materials into an AI-powered knowledge base. 
            Upload documents and get personalized tutoring based on your own content.
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Upload Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : step.status === 'current'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground absolute transform translate-x-16" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload Results Summary */}
        {uploadResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadResults.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful Uploads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {uploadResults.reduce((sum, r) => sum + (r.chunks || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Chunks Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {uploadResults.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed Uploads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Test Database
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              How to Use
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <VectorUpload
              userId={user?.uid || 'demo-user'}
              userEmail={user?.email || ''}
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <VectorDBTest userId={user?.uid || 'demo-user'} />
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Supported File Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>PDF Documents</span>
                    <Badge variant="default">Recommended</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Word Documents (.doc, .docx)</span>
                    <Badge variant="secondary">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Text Files (.txt)</span>
                    <Badge variant="secondary">Supported</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-4">
                    Maximum file size: 50MB per file
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">For Best Results:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use clear, descriptive titles</li>
                      <li>• Select the correct subject</li>
                      <li>• Add chapter information when available</li>
                      <li>• Upload high-quality, text-readable PDFs</li>
                      <li>• Organize by subject for better search</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* How AI Uses Your Documents */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    How AI Uses Your Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Search className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Smart Search</h4>
                      <p className="text-sm text-muted-foreground">
                        AI searches through your documents to find relevant content for your questions
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">Contextual Answers</h4>
                      <p className="text-sm text-muted-foreground">
                        Get answers based specifically on your uploaded study materials
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium">Personalized Learning</h4>
                      <p className="text-sm text-muted-foreground">
                        AI tutors reference your specific textbooks and notes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Next Steps */}
        {uploadResults.some(r => r.success) && (
          <Card>
            <CardHeader>
              <CardTitle>🎉 Upload Successful! What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab('test')} 
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    <span className="font-medium">Test Your Database</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Search through your uploaded documents to see how it works
                  </span>
                </Button>
                <Button 
                  onClick={() => window.location.href = '/chat'} 
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">Try AI Tutors</span>
                  </div>
                  <span className="text-sm text-white/80">
                    Ask questions and get answers from your uploaded materials
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default VectorUploadPage;
