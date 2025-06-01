// Vercel serverless function for health check
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed for health check'
    });
  }

  try {
    console.log('🏥 Health check started...');
    
    const healthStatus = {
      status: 'ok',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      firebase: 'unknown',
      tutorsCount: 0,
      environment: process.env.NODE_ENV || 'development'
    };

    // Test Firebase connection
    try {
      console.log('🔥 Testing Firebase connection...');
      const { db } = initializeFirebase();
      
      // Try to read from tutors collection to verify connection
      const tutorsRef = db.collection('tutors');
      const snapshot = await tutorsRef.limit(1).get();
      
      if (snapshot.empty) {
        console.log('📚 Tutors collection is empty, but Firebase is connected');
        healthStatus.firebase = 'connected';
        healthStatus.tutorsCount = 0;
        healthStatus.message = 'Firebase connected but tutors collection is empty';
      } else {
        console.log('✅ Firebase connection successful');
        // Get total count of tutors
        const allTutorsSnapshot = await tutorsRef.get();
        healthStatus.firebase = 'connected';
        healthStatus.tutorsCount = allTutorsSnapshot.size;
        healthStatus.message = `Firebase connected with ${allTutorsSnapshot.size} tutors`;
      }
    } catch (firebaseError) {
      console.error('❌ Firebase connection failed:', firebaseError);
      healthStatus.firebase = 'disconnected';
      healthStatus.status = 'warning';
      healthStatus.message = `Firebase connection failed: ${firebaseError.message}`;
    }

    // Test Groq API connection
    try {
      console.log('🤖 Testing Groq API connection...');
      const groqApiKey = process.env.GROQ_API_KEY || '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';
      
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Groq API connection successful');
        healthStatus.groq = 'connected';
      } else {
        console.log('⚠️ Groq API connection failed');
        healthStatus.groq = 'disconnected';
      }
    } catch (groqError) {
      console.error('❌ Groq API test failed:', groqError);
      healthStatus.groq = 'disconnected';
    }

    console.log('🏥 Health check completed:', healthStatus);
    return res.status(200).json(healthStatus);

  } catch (error) {
    console.error('❌ Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      message: `Health check failed: ${error.message}`,
      timestamp: new Date().toISOString(),
      firebase: 'unknown'
    });
  }
}
