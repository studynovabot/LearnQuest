import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { simpleVectorDB } from '@/lib/simpleVectorDB';
import { SimpleDocument, SimpleSearchResult } from '@/lib/simpleVectorDB';
import { Loader, CheckCircle, AlertCircle, Database, Search } from 'lucide-react';

interface VectorDBTestProps {
  userId: string;
}

const VectorDBTest: React.FC<VectorDBTestProps> = ({ userId }) => {
  const [testText, setTestText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SimpleSearchResult[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Test Firebase Vector DB connection
  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      // Test Firebase vector database connection by doing a simple search
      const response = await fetch('/api/vector-enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-email': 'thakurranveersingh505@gmail.com'
        },
        body: JSON.stringify({
          action: 'search',
          query: 'test connection',
          filters: {},
          limit: 1
        })
      });

      if (response.ok) {
        setConnectionStatus('success');
        console.log('Firebase Vector DB connection successful');
      } else {
        setConnectionStatus('error');
        console.error('Firebase Vector DB connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Firebase Vector DB connection failed:', error);
    }
  };

  // Test document upload
  const testUpload = async () => {
    if (!testText.trim()) return;

    setIsUploading(true);
    setUploadResult('');

    try {
      const testDocument: SimpleDocument = {
        id: `test_${Date.now()}`,
        content: testText,
        metadata: {
          title: 'Test Document',
          subject: 'Testing',
          chapter: 'Vector DB Test',
          fileType: 'text',
          uploadedAt: new Date().toISOString(),
          userId: userId,
          tags: ['test', 'vector-db']
        }
      };

      const success = await simpleVectorDB.storeDocument(testDocument);

      if (success) {
        setUploadResult('✅ Document uploaded successfully to Simple Vector DB!');
      } else {
        setUploadResult('❌ Failed to upload document');
      }
    } catch (error) {
      console.error('Upload test failed:', error);
      setUploadResult(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Test search functionality using real Firebase API
  const testSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Use the real Firebase vector search API
      const response = await fetch('/api/vector-enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-email': 'thakurranveersingh505@gmail.com' // Admin email for testing
        },
        body: JSON.stringify({
          action: 'search',
          query: searchQuery,
          filters: {},
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search test failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader className="animate-spin h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing connection...';
      case 'success':
        return 'Firebase Vector DB Ready';
      case 'error':
        return 'Connection failed';
      default:
        return 'Not tested';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Vector Database Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">1. Test Firebase Vector DB</h3>
            <div className="flex items-center gap-4">
              <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
                Test Connection
              </Button>
              <div className="flex items-center gap-2">
                {getConnectionStatusIcon()}
                <span className="text-sm">{getConnectionStatusText()}</span>
              </div>
            </div>
          </div>

          {/* Upload Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">2. Test Document Upload</h3>
            <div className="space-y-3">
              <Input
                placeholder="Enter test text to upload..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={testUpload} 
                disabled={isUploading || !testText.trim()}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  'Upload Test Document'
                )}
              </Button>
              {uploadResult && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{uploadResult}</p>
                </div>
              )}
            </div>
          </div>

          {/* Search Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">3. Test Vector Search</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={testSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader className="animate-spin h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Search Results ({searchResults.length})</h4>
                  {searchResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{result.document.metadata.title}</h5>
                          <Badge variant="outline">
                            {(result.score * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Badge variant="secondary">{result.document.metadata.subject}</Badge>
                          {result.document.metadata.chapter && (
                            <Badge variant="secondary">{result.document.metadata.chapter}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {result.relevantChunk.substring(0, 200)}...
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="text-center py-4 text-gray-500">
                  No results found. Try uploading some test documents first.
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>First, test the Firebase Vector DB connection</li>
              <li>Search for keywords from your uploaded documents (like "sionim", "company", "pragnius")</li>
              <li>Check that results are returned with similarity scores</li>
              <li>Your uploaded document should appear in search results</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorDBTest;
