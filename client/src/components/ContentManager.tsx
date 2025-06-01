import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Download,
  Eye,
  BookOpen,
  Database,
  Plus,
  RefreshCw
} from 'lucide-react';
import FileUpload from './FileUpload';
import { pdfProcessor, PDFProcessingResult } from '../lib/pdfProcessor';
import { VectorDocument, SearchResult } from '../lib/vectorDatabase';

interface ContentManagerProps {
  userId: string;
}

const ContentManager: React.FC<ContentManagerProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'search'>('upload');
  const [documents, setDocuments] = useState<VectorDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    totalDocuments: 0,
    totalChunks: 0,
    subjects: [] as string[]
  });

  // Load user documents on component mount
  useEffect(() => {
    loadUserDocuments();
    loadUploadStats();
  }, [userId]);

  // Load user's uploaded documents
  const loadUserDocuments = async () => {
    setIsLoading(true);
    try {
      const result = await pdfProcessor.getUserDocuments(userId);
      setDocuments(result.documents);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load upload statistics
  const loadUploadStats = async () => {
    try {
      const result = await pdfProcessor.getUserDocuments(userId, 1, 1000);
      const subjects = [...new Set(result.documents.map(doc => doc.metadata.subject))];
      
      setUploadStats({
        totalDocuments: result.total,
        totalChunks: result.documents.length,
        subjects: subjects
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle file upload completion
  const handleUploadComplete = (results: PDFProcessingResult[]) => {
    const successCount = results.filter(r => r.success).length;
    const totalChunks = results.reduce((sum, r) => sum + (r.chunks || 0), 0);
    
    if (successCount > 0) {
      // Refresh documents and stats
      loadUserDocuments();
      loadUploadStats();
      
      // Show success message
      alert(`Successfully uploaded ${successCount} documents with ${totalChunks} chunks!`);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const filters = selectedSubject !== 'all' ? { subject: selectedSubject, userId } : { userId };
      const results = await pdfProcessor.searchDocuments(searchQuery, filters);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const success = await pdfProcessor.deleteDocument(documentId);
      if (success) {
        loadUserDocuments();
        loadUploadStats();
        alert('Document deleted successfully!');
      } else {
        alert('Failed to delete document.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document.');
    }
  };

  const subjects = [
    'all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'Hindi', 'History', 'Geography', 'Political Science', 'Economics',
    'Computer Science', 'General'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="mr-3 h-8 w-8 text-blue-600" />
              Content Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Upload, manage, and search your educational documents
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex space-x-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{uploadStats.totalDocuments}</div>
              <div className="text-sm text-gray-500">Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{uploadStats.totalChunks}</div>
              <div className="text-sm text-gray-500">Chunks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{uploadStats.subjects.length}</div>
              <div className="text-sm text-gray-500">Subjects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'upload', label: 'Upload Documents', icon: Upload },
              { id: 'manage', label: 'Manage Documents', icon: FileText },
              { id: 'search', label: 'Search Content', icon: Search }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload New Documents
              </h2>
              <FileUpload 
                userId={userId} 
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Documents
                </h2>
                <button
                  onClick={loadUserDocuments}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>
              </div>

              {/* Subject Filter */}
              <div className="mb-4">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Documents List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="animate-spin h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">No documents uploaded yet</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Document
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents
                    .filter(doc => selectedSubject === 'all' || doc.metadata.subject === selectedSubject)
                    .map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{doc.metadata.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {doc.metadata.subject}
                            </span>
                            {doc.metadata.chapter && (
                              <span>{doc.metadata.chapter}</span>
                            )}
                            <span>{new Date(doc.metadata.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="View Content"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Search Content
              </h2>
              
              {/* Search Form */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for topics, concepts, or specific content..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <RefreshCw className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{result.document.metadata.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {result.document.metadata.subject}
                            </span>
                            {result.document.metadata.chapter && (
                              <span>{result.document.metadata.chapter}</span>
                            )}
                            <span>Score: {(result.score * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-gray-700 mt-2 text-sm">
                            {result.relevantChunk.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
