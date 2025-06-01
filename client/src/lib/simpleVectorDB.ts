// Simple Vector Database Implementation (No external dependencies)
// Uses text-based similarity without requiring OpenAI or complex embeddings

export interface SimpleDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    subject: string;
    chapter?: string;
    fileType: string;
    uploadedAt: string;
    userId: string;
    tags?: string[];
  };
}

export interface SimpleSearchResult {
  document: SimpleDocument;
  score: number;
  relevantChunk: string;
}

export class SimpleVectorDB {
  private documents: SimpleDocument[] = [];

  // Store document
  async storeDocument(document: SimpleDocument): Promise<boolean> {
    try {
      // Store in memory (in production, this would go to a database)
      this.documents.push(document);
      
      // Also store in localStorage for persistence
      const stored = localStorage.getItem('learnquest_documents') || '[]';
      const docs = JSON.parse(stored);
      docs.push(document);
      localStorage.setItem('learnquest_documents', JSON.stringify(docs));
      
      return true;
    } catch (error) {
      console.error('Error storing document:', error);
      return false;
    }
  }

  // Load documents from storage
  private loadDocuments(): void {
    try {
      const stored = localStorage.getItem('learnquest_documents') || '[]';
      this.documents = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading documents:', error);
      this.documents = [];
    }
  }

  // Search documents using text similarity
  async searchSimilar(query: string, limit: number = 10, filters?: any): Promise<SimpleSearchResult[]> {
    this.loadDocuments();
    
    const results: SimpleSearchResult[] = [];
    
    // Filter documents based on criteria
    let filteredDocs = this.documents;
    if (filters) {
      filteredDocs = this.documents.filter(doc => {
        if (filters.userId && doc.metadata.userId !== filters.userId) return false;
        if (filters.subject && doc.metadata.subject !== filters.subject) return false;
        if (filters.chapter && doc.metadata.chapter !== filters.chapter) return false;
        return true;
      });
    }

    // Calculate similarity for each document
    for (const doc of filteredDocs) {
      const similarity = this.calculateTextSimilarity(query, doc.content);
      
      if (similarity > 0.1) { // Minimum similarity threshold
        const relevantChunk = this.findRelevantChunk(doc.content, query);
        
        results.push({
          document: doc,
          score: similarity,
          relevantChunk: relevantChunk
        });
      }
    }

    // Sort by similarity score and limit results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  // Calculate text similarity using word overlap
  private calculateTextSimilarity(query: string, content: string): number {
    const queryWords = this.tokenize(query);
    const contentWords = this.tokenize(content);
    
    if (queryWords.length === 0 || contentWords.length === 0) return 0;
    
    // Calculate Jaccard similarity
    const querySet = new Set(queryWords);
    const contentSet = new Set(contentWords);
    
    const intersection = new Set([...querySet].filter(x => contentSet.has(x)));
    const union = new Set([...querySet, ...contentSet]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Calculate TF-IDF style scoring
    let tfIdfScore = 0;
    for (const word of queryWords) {
      const tf = contentWords.filter(w => w === word).length / contentWords.length;
      const idf = Math.log(1 + contentWords.length / (1 + contentWords.filter(w => w === word).length));
      tfIdfScore += tf * idf;
    }
    
    // Combine scores
    return (jaccardSimilarity * 0.6) + (tfIdfScore * 0.4);
  }

  // Find the most relevant chunk of text
  private findRelevantChunk(content: string, query: string, chunkSize: number = 200): string {
    const words = content.split(' ');
    const queryWords = this.tokenize(query);
    
    if (words.length <= chunkSize) return content;
    
    let bestChunk = '';
    let bestScore = 0;
    
    // Sliding window to find best chunk
    for (let i = 0; i <= words.length - chunkSize; i += 50) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      const chunkWords = this.tokenize(chunk);
      
      // Score based on query word matches
      let score = 0;
      for (const queryWord of queryWords) {
        const matches = chunkWords.filter(w => w === queryWord).length;
        score += matches;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestChunk = chunk;
      }
    }
    
    return bestChunk || words.slice(0, chunkSize).join(' ');
  }

  // Tokenize text into words
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.loadDocuments();
      this.documents = this.documents.filter(doc => doc.id !== documentId);
      
      // Update localStorage
      localStorage.setItem('learnquest_documents', JSON.stringify(this.documents));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Get user documents
  async getUserDocuments(userId: string, page: number = 1, limit: number = 20): Promise<{
    documents: SimpleDocument[];
    total: number;
    hasMore: boolean;
  }> {
    this.loadDocuments();
    
    const userDocs = this.documents.filter(doc => doc.metadata.userId === userId);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      documents: userDocs.slice(start, end),
      total: userDocs.length,
      hasMore: end < userDocs.length
    };
  }

  // Get document suggestions
  async getDocumentSuggestions(subject: string, chapter?: string): Promise<SimpleSearchResult[]> {
    this.loadDocuments();
    
    const query = chapter ? `${subject} ${chapter}` : subject;
    return this.searchSimilar(query, 5, { subject, chapter });
  }

  // Chunk text for processing
  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }
}

// Create default instance
export const simpleVectorDB = new SimpleVectorDB();
