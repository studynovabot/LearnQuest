// PDF processing utilities with AI content extraction
import fs from 'fs';
import path from 'path';

// AI API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '386f94fa38882002186da7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7';

// Extract text from PDF (simplified - in production you'd use a proper PDF parser)
export async function extractTextFromPDF(filePath) {
  try {
    // For now, we'll simulate PDF text extraction
    // In production, you would use libraries like pdf-parse, pdf2pic, or pdf-poppler
    
    // Read file buffer
    const buffer = fs.readFileSync(filePath);
    
    // Simulate extracted text (replace with actual PDF parsing)
    const simulatedText = `
    This is extracted text from the PDF file.
    The content would be parsed from the actual PDF document.
    This includes mathematical formulas, diagrams descriptions, and educational content.
    `;
    
    return simulatedText;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Process educational content using AI
export async function processEducationalContent(extractedText, type, board, classNum, subject, chapter) {
  try {
    const prompt = generateProcessingPrompt(extractedText, type, board, classNum, subject, chapter);
    
    // Use Together AI for content processing
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content processor. Extract and organize educational content according to the specified format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`AI processing failed: ${response.statusText}`);
    }

    const data = await response.json();
    const processedContent = data.choices[0].message.content;

    return parseProcessedContent(processedContent, type);
  } catch (error) {
    console.error('AI content processing error:', error);
    // Return fallback structured content
    return generateFallbackContent(extractedText, type, subject, chapter);
  }
}

// Generate AI processing prompt based on content type
function generateProcessingPrompt(text, type, board, classNum, subject, chapter) {
  const basePrompt = `
    Process the following educational content for ${board} board, Class ${classNum}, Subject: ${subject}${chapter ? `, Chapter: ${chapter}` : ''}.
    
    Content Type: ${type}
    
    Original Text:
    ${text}
    
    Please extract and organize the content in the following JSON format:
  `;

  switch (type) {
    case 'flash-notes':
      return basePrompt + `
      {
        "title": "Chapter/Topic Title",
        "keyPoints": ["Point 1", "Point 2", "Point 3"],
        "definitions": [{"term": "Term", "definition": "Definition"}],
        "formulas": [{"name": "Formula Name", "formula": "Mathematical Formula", "description": "Usage"}],
        "examples": [{"question": "Example Question", "solution": "Step by step solution"}],
        "difficulty": "easy|medium|hard",
        "estimatedTime": 15
      }`;
      
    case 'ncert-solutions':
      return basePrompt + `
      {
        "chapterTitle": "Chapter Title",
        "chapterNumber": "Chapter Number",
        "questions": [
          {
            "questionNumber": "1.1",
            "question": "Question text",
            "solution": "Detailed step-by-step solution",
            "difficulty": "easy|medium|hard",
            "topics": ["Topic 1", "Topic 2"]
          }
        ]
      }`;
      
    case 'flow-charts':
      return basePrompt + `
      {
        "title": "Flow Chart Title",
        "description": "Brief description",
        "steps": [
          {"step": 1, "title": "Step Title", "description": "Step Description", "connections": ["next_step_id"]},
          {"step": 2, "title": "Step Title", "description": "Step Description", "connections": ["next_step_id"]}
        ],
        "concepts": ["Concept 1", "Concept 2"]
      }`;
      
    default:
      return basePrompt + `
      {
        "title": "Content Title",
        "content": "Organized content",
        "sections": [{"heading": "Section Title", "content": "Section Content"}]
      }`;
  }
}

// Parse AI-processed content
function parseProcessedContent(content, type) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, create structured content from text
    return createStructuredContent(content, type);
  } catch (error) {
    console.error('Content parsing error:', error);
    return createStructuredContent(content, type);
  }
}

// Create structured content from text
function createStructuredContent(content, type) {
  const lines = content.split('\n').filter(line => line.trim());
  
  switch (type) {
    case 'flash-notes':
      return {
        title: lines[0] || 'Flash Notes',
        keyPoints: lines.slice(1, 6),
        difficulty: 'medium',
        estimatedTime: 15
      };
      
    case 'ncert-solutions':
      return {
        chapterTitle: lines[0] || 'NCERT Solutions',
        questions: [{
          questionNumber: '1',
          question: lines[1] || 'Question not found',
          solution: lines.slice(2).join('\n') || 'Solution not found'
        }]
      };
      
    case 'flow-charts':
      return {
        title: lines[0] || 'Flow Chart',
        description: lines[1] || 'Flow chart description',
        steps: lines.slice(2).map((line, index) => ({
          step: index + 1,
          title: line,
          description: line,
          connections: []
        }))
      };
      
    default:
      return {
        title: lines[0] || 'Educational Content',
        content: content,
        sections: [{ heading: 'Content', content: content }]
      };
  }
}

// Generate fallback content when AI processing fails
function generateFallbackContent(text, type, subject, chapter) {
  return {
    title: `${subject}${chapter ? ` - ${chapter}` : ''}`,
    content: text,
    type: type,
    status: 'needs_review',
    note: 'Content extracted without AI processing - requires manual review'
  };
}

// Validate processed content
export function validateProcessedContent(content, type) {
  const errors = [];
  
  if (!content.title) {
    errors.push('Title is required');
  }
  
  switch (type) {
    case 'flash-notes':
      if (!content.keyPoints || !Array.isArray(content.keyPoints)) {
        errors.push('Key points are required for flash notes');
      }
      break;
      
    case 'ncert-solutions':
      if (!content.questions || !Array.isArray(content.questions)) {
        errors.push('Questions are required for NCERT solutions');
      }
      break;
      
    case 'flow-charts':
      if (!content.steps || !Array.isArray(content.steps)) {
        errors.push('Steps are required for flow charts');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Extract keywords for search indexing
export function extractKeywords(content, type) {
  const text = JSON.stringify(content).toLowerCase();
  const words = text.match(/\b\w{3,}\b/g) || [];
  
  // Remove common words and duplicates
  const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
  
  const keywords = [...new Set(words)]
    .filter(word => !commonWords.includes(word))
    .slice(0, 20); // Limit to 20 keywords
    
  return keywords;
}
