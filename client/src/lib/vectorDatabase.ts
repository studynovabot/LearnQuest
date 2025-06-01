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

  // Generate embeddings for text content
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('/api/embeddings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
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

  // Pinecone implementation
  private async storeToPinecone(document: VectorDocument): Promise<boolean> {
    try {
      const response = await fetch('/api/pinecone/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vectors: [{
            id: document.id,
            values: document.embedding,
            metadata: {
              content: document.content.substring(0, 1000), // Limit content size
              ...document.metadata
            }
          }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error storing to Pinecone:', error);
      return false;
    }
  }

  private async searchPinecone(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    try {
      const response = await fetch('/api/pinecone/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vector: embedding,
          topK: limit,
          includeMetadata: true,
          filter: filters
        })
      });

      if (!response.ok) {
        throw new Error('Pinecone search failed');
      }

      const data = await response.json();

      return data.matches.map((match: any) => ({
        document: {
          id: match.id,
          content: match.metadata.content,
          metadata: {
            title: match.metadata.title,
            subject: match.metadata.subject,
            chapter: match.metadata.chapter,
            fileType: match.metadata.fileType,
            uploadedAt: match.metadata.uploadedAt,
            userId: match.metadata.userId,
            tags: match.metadata.tags || []
          },
          embedding: match.values
        },
        score: match.score,
        relevantChunk: match.metadata.content
      }));
    } catch (error) {
      console.error('Error searching Pinecone:', error);
      return [];
    }
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
