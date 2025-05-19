import express from 'express';
import { adminDb } from '../firebaseAdmin';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check Firebase connection
    const testRef = adminDb.collection('test').doc('health-check');
    await testRef.set({
      timestamp: new Date(),
      status: 'ok'
    });
    
    // If we get here, Firebase is connected
    res.json({
      status: 'ok',
      firebase: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      firebase: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error connecting to Firebase',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
