// Vercel serverless function for image analysis (OCR + AI explanation)
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Real OCR function using OCR.space API
async function performOCR(imageData) {
  try {
    // Use OCR.space API as primary OCR service
    const ocrApiKey = process.env.OCR_SPACE_API_KEY || 'K85411479688957';

    console.log('🔍 Starting OCR with API key:', ocrApiKey.substring(0, 8) + '...');
    console.log('📷 Image data length:', imageData.length);

    // Convert base64 to proper format for OCR.space
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    console.log('📝 Base64 image length after cleanup:', base64Image.length);

    // Use a simpler approach with URL encoding instead of multipart form data
    const formData = new URLSearchParams();
    formData.append('base64Image', `data:image/png;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    console.log('🚀 Sending request to OCR.space...');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': ocrApiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    console.log('📡 OCR.space response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OCR.space response:', JSON.stringify(data, null, 2));

      if (data.ParsedResults && data.ParsedResults[0]) {
        const result = data.ParsedResults[0];

        if (result.ParsedText && result.ParsedText.trim().length > 0) {
          const extractedText = result.ParsedText.trim();
          console.log('🎉 Successfully extracted text:', extractedText);
          return extractedText;
        }

        if (result.ErrorMessage) {
          console.error('❌ OCR.space parsing error:', result.ErrorMessage);
          throw new Error(`OCR parsing error: ${result.ErrorMessage}`);
        }
      }

      if (data.ErrorMessage && data.ErrorMessage.length > 0) {
        console.error('❌ OCR.space API error:', data.ErrorMessage);
        throw new Error(`OCR.space error: ${data.ErrorMessage.join(', ')}`);
      }

      console.log('⚠️ No text detected in the image');
      return 'No text detected in the image.';
    } else {
      const errorText = await response.text();
      console.error('❌ OCR.space HTTP error:', response.status, errorText);
      throw new Error(`OCR.space HTTP error: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('💥 Primary OCR error:', error);
    // If primary OCR fails, try the backup method
    return await backupOCR(imageData);
  }
}

// Backup OCR method with simpler approach
async function backupOCR(imageData) {
  try {
    console.log('🔄 Using backup OCR method with Engine 1...');

    // Simple backup approach - try with different OCR engine
    const ocrApiKey = process.env.OCR_SPACE_API_KEY || 'K85411479688957';
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

    // Try with OCR Engine 1 instead of 2 using URL encoding
    const formData = new URLSearchParams();
    formData.append('base64Image', `data:image/png;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('OCREngine', '1');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': ocrApiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    console.log('🔄 Backup OCR response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('🔄 Backup OCR response:', JSON.stringify(data, null, 2));

      if (data.ParsedResults && data.ParsedResults[0] && data.ParsedResults[0].ParsedText) {
        const extractedText = data.ParsedResults[0].ParsedText.trim();
        if (extractedText && extractedText.length > 0) {
          console.log('✅ Backup OCR successful:', extractedText);
          return extractedText;
        }
      }
    }

    console.log('❌ Backup OCR also failed');
    return 'Unable to extract text from image. Please ensure the image contains clear, readable text.';

  } catch (error) {
    console.error('❌ Backup OCR error:', error);
    return 'Unable to extract text from image. Please ensure the image contains clear, readable text.';
  }
}

// Generate AI explanation based on extracted text
async function generateExplanation(extractedText, apiKey) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an educational AI assistant. Analyze the text extracted from an image and provide a detailed explanation, solution, or educational context. If it\'s a math problem, solve it step by step. If it\'s a question, provide a comprehensive answer.'
          },
          {
            role: 'user',
            content: `Please analyze and explain this text extracted from an image: "${extractedText}"`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    } else {
      throw new Error('AI explanation generation failed');
    }
  } catch (error) {
    console.error('AI explanation error:', error);
    return generateFallbackExplanation(extractedText);
  }
}

function generateFallbackExplanation(text) {
  if (text.includes('x') && (text.includes('=') || text.includes('solve'))) {
    return `This appears to be a mathematical equation. To solve equations like this:
1. Identify the variable (usually x)
2. Isolate the variable by performing inverse operations
3. Check your answer by substituting back
4. For example, if the equation is 2x + 5 = 15:
   - Subtract 5 from both sides: 2x = 10
   - Divide by 2: x = 5
   - Check: 2(5) + 5 = 15 ✓`;
  } else if (text.toLowerCase().includes('photosynthesis')) {
    return `This question is about photosynthesis, the process by which plants make their own food:
- Raw materials: Carbon dioxide (CO₂) + Water (H₂O) + Sunlight
- Location: Occurs in chloroplasts of green leaves
- Process: Chlorophyll absorbs light energy to convert CO₂ and H₂O into glucose
- Products: Glucose (food) + Oxygen (O₂)
- Equation: 6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂
- Importance: Provides food for plants and oxygen for all living beings`;
  } else if (text.toLowerCase().includes('water cycle')) {
    return `The water cycle is the continuous movement of water on Earth:
1. Evaporation: Sun heats water bodies, converting water to vapor
2. Transpiration: Plants release water vapor through leaves
3. Condensation: Water vapor cools and forms clouds
4. Precipitation: Water falls as rain, snow, or hail
5. Collection: Water collects in rivers, lakes, and groundwater
This cycle is essential for distributing fresh water across the planet.`;
  } else {
    return `Based on the extracted text, this appears to be educational content. Here's what I can help you understand:

The text contains information that can be broken down and explained step by step. If this is:
- A math problem: I can help solve it systematically
- A science question: I can provide detailed explanations with examples
- A language question: I can help with grammar, vocabulary, or comprehension
- A history/geography question: I can provide context and detailed answers

Feel free to ask specific questions about any part of this content for more detailed explanations!`;
  }
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('🚀 Image analysis API called with method:', req.method);

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      const { imageData, type } = req.body;
      const userId = req.headers['x-user-id'] || 'demo-user';

      console.log('📋 Request details:', {
        userId,
        type,
        hasImageData: !!imageData,
        imageDataLength: imageData ? imageData.length : 0
      });

      if (!imageData) {
        console.log('❌ No image data provided');
        return res.status(400).json({ message: 'Image data is required' });
      }

      // Extract text from image (OCR)
      let extractedText = '';
      try {
        console.log('🔍 Starting OCR process...');
        extractedText = await performOCR(imageData);
        console.log('✅ OCR completed. Extracted text:', extractedText);
      } catch (ocrError) {
        console.error('❌ OCR error:', ocrError);
        extractedText = 'Unable to extract text from image. Please ensure the image contains clear, readable text.';
      }

      // Generate AI explanation
      const groqApiKey = process.env.GROQ_API_KEY || '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';
      let explanation = '';

      if (extractedText && extractedText !== 'Unable to extract text from image. Please ensure the image contains clear, readable text.') {
        explanation = await generateExplanation(extractedText, groqApiKey);
      } else {
        explanation = 'Could not generate explanation due to text extraction issues. Please try with a clearer image.';
      }

      const xpEarned = 15; // Award XP for image analysis

      // Record the analysis in database
      try {
        await db.collection('image_analyses').add({
          userId,
          type: type || 'ocr-analysis',
          extractedText,
          explanation,
          timestamp: new Date(),
          xpEarned
        });

        // Update user's XP
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const currentXP = userDoc.data().xp || 0;
          await userRef.update({
            xp: currentXP + xpEarned,
            lastActivity: new Date()
          });
        }

      } catch (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the request if database update fails
      }

      res.status(200).json({
        extractedText,
        explanation,
        xpEarned,
        message: 'Image analyzed successfully'
      });

    } catch (error) {
      console.error('Image analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}
