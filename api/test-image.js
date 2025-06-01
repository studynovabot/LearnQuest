// Vercel serverless function for testing image generation
import { handleCors } from './_utils/cors.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { prompt } = req.body;
      const userId = req.headers['x-user-id'] || 'demo-user';

      console.log('🧪 Test image generation request:', { prompt, userId });

      // Generate a test image URL using Picsum Photos
      const testImageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;

      console.log('✅ Generated test image URL:', testImageUrl);

      return res.status(200).json({
        success: true,
        imageUrl: testImageUrl,
        message: 'Test image generated successfully',
        prompt: prompt || 'test image',
        type: 'test-image'
      });

    } catch (error) {
      console.error('❌ Test image generation error:', error);
      return res.status(500).json({
        success: false,
        message: `Test image generation failed: ${error.message}`
      });
    }
  });
}
