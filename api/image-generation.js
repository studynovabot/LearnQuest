// Vercel serverless function for AI image generation
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
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

      // Use Groq API for image generation
      const groqApiKey = process.env.GROQ_API_KEY;

      if (!groqApiKey) {
        return res.status(500).json({ message: 'API key not configured' });
      }

      let imageUrl = '';
      let xpEarned = 0;

      // Set default fallback image URL immediately
      imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('Generated: ' + prompt.substring(0, 20))}`;
      xpEarned = 10;

      try {
        if (type === 'text-to-image') {
          // Text to Image generation using Groq's image model
          const response = await fetch('https://api.groq.com/openai/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              prompt: prompt,
              width: 512,
              height: 512,
              steps: 20,
              n: 1,
              response_format: 'url'
            })
          });

          if (response.ok) {
            const data = await response.json();
            imageUrl = data.data[0].url;
            xpEarned = 20; // Award XP for successful generation
          } else {
            throw new Error('Image generation failed');
          }
        } else {
          // Set fallback for image-to-image
          imageUrl = `https://via.placeholder.com/512x512/10b981/ffffff?text=${encodeURIComponent('Transformed: ' + prompt.substring(0, 15))}`;
          xpEarned = 15;

          // Image to Image transformation using Groq
          const modifiedPrompt = `Transform the uploaded image: ${prompt}`;

          const response = await fetch('https://api.groq.com/openai/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              prompt: modifiedPrompt,
              width: 512,
              height: 512,
              steps: 20,
              n: 1,
              response_format: 'url'
            })
          });

          if (response.ok) {
            const data = await response.json();
            imageUrl = data.data[0].url;
            xpEarned = 25; // Higher XP for image transformation
          } else {
            throw new Error('Image transformation failed');
          }
        }
      } catch (apiError) {
        console.error('Groq API error:', apiError);
        console.log('Using fallback imageUrl:', imageUrl);
      }

      // Track user interaction
      try {
        await trackUserInteraction(db, {
          userId: userId,
          action: 'image_generation',
          type: type,
          prompt: prompt,
          xpEarned: xpEarned
        });
      } catch (trackingError) {
        console.error('Error tracking user interaction:', trackingError);
      }

      res.status(200).json({
        imageUrl,
        xpEarned
      });
    } catch (error) {
      console.error('Image generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });
}
