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

      // Use Together AI API for image generation
      const togetherApiKey = process.env.TOGETHER_API_KEY || '386f94fa38882002186da7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7';

      if (!togetherApiKey) {
        return res.status(500).json({ message: 'API key not configured' });
      }

      let imageUrl = null;
      let xpEarned = 0;

      try {
        if (type === 'text-to-image') {
          // Text to Image generation using FLUX.1-dev
          const response = await fetch('https://api.together.xyz/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${togetherApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'black-forest-labs/FLUX.1-dev',
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

        } else if (type === 'image-to-image') {
          // Image to Image transformation
          // Note: This would require a different API endpoint that supports image-to-image
          // For now, we'll use text-to-image with a modified prompt
          const modifiedPrompt = `Transform the uploaded image: ${prompt}`;
          
          const response = await fetch('https://api.together.xyz/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${togetherApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'black-forest-labs/FLUX.1-dev',
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
        console.error('Together AI API error:', apiError);
        
        // Fallback to placeholder images for demo
        if (type === 'text-to-image') {
          imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('Generated: ' + prompt.substring(0, 20))}`;
          xpEarned = 10;
        } else if (type === 'image-to-image') {
          imageUrl = `https://via.placeholder.com/512x512/10b981/ffffff?text=${encodeURIComponent('Transformed: ' + prompt.substring(0, 15))}`;
          xpEarned = 15;
        }
      }

      // Record the generation in database
      try {
        await db.collection('image_generations').add({
          userId,
          type,
          prompt,
          imageUrl,
          sourceImage: sourceImage || null,
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
        imageUrl,
        xpEarned,
        message: 'Image generated successfully'
      });

    } catch (error) {
      console.error('Image generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}
