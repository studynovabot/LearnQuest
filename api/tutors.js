// Vercel serverless function for AI tutors
import { handleCors } from '../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';

export default async function handler(req, res) {
  // Always set Content-Type to application/json first thing
  res.setHeader('Content-Type', 'application/json');
  
  // Initialize other response headers
  const headers = {
    'Cache-Control': 's-maxage=60, stale-while-revalidate'
  };

  try {
    // Handle CORS - make sure this doesn't override our Content-Type
    handleCors(req, res);
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET requests are supported for this endpoint.'
      });
    }

    // Skip Firebase initialization if it causes issues
    try {
      // Initialize Firebase (will use existing instance if already initialized)
      initializeFirebase();
    } catch (firebaseError) {
      console.warn('Firebase initialization skipped:', firebaseError.message);
    }
    
    console.log('📚 Fetching tutors data');
    
    // Use hardcoded tutors as fallback
    const tutors = [
      {
        id: 1,
        name: "Nova AI",
        subject: "General Assistant",
        iconName: "sparkles",
        color: "blue"
      },
      {
        id: 2,
        name: "Math Mentor",
        subject: "Mathematics",
        iconName: "calculator",
        color: "purple"
      },
      {
        id: 3,
        name: "Science Sage",
        subject: "Science",
        iconName: "flask",
        color: "green"
      },
      {
        id: 4,
        name: "Language Linguist",
        subject: "Languages",
        iconName: "languages",
        color: "orange"
      },
      {
        id: 5,
        name: "History Helper",
        subject: "History",
        iconName: "landmark",
        color: "amber"
      },
      {
        id: 6,
        name: "Geography Guide",
        subject: "Geography",
        iconName: "globe",
        color: "cyan"
      },
      {
        id: 7,
        name: "Physics Pro",
        subject: "Physics",
        iconName: "trending-up",
        color: "pink"
      },
      {
        id: 8,
        name: "Chemistry Champion",
        subject: "Chemistry",
        iconName: "flask",
        color: "emerald"
      },
      {
        id: 9,
        name: "Biology Buddy",
        subject: "Biology",
        iconName: "leaf",
        color: "indigo"
      },
      {
        id: 10,
        name: "English Expert",
        subject: "English",
        iconName: "book",
        color: "violet"
      },
      {
        id: 11,
        name: "Computer Coder",
        subject: "Computer Science",
        iconName: "code",
        color: "red"
      },
      {
        id: 12,
        name: "Art Advisor",
        subject: "Arts",
        iconName: "palette",
        color: "teal"
      },
      {
        id: 13,
        name: "Economics Expert",
        subject: "Economics",
        iconName: "trending-up",
        color: "yellow"
      },
      {
        id: 14,
        name: "Psychology Pro",
        subject: "Psychology",
        iconName: "brain",
        color: "slate"
      },
      {
        id: 15,
        name: "Motivational Mentor",
        subject: "Personal Development",
        iconName: "smile",
        color: "rose"
      }
    ];

    console.log('📚 Returning tutors data');
    
    // Return the response with proper headers
    return res.status(200).set(headers).json({
      success: true,
      data: tutors,
      count: tutors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Tutors API error:', error);
    
    // Log detailed error information
    const errorId = `err_${Date.now()}`;
    console.error(`Error ID: ${errorId}`, error);
    
    // Return a structured error response
    return res.status(500).set(headers).json({
      success: false,
      error: 'Failed to fetch tutors',
      message: error.message || 'An unexpected error occurred',
      errorId: errorId,
      timestamp: new Date().toISOString()
    });
  }
}
