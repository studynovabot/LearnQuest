// Simple test endpoint for image generation
import { handleCors } from './_utils/cors.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      console.log('Test image generation request:', prompt);

      // Return a test image URL immediately
      const testImageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
      
      res.status(200).json({
        imageUrl: testImageUrl,
        xpEarned: 10,
        message: 'Test image generated successfully'
      });
    } catch (error) {
      console.error('Test image generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });
}
