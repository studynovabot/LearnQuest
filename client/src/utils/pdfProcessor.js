// 📄 CLIENT-SIDE PDF PROCESSOR
// Uses PDF.js to extract text in browser - no server limitations!

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export class ClientPDFProcessor {
  
  /**
   * Extract text from PDF file using PDF.js
   * @param {File} file - PDF file from user input
   * @returns {Promise<Object>} - Extraction result with text and metadata
   */
  static async extractTextFromPDF(file) {
    try {
      console.log('📄 Starting client-side PDF extraction...');
      console.log(`📊 File info: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Disable font loading to speed up processing
        disableFontFace: true,
        // Use standard fonts
        useSystemFonts: true
      });
      
      const pdf = await loadingTask.promise;
      console.log(`📄 PDF loaded successfully: ${pdf.numPages} pages`);
      
      let fullText = '';
      let processedPages = 0;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Process text items with better formatting
          const pageText = textContent.items
            .map(item => {
              // Handle different text item types
              if (item.str && item.str.trim()) {
                return item.str;
              }
              return '';
            })
            .filter(text => text.length > 0)
            .join(' ')
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          if (pageText.length > 0) {
            fullText += `\n\n--- Page ${pageNum} ---\n${pageText}`;
            processedPages++;
          }
          
          // Progress callback could be added here
          console.log(`📄 Processed page ${pageNum}/${pdf.numPages}`);
          
        } catch (pageError) {
          console.warn(`⚠️ Failed to process page ${pageNum}:`, pageError.message);
          continue;
        }
      }
      
      // Clean up the full text
      fullText = fullText.trim();
      const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
      
      console.log(`✅ PDF extraction completed:`);
      console.log(`   - Pages processed: ${processedPages}/${pdf.numPages}`);
      console.log(`   - Characters extracted: ${fullText.length}`);
      console.log(`   - Word count: ${wordCount}`);
      
      return {
        success: true,
        text: fullText,
        pageCount: pdf.numPages,
        processedPages,
        wordCount,
        characterCount: fullText.length,
        fileName: file.name,
        fileSize: file.size
      };
      
    } catch (error) {
      console.error('❌ PDF extraction failed:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to extract text from PDF';
      if (error.message.includes('Invalid PDF')) {
        errorMessage = 'The file appears to be corrupted or not a valid PDF';
      } else if (error.message.includes('password')) {
        errorMessage = 'This PDF is password protected. Please use an unprotected PDF';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Failed to load PDF.js library. Please check your internet connection';
      }
      
      return {
        success: false,
        error: errorMessage,
        originalError: error.message,
        text: ''
      };
    }
  }
  
  /**
   * Clean and format extracted text for better Q&A generation
   * @param {string} rawText - Raw extracted text
   * @returns {string} - Cleaned text
   */
  static cleanExtractedText(rawText) {
    return rawText
      // Remove page headers/footers pattern
      .replace(/--- Page \d+ ---/g, '')
      // Fix common PDF extraction issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/(\.)([A-Z])/g, '$1 $2') // Add space after periods
      .replace(/([a-z])(\d)/g, '$1 $2') // Add space before numbers
      .replace(/(\d)([a-z])/g, '$1 $2') // Add space after numbers
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }
  
  /**
   * Generate Q&A pairs from extracted text using AI
   * @param {string} text - Cleaned text from PDF
   * @param {Object} metadata - Document metadata
   * @param {string} apiUrl - API base URL
   * @returns {Promise<Object>} - Q&A pairs result
   */
  static async generateQAPairs(text, metadata, apiUrl) {
    try {
      console.log('🤖 Generating Q&A pairs from text...');
      console.log(`📊 Text length: ${text.length} characters`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`${apiUrl}/ai-text-to-qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: text,
          metadata: metadata,
          options: {
            maxQuestions: 50, // Limit to prevent overwhelming
            focusAreas: ['definitions', 'concepts', 'processes', 'examples'],
            difficulty: 'mixed', // Easy to hard questions
            includePageNumbers: false
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `AI service error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.qaPairs) {
        throw new Error(result.message || 'Failed to generate Q&A pairs');
      }
      
      console.log(`✅ Generated ${result.qaPairs.length} Q&A pairs`);
      
      return {
        success: true,
        qaPairs: result.qaPairs,
        totalQuestions: result.qaPairs.length,
        processingTime: result.processingTime || 'unknown'
      };
      
    } catch (error) {
      console.error('❌ Q&A generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Convert Q&A pairs to JSONL format
   * @param {Array} qaPairs - Array of Q&A objects
   * @param {Object} metadata - Document metadata
   * @param {Object} extractionStats - PDF extraction statistics
   * @returns {string} - JSONL formatted string
   */
  static formatToJSONL(qaPairs, metadata, extractionStats = {}) {
    const timestamp = new Date().toISOString();
    
    return qaPairs.map((qa, index) => {
      const jsonlObject = {
        id: `${metadata.board}-${metadata.class}-${metadata.subject}-${index + 1}`,
        question: qa.question,
        answer: qa.answer,
        metadata: {
          ...metadata,
          extractionMethod: 'client-side-pdf-js',
          extractedAt: timestamp,
          questionIndex: index + 1,
          totalQuestions: qaPairs.length,
          ...extractionStats
        }
      };
      
      // Add confidence score if available
      if (qa.confidence) {
        jsonlObject.confidence = qa.confidence;
      }
      
      // Add difficulty level if available
      if (qa.difficulty) {
        jsonlObject.difficulty = qa.difficulty;
      }
      
      return JSON.stringify(jsonlObject);
    }).join('\n');
  }
  
  /**
   * Complete pipeline: PDF → Text → Q&A → JSONL
   * @param {File} file - PDF file
   * @param {Object} metadata - Document metadata
   * @param {string} apiUrl - API base URL
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Complete processing result
   */
  static async processPDFComplete(file, metadata, apiUrl, onProgress = () => {}) {
    try {
      console.log('🚀 Starting complete PDF processing pipeline...');
      
      // Step 1: Extract text from PDF
      onProgress({ step: 'extraction', progress: 0, message: 'Extracting text from PDF...' });
      const textResult = await this.extractTextFromPDF(file);
      
      if (!textResult.success) {
        throw new Error(textResult.error);
      }
      
      onProgress({ step: 'extraction', progress: 100, message: `Extracted ${textResult.wordCount} words from ${textResult.pageCount} pages` });
      
      // Step 2: Clean the text
      onProgress({ step: 'cleaning', progress: 0, message: 'Cleaning and formatting text...' });
      const cleanText = this.cleanExtractedText(textResult.text);
      onProgress({ step: 'cleaning', progress: 100, message: 'Text cleaned and formatted' });
      
      // Step 3: Generate Q&A pairs
      onProgress({ step: 'ai-processing', progress: 0, message: 'Generating Q&A pairs with AI...' });
      const qaResult = await this.generateQAPairs(cleanText, metadata, apiUrl);
      onProgress({ step: 'ai-processing', progress: 100, message: `Generated ${qaResult.totalQuestions} Q&A pairs` });
      
      // Step 4: Format as JSONL
      onProgress({ step: 'formatting', progress: 0, message: 'Formatting as JSONL...' });
      const jsonlData = this.formatToJSONL(qaResult.qaPairs, metadata, {
        originalWordCount: textResult.wordCount,
        originalPageCount: textResult.pageCount,
        fileName: textResult.fileName
      });
      onProgress({ step: 'formatting', progress: 100, message: 'JSONL formatting complete' });
      
      console.log('✅ Complete PDF processing successful!');
      
      return {
        success: true,
        qaPairs: qaResult.qaPairs,
        jsonlData: jsonlData,
        stats: {
          totalQuestions: qaResult.totalQuestions,
          wordCount: textResult.wordCount,
          pageCount: textResult.pageCount,
          characterCount: textResult.characterCount,
          fileName: file.name,
          fileSize: file.size,
          processingTime: qaResult.processingTime
        }
      };
      
    } catch (error) {
      console.error('❌ Complete PDF processing failed:', error);
      onProgress({ step: 'error', progress: 0, message: error.message });
      
      return {
        success: false,
        error: error.message,
        qaPairs: [],
        jsonlData: '',
        stats: {}
      };
    }
  }
}