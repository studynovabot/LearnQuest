// Vercel serverless function for AI image generation using Starry AI
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

      // Use Starry AI for image generation
      const starryApiKey = process.env.STARRY_AI_API_KEY;

      if (!starryApiKey) {
        return res.status(500).json({ message: 'Starry AI API key not configured' });
      }

      let imageUrl = '';
      let xpEarned = 0;
      let creationId = null;

      // Set default fallback image URL immediately
      imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('Generated: ' + prompt.substring(0, 20))}`;
      xpEarned = 10;

      try {
        console.log(`🎨 Starting ${type} generation with Starry AI`);

        // Create image generation request with Starry AI
        const starryResponse = await fetch('https://api.starryai.com/creations/', {
          method: 'POST',
          headers: {
            'X-API-Key': starryApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            style: 'realistic', // You can make this configurable
            width: 512,
            height: 512,
            steps: 20
          })
        });

        if (starryResponse.ok) {
          const starryData = await starryResponse.json();
          console.log('✅ Starry AI creation response:', starryData);

          creationId = starryData.id;

          // Poll for completion (Starry AI typically processes asynchronously)
          let attempts = 0;
          const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute max wait

          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

            const statusResponse = await fetch(`https://api.starryai.com/creations/${creationId}`, {
              headers: {
                'X-API-Key': starryApiKey,
                'Accept': 'application/json'
              }
            });

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              console.log(`📊 Status check ${attempts + 1}:`, statusData.status);

              if (statusData.status === 'completed' && statusData.images && statusData.images.length > 0) {
                imageUrl = statusData.images[0].url;
                xpEarned = type === 'text-to-image' ? 20 : 25;
                console.log('🎉 Image generation completed:', imageUrl);
                break;
              } else if (statusData.status === 'failed') {
                console.error('❌ Starry AI generation failed');
                break;
              }
            }

            attempts++;
          }

          if (attempts >= maxAttempts) {
            console.log('⏰ Timeout waiting for image generation, using fallback');
          }
        } else {
          const errorText = await starryResponse.text();
          console.error('❌ Starry AI API error:', starryResponse.status, errorText);
          throw new Error(`Starry AI API error: ${starryResponse.status}`);
        }
      } catch (apiError) {
        console.error('🚨 Starry AI error:', apiError);
        console.log('Using fallback imageUrl:', imageUrl);

        // Update fallback based on type
        if (type === 'image-to-image') {
          imageUrl = `https://via.placeholder.com/512x512/10b981/ffffff?text=${encodeURIComponent('Transformed: ' + prompt.substring(0, 15))}`;
          xpEarned = 15;
        }
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

// Track user interaction for analytics
async function trackUserInteraction(db, interaction) {
  try {
    if (!db) {
      console.log('Database not available, skipping interaction tracking');
      return;
    }

    // Save interaction to database
    await db.collection('user_interactions').add({
      ...interaction,
      timestamp: new Date()
    });

    console.log('✅ User interaction tracked successfully');
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    throw error;
  }
}
