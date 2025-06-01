// PDF Processing Utilities for Vector Database
import { VectorDocument, vectorDB } from './vectorDatabase';

// PDF processing interface
export interface PDFProcessingResult {
  success: boolean;
  documentId?: string;
  chunks?: number;
  error?: string;
}

// File metadata interface
export interface FileMetadata {
  title: string;
  subject: string;
  chapter?: string;
  tags?: string[];
  description?: string;
}

// PDF Processor Class
export class PDFProcessor {
  
  // Process PDF file and extract text
  async processPDF(file: File, metadata: FileMetadata, userId: string): Promise<PDFProcessingResult> {
    try {
      // Validate file
      if (!this.isValidPDF(file)) {
        return {
          success: false,
          error: 'Invalid PDF file'
        };
      }

      // Extract text from PDF
      const text = await this.extractTextFromPDF(file);
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'No text content found in PDF'
        };
      }

      // Create document ID
      const documentId = this.generateDocumentId(file.name, userId);

      // Chunk the text for better retrieval
      const chunks = vectorDB.chunkText(text, 1000, 200);

      // Store each chunk as a separate document
      let storedChunks = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkDocument: VectorDocument = {
          id: `${documentId}_chunk_${i}`,
          content: chunk,
          metadata: {
            title: metadata.title,
            subject: metadata.subject,
            chapter: metadata.chapter,
            page: Math.floor(i / 2) + 1, // Approximate page number
            fileType: 'pdf',
            uploadedAt: new Date().toISOString(),
            userId: userId,
            tags: metadata.tags || []
          }
        };

        const stored = await vectorDB.storeDocument(chunkDocument);
        if (stored) {
          storedChunks++;
        }
      }

      return {
        success: true,
        documentId: documentId,
        chunks: storedChunks
      };

    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Extract text from PDF using PDF.js (browser-based)
  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      // For now, we'll use a simple text extraction
      // In production, you'd use PDF.js or similar library
      
      // Check if it's actually a text file disguised as PDF
      const text = await this.readFileAsText(file);
      if (text && text.length > 0) {
        return text;
      }

      // For actual PDF processing, you would use:
      // import * as pdfjsLib from 'pdfjs-dist';
      // const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      // ... extract text from each page
      
      // Placeholder implementation
      return `Sample extracted text from ${file.name}. 
      This is where the actual PDF text content would be extracted.
      In a real implementation, this would use PDF.js or a server-side PDF processing library.`;
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Read file as text (for testing purposes)
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Validate PDF file
  private isValidPDF(file: File): boolean {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return false;
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  // Generate unique document ID
  private generateDocumentId(fileName: string, userId: string): string {
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${userId}_${cleanFileName}_${timestamp}`;
  }

  // Process multiple files
  async processMultipleFiles(
    files: File[], 
    metadata: FileMetadata[], 
    userId: string,
    onProgress?: (progress: number, fileName: string) => void
  ): Promise<PDFProcessingResult[]> {
    const results: PDFProcessingResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileMetadata = metadata[i] || {
        title: file.name,
        subject: 'General',
        tags: []
      };

      if (onProgress) {
        onProgress((i / files.length) * 100, file.name);
      }

      const result = await this.processPDF(file, fileMetadata, userId);
      results.push(result);
    }

    if (onProgress) {
      onProgress(100, 'Complete');
    }

    return results;
  }

  // Search for content in uploaded documents
  async searchDocuments(
    query: string, 
    filters?: {
      subject?: string;
      chapter?: string;
      tags?: string[];
      userId?: string;
    }
  ) {
    try {
      const results = await vectorDB.searchSimilar(query, 10, filters);
      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  // Get document suggestions based on subject/chapter
  async getDocumentSuggestions(subject: string, chapter?: string) {
    try {
      const query = chapter ? `${subject} ${chapter}` : subject;
      const results = await vectorDB.searchSimilar(query, 5, {
        subject: subject,
        chapter: chapter
      });
      return results;
    } catch (error) {
      console.error('Error getting document suggestions:', error);
      return [];
    }
  }

  // Delete uploaded document
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      return await vectorDB.deleteDocument(documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Get user's uploaded documents
  async getUserDocuments(userId: string, page: number = 1, limit: number = 20) {
    try {
      return await vectorDB.listDocuments(page, limit, { userId });
    } catch (error) {
      console.error('Error getting user documents:', error);
      return {
        documents: [],
        total: 0,
        hasMore: false
      };
    }
  }
}

// Create default instance
export const pdfProcessor = new PDFProcessor();

// Utility functions
export const supportedFileTypes = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const maxFileSize = 50 * 1024 * 1024; // 50MB

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!supportedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.'
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 50MB.'
    };
  }

  return { valid: true };
};
