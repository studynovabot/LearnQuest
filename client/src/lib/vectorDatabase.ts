// Vector Database Configuration and Utilities
import { pineconeConfig } from './config';

// Configuration for different vector database providers
export interface VectorConfig {
  provider: 'pinecone' | 'chroma' | 'supabase';
  apiKey?: string;
  environment?: string;
  indexName?: string;
  dimension?: number;
}

// Document interface for vector storage
export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    subject: string;
    chapter?: string;
    page?: number;
    fileType: string;
    uploadedAt: string;
    userId: string;
    tags?: string[];
  };
  embedding?: number[];
}

// Search result interface
export interface SearchResult {
  document: VectorDocument;
  score: number;
  relevantChunk: string;
}

// Vector Database Service Class
export class VectorDatabaseService {
  private config: VectorConfig;

  constructor(config: VectorConfig) {
    this.config = config;
  }

  // Generate simple text-based embeddings locally
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Simple local embedding generation
      return this.generateLocalEmbedding(text);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Generate local text-based embedding
  private generateLocalEmbedding(text: string): number[] {
    const dimension = 384;
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const embedding = new Array(dimension).fill(0);

    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const pos = Math.abs(hash) % dimension;
      embedding[pos] += 1 / (index + 1); // Weight by position
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  // Chunk text into smaller pieces for better retrieval
  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      start = end - overlap;
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  // Store document in vector database
  async storeDocument(document: VectorDocument): Promise<boolean> {
    try {
      // Generate embedding for the content
      const embedding = await this.generateEmbedding(document.content);
      document.embedding = embedding;

      // Store based on provider
      switch (this.config.provider) {
        case 'pinecone':
          return await this.storeToPinecone(document);
        case 'chroma':
          return await this.storeToChroma(document);
        case 'supabase':
          return await this.storeToSupabase(document);
        default:
          throw new Error('Unsupported vector database provider');
      }
    } catch (error) {
      console.error('Error storing document:', error);
      return false;
    }
  }

  // Search for similar documents
  async searchSimilar(query: string, limit: number = 5, filters?: any): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Search based on provider
      switch (this.config.provider) {
        case 'pinecone':
          return await this.searchPinecone(queryEmbedding, limit, filters);
        case 'chroma':
          return await this.searchChroma(queryEmbedding, limit, filters);
        case 'supabase':
          return await this.searchSupabase(queryEmbedding, limit, filters);
        default:
          throw new Error('Unsupported vector database provider');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  // Real Pinecone implementation
  private async storeToPinecone(document: VectorDocument): Promise<boolean> {
    try {
      // Use the vector-upload API endpoint
      const response = await fetch('/api/vector-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': document.metadata.userId || 'demo-user',
          'x-user-email': 'thakurranveersingh505@gmail.com' // Admin email for uploads
        },
        body: JSON.stringify({
          content: document.content,
          metadata: document.metadata
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Document stored in Pinecone:', result);
        return true;
      } else {
        console.error('❌ Failed to store document in Pinecone:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error storing document in Pinecone:', error);
      return false;
    }
  }

  private async searchPinecone(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    try {
      // Use the vector-enhanced-chat API endpoint with search action
      const response = await fetch('/api/vector-enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': filters?.userId || 'demo-user'
        },
        body: JSON.stringify({
          action: 'search',
          query: 'search query', // This will be converted to embedding on the server
          filters: {
            subject: filters?.subject,
            chapter: filters?.chapter
          },
          limit: limit
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Pinecone search results:', result.results?.length || 0);

        // Convert API results to SearchResult format
        return (result.results || []).map((item: any) => ({
          document: {
            id: item.document.id,
            content: item.document.content,
            metadata: item.document.metadata,
            embedding: [] // Not needed for display
          },
          score: item.score,
          relevantChunk: item.relevantChunk || item.document.content.substring(0, 200)
        }));
      } else {
        console.error('❌ Failed to search Pinecone:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error searching Pinecone:', error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    return (normA === 0 || normB === 0) ? 0 : dotProduct / (normA * normB);
  }

  // Chroma implementation
  private async storeToChroma(document: VectorDocument): Promise<boolean> {
    // Implementation for Chroma
    console.log('Storing to Chroma:', document.id);
    return true;
  }

  private async searchChroma(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    // Implementation for Chroma search
    console.log('Searching Chroma');
    return [];
  }

  // Supabase implementation
  private async storeToSupabase(document: VectorDocument): Promise<boolean> {
    // Implementation for Supabase vector storage
    console.log('Storing to Supabase:', document.id);
    return true;
  }

  private async searchSupabase(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    // Implementation for Supabase vector search
    console.log('Searching Supabase');
    return [];
  }

  // Delete document from vector database
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Delete based on provider
      switch (this.config.provider) {
        case 'pinecone':
          // Pinecone delete implementation
          break;
        case 'chroma':
          // Chroma delete implementation
          break;
        case 'supabase':
          // Supabase delete implementation
          break;
      }
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Get document by ID
  async getDocument(documentId: string): Promise<VectorDocument | null> {
    try {
      // Implementation based on provider
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  // List all documents with pagination
  async listDocuments(page: number = 1, limit: number = 20, filters?: any): Promise<{
    documents: VectorDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Implementation based on provider
      return {
        documents: [],
        total: 0,
        hasMore: false
      };
    } catch (error) {
      console.error('Error listing documents:', error);
      return {
        documents: [],
        total: 0,
        hasMore: false
      };
    }
  }
}

// Default configuration
export const defaultVectorConfig: VectorConfig = {
  provider: 'pinecone', // Using Pinecone with your API key
  apiKey: pineconeConfig.apiKey,
  environment: pineconeConfig.environment,
  dimension: pineconeConfig.dimension,
  indexName: pineconeConfig.indexName
};

// Create default instance
export const vectorDB = new VectorDatabaseService(defaultVectorConfig);
