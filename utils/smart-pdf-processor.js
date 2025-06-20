// Smart PDF Processor for NCERT Solutions - Extracts Q&A pairs from PDFs
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

// AI API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Extract text from PDF using pdf-parse
 */
export async function extractTextFromPDF(filePath) {
  try {
    console.log('📄 Extracting text from PDF:', filePath);
    
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF
    const data = await pdfParse(dataBuffer);
    
    console.log(`✅ PDF parsed successfully. Pages: ${data.numpages}, Text length: ${data.text.length}`);
    
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('❌ PDF text extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Process extracted text into Q&A pairs using AI
 */
export async function processTextToQAPairs(extractedText, metadata) {
  try {
    console.log('🧠 Processing text into Q&A pairs using AI...');
    
    const { board, class: className, subject, chapter } = metadata;
    
    // Create AI prompt for Q&A extraction
    const prompt = `
You are an expert educational content processor. Extract question-answer pairs from the following NCERT solution text.

IMPORTANT INSTRUCTIONS:
1. Extract ONLY clear question-answer pairs
2. Questions should be complete and meaningful
3. Answers should be detailed and educational
4. Return ONLY a valid JSON array, no other text
5. Each object should have exactly these fields: "question", "answer"
6. Minimum 5 pairs, maximum 50 pairs
7. Skip any incomplete or unclear content

Subject: ${subject}
Class: ${className}
Board: ${board}
Chapter: ${chapter}

Text to process:
${extractedText.substring(0, 8000)} // Limit text to avoid token limits

Return format (JSON array only):
[
  {
    "question": "Complete question text here",
    "answer": "Complete detailed answer here"
  }
]
`;

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content processor. Extract question-answer pairs and return only valid JSON array.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`AI processing failed: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response to extract JSON
    let qaPairs;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        qaPairs = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try parsing the entire response
        qaPairs = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      // Fallback: create basic Q&A pairs from text
      qaPairs = createFallbackQAPairs(extractedText, metadata);
    }

    // Validate and clean Q&A pairs
    const validPairs = qaPairs
      .filter(pair => pair.question && pair.answer)
      .filter(pair => pair.question.length > 10 && pair.answer.length > 20)
      .map((pair, index) => ({
        question: pair.question.trim(),
        answer: pair.answer.trim(),
        questionNumber: index + 1,
        board,
        class: className,
        subject,
        chapter,
        extractedAt: new Date().toISOString(),
        confidence: 0.95
      }));

    console.log(`✅ Extracted ${validPairs.length} Q&A pairs`);
    return validPairs;

  } catch (error) {
    console.error('❌ AI processing error:', error);
    // Return fallback Q&A pairs
    return createFallbackQAPairs(extractedText, metadata);
  }
}

/**
 * Create fallback Q&A pairs when AI processing fails
 */
function createFallbackQAPairs(text, metadata) {
  console.log('⚠️ Creating fallback Q&A pairs...');
  
  const { board, class: className, subject, chapter } = metadata;
  
  // Simple text processing to find potential Q&A patterns
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const pairs = [];
  
  let currentQuestion = '';
  let currentAnswer = '';
  let questionNumber = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for question patterns
    if (line.match(/^\d+\./) || line.includes('?') || line.toLowerCase().includes('question')) {
      if (currentQuestion && currentAnswer) {
        pairs.push({
          question: currentQuestion.trim(),
          answer: currentAnswer.trim(),
          questionNumber: questionNumber++,
          board,
          class: className,
          subject,
          chapter,
          extractedAt: new Date().toISOString(),
          confidence: 0.7
        });
      }
      currentQuestion = line;
      currentAnswer = '';
    } else if (currentQuestion && line.length > 20) {
      currentAnswer += (currentAnswer ? ' ' : '') + line;
    }
  }
  
  // Add the last pair
  if (currentQuestion && currentAnswer) {
    pairs.push({
      question: currentQuestion.trim(),
      answer: currentAnswer.trim(),
      questionNumber: questionNumber,
      board,
      class: className,
      subject,
      chapter,
      extractedAt: new Date().toISOString(),
      confidence: 0.7
    });
  }
  
  // If no pairs found, create a generic one
  if (pairs.length === 0) {
    pairs.push({
      question: `What is covered in ${chapter} of ${subject} for Class ${className}?`,
      answer: text.substring(0, 500) + '...',
      questionNumber: 1,
      board,
      class: className,
      subject,
      chapter,
      extractedAt: new Date().toISOString(),
      confidence: 0.5
    });
  }
  
  console.log(`⚠️ Created ${pairs.length} fallback Q&A pairs`);
  return pairs.slice(0, 20); // Limit to 20 pairs
}

/**
 * Convert Q&A pairs to JSONL format
 */
export function convertToJSONL(qaPairs) {
  return qaPairs.map(pair => JSON.stringify(pair)).join('\n');
}

/**
 * Save JSONL to file
 */
export async function saveJSONLToFile(jsonlContent, outputPath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write JSONL file
    fs.writeFileSync(outputPath, jsonlContent, 'utf8');
    console.log(`✅ JSONL saved to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ Error saving JSONL file:', error);
    throw new Error(`Failed to save JSONL file: ${error.message}`);
  }
}

/**
 * Main function to process PDF to JSONL
 */
export async function processPDFToJSONL(pdfPath, metadata) {
  try {
    console.log('🚀 Starting PDF to JSONL processing...');
    
    // Step 1: Extract text from PDF
    const extractedData = await extractTextFromPDF(pdfPath);
    
    // Step 2: Process text into Q&A pairs
    const qaPairs = await processTextToQAPairs(extractedData.text, metadata);
    
    // Step 3: Convert to JSONL
    const jsonlContent = convertToJSONL(qaPairs);
    
    // Step 4: Generate output filename
    const { board, class: className, subject, chapter } = metadata;
    const filename = `${board.toLowerCase()}-class${className}-${subject.toLowerCase()}-${chapter.toLowerCase().replace(/\s+/g, '-')}.jsonl`;
    const outputPath = path.join(process.cwd(), 'processed-qa', filename);
    
    // Step 5: Save JSONL file
    await saveJSONLToFile(jsonlContent, outputPath);
    
    return {
      success: true,
      qaPairs,
      jsonlContent,
      outputPath,
      filename,
      totalQuestions: qaPairs.length,
      metadata: {
        ...metadata,
        processedAt: new Date().toISOString(),
        pdfPages: extractedData.numPages,
        textLength: extractedData.text.length
      }
    };
    
  } catch (error) {
    console.error('❌ PDF to JSONL processing failed:', error);
    return {
      success: false,
      error: error.message,
      qaPairs: [],
      totalQuestions: 0
    };
  }
}

/**
 * Validate JSONL content
 */
export function validateJSONL(jsonlContent) {
  try {
    const lines = jsonlContent.split('\n').filter(line => line.trim());
    const errors = [];
    
    lines.forEach((line, index) => {
      try {
        const obj = JSON.parse(line);
        
        // Check required fields
        const requiredFields = ['question', 'answer', 'board', 'class', 'subject', 'chapter'];
        const missingFields = requiredFields.filter(field => !obj[field]);
        
        if (missingFields.length > 0) {
          errors.push(`Line ${index + 1}: Missing fields: ${missingFields.join(', ')}`);
        }
        
        // Check field lengths
        if (obj.question && obj.question.length < 10) {
          errors.push(`Line ${index + 1}: Question too short`);
        }
        
        if (obj.answer && obj.answer.length < 20) {
          errors.push(`Line ${index + 1}: Answer too short`);
        }
        
      } catch (parseError) {
        errors.push(`Line ${index + 1}: Invalid JSON format`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      totalLines: lines.length
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error.message}`],
      totalLines: 0
    };
  }
}