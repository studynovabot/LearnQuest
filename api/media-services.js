// Consolidated Media Services API - handles image analysis and image generation
import { handleCors } from '../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';

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
      body: formData
    });

    console.log('✅ OCR.space response status:', response.status);

    if (!response.ok) {
      console.error('❌ OCR.space API request failed with status:', response.status);
      const errorText = await response.text();
      console.error('❌ OCR.space error response:', errorText);
      throw new Error(`OCR service failed with status ${response.status}: ${errorText}`);
    }

    const ocrResult = await response.json();
    console.log('📄 OCR.space response structure:', JSON.stringify(ocrResult, null, 2));

    if (ocrResult.OCRExitCode !== 1) {
      console.error('❌ OCR processing failed:', ocrResult.ErrorMessage?.[0] || 'Unknown error');
      throw new Error(ocrResult.ErrorMessage?.[0] || 'OCR processing failed');
    }

    const extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || '';
    console.log('📝 Extracted text from OCR.space:', extractedText);

    return extractedText.trim();

  } catch (error) {
    console.error('❌ OCR Error:', error.message);
    throw new Error(`OCR failed: ${error.message}`);
  }
}

// Function to get AI explanation using Groq
async function getAIExplanation(extractedText) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      throw new Error('GROQ API key not configured');
    }

    console.log('🤖 Getting AI explanation for text:', extractedText.substring(0, 100) + '...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert tutor helping students understand educational content. When given text from an image (like a question, problem, or study material), provide a clear, helpful explanation.

Guidelines:
- If it's a math problem, explain the concepts and solution steps
- If it's a science question, explain the scientific principles
- If it's text-based content, summarize and explain key concepts
- Use simple language suitable for students
- Provide examples where helpful
- Be encouraging and supportive
- If the text is unclear or incomplete, mention this and work with what's available

Keep your response focused, educational, and under 300 words unless the content requires more detail.`
          },
          {
            role: 'user',
            content: `Please explain this educational content I extracted from an image: "${extractedText}"`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const result = await response.json();
    const explanation = result.choices?.[0]?.message?.content || 'Unable to generate explanation';
    
    console.log('🎯 AI explanation generated successfully');
    return explanation;

  } catch (error) {
    console.error('❌ AI Explanation Error:', error.message);
    return 'I was able to extract the text from your image, but I\'m having trouble generating an explanation right now. Please try again or ask your teacher for help with this content.';
  }
}

// Handle Image Analysis service
async function handleImageAnalysis(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestoreDb();

    const { imageData } = req.body;
    const userId = req.headers['x-user-id'] || 'demo-user';

    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    console.log('🖼️ Starting image analysis for user:', userId);
    console.log('📊 Image data received, length:', imageData.length);

    // Step 1: Extract text from image using OCR
    console.log('🔍 Step 1: Extracting text from image...');
    const extractedText = await performOCR(imageData);
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.log('⚠️ No text found in image');
      return res.status(400).json({ 
        message: 'No readable text found in the image. Please ensure the image contains clear text and try again.',
        extractedText: '',
        explanation: ''
      });
    }

    console.log('✅ Text extracted successfully:', extractedText.substring(0, 100) + '...');

    // Step 2: Get AI explanation
    console.log('🤖 Step 2: Getting AI explanation...');
    const explanation = await getAIExplanation(extractedText);
    console.log('✅ AI explanation generated');

    // Step 3: Award XP points (optional)
    const xpEarned = 10; // Base XP for image analysis
    console.log(`🎁 Awarding ${xpEarned} XP to user ${userId}`);

    // Step 4: Store interaction in database (optional, don't fail if it doesn't work)
    try {
      await db.collection('image_analysis_logs').add({
        userId,
        extractedText,
        explanation,
        xpEarned,
        timestamp: new Date(),
        imageSize: imageData.length
      });
      console.log('💾 Interaction logged to database');
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
}

// Handle Image Generation service
async function handleImageGeneration(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestoreDb();

    const { prompt, sourceImage, type } = req.body;
    const userId = req.headers['x-user-id'] || 'demo-user';

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Use Starry AI for image generation
    const starryApiKey = process.env.STARRY_AI_API_KEY || 'Bcv0WVCdscDikozcYN8HdwwTzt7inw';

    if (!starryApiKey) {
      console.error('❌ Starry AI API key not configured');
      return res.status(500).json({ message: 'Starry AI API key not configured' });
    }

    console.log('🎨 Starting image generation with Starry AI...');
    console.log('💭 Prompt:', prompt);
    console.log('🔧 Type:', type);

    // Prepare the request body for Starry AI
    const requestBody = {
      prompt: prompt,
      style: type || 'realistic',
      format: 'png',
      size: '1024x1024'
    };

    if (sourceImage) {
      requestBody.source_image = sourceImage;
    }

    console.log('🚀 Sending request to Starry AI API...');

    const response = await fetch('https://api.starryai.com/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${starryApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Starry AI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Starry AI API error:', errorData);
      return res.status(500).json({ 
        message: 'Image generation failed', 
        error: `Starry AI API error: ${response.status}` 
      });
    }

    const result = await response.json();
    console.log('✅ Image generation response received');

    // Extract the generated image URL
    const imageUrl = result.data?.[0]?.url || result.url || result.image_url;

    if (!imageUrl) {
      console.error('❌ No image URL in response:', result);
      return res.status(500).json({ 
        message: 'Image generation failed - no image URL received' 
      });
    }

    console.log('🖼️ Generated image URL:', imageUrl);

    // Award XP
    const xpEarned = 15;

    // Log the generation (optional)
    try {
      await db.collection('image_generations').add({
        userId,
        prompt,
        type: type || 'realistic',
        imageUrl,
        xpEarned,
        timestamp: new Date(),
        provider: 'starry_ai'
      });
      console.log('💾 Generation logged to database');
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if database logging fails
    }

    res.status(200).json({
      imageUrl,
      prompt,
      type: type || 'realistic',
      xpEarned,
      message: 'Image generated successfully!'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
}

// Main handler with routing
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const { service } = req.query;
    
    try {
      switch (service) {
        case 'image-analysis':
          return await handleImageAnalysis(req, res);
        case 'image-generation':
          return await handleImageGeneration(req, res);
        default:
          return res.status(400).json({ 
            error: 'Invalid service parameter. Use: image-analysis or image-generation' 
          });
      }
    } catch (error) {
      console.error('Media Services API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}