// Advanced PDF Parser for Educational Content
import fs from 'fs/promises';
import path from 'path';

/**
 * Advanced PDF parser that extracts Q&A pairs from educational PDFs
 * Supports multiple formats and patterns commonly found in NCERT solutions
 */
export class EducationalPDFParser {
  constructor() {
    this.questionPatterns = [
      /(?:Q\.?\s*\d+\.?|Question\s*\d+\.?|^\d+\.)\s*(.+?)(?=A\.|Answer|Sol\.?|Solution)/gims,
      /(?:Q\s*\d+|Question\s*\d+)\s*[:.]?\s*(.+?)(?=(?:Q\s*\d+|Question\s*\d+|A\s*\d+|Answer\s*\d+|$))/gims,
      /^\s*\d+\.\s*(.+?)(?=^\s*\d+\.|$)/gims
    ];
    
    this.answerPatterns = [
      /(?:A\.?\s*\d*\.?|Answer|Sol\.?|Solution)\s*[:.]?\s*(.+?)(?=(?:Q\.?\s*\d+|Question\s*\d+|A\.?\s*\d+|Answer|Sol\.?|Solution|$))/gims,
      /(?:A\s*\d+|Answer\s*\d+)\s*[:.]?\s*(.+?)(?=(?:Q\s*\d+|Question\s*\d+|A\s*\d+|Answer\s*\d+|$))/gims
    ];
  }

  /**
   * Parse PDF text content and extract Q&A pairs
   * @param {string} textContent - Raw text from PDF
   * @param {Object} metadata - PDF metadata (board, class, subject, chapter)
   * @returns {Array} Array of Q&A objects
   */
  async parseQAPairs(textContent, metadata) {
    try {
      console.log('🔍 Starting Q&A extraction...');
      
      // Clean and normalize text
      const cleanText = this.cleanText(textContent);
      
      // Split into logical sections
      const sections = this.splitIntoSections(cleanText);
      
      // Extract Q&A pairs from each section
      const qaResults = [];
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const qaPairs = this.extractQAFromSection(section, i + 1);
        
        qaPairs.forEach(qa => {
          qaResults.push({
            ...metadata,
            question: qa.question,
            answer: qa.answer,
            questionNumber: qa.questionNumber,
            pageSection: i + 1,
            extractedAt: new Date().toISOString(),
            confidence: qa.confidence
          });
        });
      }
      
      console.log(`✅ Extracted ${qaResults.length} Q&A pairs`);
      return qaResults;
      
    } catch (error) {
      console.error('❌ Error parsing Q&A pairs:', error);
      throw error;
    }
  }

  /**
   * Clean and normalize text content
   * @param {string} text - Raw text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Fix common OCR issues
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      // Remove page headers/footers
      .replace(/Page\s+\d+/gi, '')
      .replace(/Chapter\s+\d+/gi, '')
      // Normalize question/answer markers
      .replace(/Q\.?\s*(\d+)/gi, 'Q$1.')
      .replace(/A\.?\s*(\d+)/gi, 'A$1.')
      .replace(/Question\s*(\d+)/gi, 'Q$1.')
      .replace(/Answer\s*(\d+)/gi, 'A$1.')
      .trim();
  }

  /**
   * Split text into logical sections
   * @param {string} text - Cleaned text
   * @returns {Array} Array of text sections
   */
  splitIntoSections(text) {
    // Split by common section indicators
    const sectionBreaks = [
      /(?=Q\.?\s*\d+\.)/gi,
      /(?=Question\s*\d+)/gi,
      /(?=^\d+\.)/gim,
      /(?=Exercise\s*\d+)/gi
    ];
    
    let sections = [text];
    
    sectionBreaks.forEach(pattern => {
      const newSections = [];
      sections.forEach(section => {
        const parts = section.split(pattern);
        newSections.push(...parts.filter(part => part.trim().length > 20));
      });
      sections = newSections;
    });
    
    return sections.filter(section => section.trim().length > 50);
  }

  /**
   * Extract Q&A pairs from a text section
   * @param {string} section - Text section
   * @param {number} sectionIndex - Section index
   * @returns {Array} Array of Q&A objects
   */
  extractQAFromSection(section, sectionIndex) {
    const qaResults = [];
    
    // Try different extraction strategies
    const strategies = [
      this.extractByPatternMatching.bind(this),
      this.extractBySequentialParsing.bind(this),
      this.extractByStructuralAnalysis.bind(this)
    ];
    
    for (const strategy of strategies) {
      try {
        const results = strategy(section, sectionIndex);
        if (results && results.length > 0) {
          qaResults.push(...results);
          break; // Use first successful strategy
        }
      } catch (error) {
        console.warn(`Strategy failed for section ${sectionIndex}:`, error.message);
      }
    }
    
    return qaResults;
  }

  /**
   * Extract Q&A using pattern matching
   * @param {string} section - Text section
   * @param {number} sectionIndex - Section index
   * @returns {Array} Q&A pairs
   */
  extractByPatternMatching(section, sectionIndex) {
    const results = [];
    
    // Find all question patterns
    const questions = [];
    this.questionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(section)) !== null) {
        questions.push({
          text: match[1].trim(),
          position: match.index,
          questionNumber: this.extractQuestionNumber(match[0])
        });
      }
    });
    
    // Find corresponding answers
    questions.forEach(question => {
      const answer = this.findCorrespondingAnswer(section, question);
      if (answer) {
        results.push({
          question: question.text,
          answer: answer.text,
          questionNumber: question.questionNumber,
          confidence: this.calculateConfidence(question, answer)
        });
      }
    });
    
    return results;
  }

  /**
   * Extract Q&A using sequential parsing
   * @param {string} section - Text section
   * @param {number} sectionIndex - Section index
   * @returns {Array} Q&A pairs
   */
  extractBySequentialParsing(section, sectionIndex) {
    const results = [];
    
    // Split by Q1, Q2, etc. pattern
    const qSections = section.split(/(?=Q\d+\.)/i).filter(s => s.trim().length > 10);
    
    qSections.forEach((qSection, index) => {
      const trimmed = qSection.trim();
      if (!trimmed) return;
      
      // Extract question number
      const qNumberMatch = trimmed.match(/^Q(\d+)\./i);
      const questionNumber = qNumberMatch ? parseInt(qNumberMatch[1]) : index + 1;
      
      // Split question and answer
      const parts = trimmed.split(/\n(?=[A-Z])/);
      if (parts.length >= 2) {
        const questionPart = parts[0];
        const answerPart = parts.slice(1).join(' ');
        
        // Clean question
        const question = questionPart
          .replace(/^Q\d+\.\s*/i, '')
          .trim();
        
        // Clean answer
        const answer = answerPart.trim();
        
        if (question.length > 5 && answer.length > 5) {
          results.push({
            question,
            answer,
            questionNumber,
            confidence: 0.9
          });
        }
      }
    });
    
    return results;
  }

  /**
   * Extract Q&A using structural analysis
   * @param {string} section - Text section
   * @param {number} sectionIndex - Section index
   * @returns {Array} Q&A pairs
   */
  extractByStructuralAnalysis(section, sectionIndex) {
    const results = [];
    
    // Look for numbered patterns (1. 2. 3. etc.)
    const numberedSections = section.split(/(?=^\s*\d+\.)/gm);
    
    numberedSections.forEach((subsection, index) => {
      if (subsection.trim().length < 20) return;
      
      const lines = subsection.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) return;
      
      // First line is likely the question
      const questionText = lines[0].replace(/^\s*\d+\.\s*/, '').trim();
      
      // Rest is likely the answer
      const answerText = lines.slice(1).join(' ').trim();
      
      if (questionText.length > 10 && answerText.length > 10) {
        results.push({
          question: questionText,
          answer: answerText,
          questionNumber: index + 1,
          confidence: 0.7
        });
      }
    });
    
    return results;
  }

  /**
   * Helper methods
   */
  extractQuestionNumber(questionText) {
    const match = questionText.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  findCorrespondingAnswer(section, question) {
    // Implementation for finding answers corresponding to questions
    const answerStart = question.position + question.text.length;
    const remainingText = section.substring(answerStart);
    
    for (const pattern of this.answerPatterns) {
      const match = pattern.exec(remainingText);
      if (match) {
        return {
          text: match[1].trim(),
          position: answerStart + match.index
        };
      }
    }
    
    return null;
  }

  isQuestionLine(line) {
    return /^(?:Q\.?\s*\d+|Question\s*\d+|\d+\.)\s*[A-Z]/.test(line.trim());
  }

  isAnswerLine(line) {
    return /^(?:A\.?\s*\d*|Answer|Sol\.?|Solution)\s*[:.]?/.test(line.trim());
  }

  cleanQuestionText(text) {
    return text.replace(/^(?:Q\.?\s*\d+\.?|Question\s*\d+\.?|\d+\.)\s*/, '').trim();
  }

  cleanAnswerText(text) {
    return text.replace(/^(?:A\.?\s*\d*\.?|Answer|Sol\.?|Solution)\s*[:.]?\s*/, '').trim();
  }

  calculateConfidence(question, answer) {
    let confidence = 0.5;
    
    // Increase confidence based on various factors
    if (question.text.length > 20) confidence += 0.1;
    if (answer.text.length > 30) confidence += 0.1;
    if (question.text.includes('?')) confidence += 0.1;
    if (answer.text.match(/^[A-Z]/)) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Save Q&A pairs to JSONL format
   * @param {Array} qaPairs - Array of Q&A objects
   * @param {string} outputPath - Output file path
   */
  async saveToJSONL(qaPairs, outputPath) {
    try {
      const jsonlContent = qaPairs
        .map(qa => JSON.stringify(qa))
        .join('\n');
      
      await fs.writeFile(outputPath, jsonlContent, 'utf-8');
      console.log(`✅ Saved ${qaPairs.length} Q&A pairs to ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Error saving to JSONL:', error);
      throw error;
    }
  }
}

/**
 * Simple PDF text extractor (fallback method)
 * In production, you should use a proper PDF library like pdf-parse
 */
export async function extractTextFromPDF(pdfPath) {
  try {
    // This is a placeholder - in real implementation you'd use:
    // - pdf-parse for Node.js
    // - PyMuPDF or pdfplumber via Python subprocess
    // - PDF.js for browser-based parsing
    
    console.log('📄 Extracting text from PDF:', pdfPath);
    
    // For now, return sample text that matches common NCERT format
    const sampleText = `
Q1. What is a chemical reaction?
A chemical reaction is a process in which one or more substances, called reactants, are converted to one or more different substances, called products.

Q2. Give an example of a chemical reaction.
Rusting of iron is a chemical reaction. When iron comes in contact with oxygen and moisture, it forms iron oxide (rust). The chemical equation is: 4Fe + 3O2 + 6H2O → 4Fe(OH)3

Q3. What are the signs of a chemical reaction?
The signs of a chemical reaction include:
1. Change in color
2. Evolution of gas
3. Formation of precipitate
4. Change in temperature
5. Change in smell

Q4. What is the law of conservation of mass?
The law of conservation of mass states that mass can neither be created nor destroyed in a chemical reaction. The total mass of reactants equals the total mass of products.

Q5. What is a balanced chemical equation?
A balanced chemical equation is one in which the number of atoms of each element is equal on both sides of the equation.
    `;
    
    return sampleText.trim();
    
  } catch (error) {
    console.error('❌ Error extracting text from PDF:', error);
    throw error;
  }
}