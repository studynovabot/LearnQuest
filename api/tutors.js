// Vercel serverless function for AI tutors
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default async function handler(req, res) {
  try {
    // Handle CORS
    handleCors(req, res);
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('📚 Fetching tutors from Firebase...');

    // Skip Firebase and use only the original 15 tutors to avoid duplicates
    console.log('📚 Using original 15 tutors (skipping Firebase to avoid duplicates)');
    // Return all AI tutors - all unlocked by default now
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

    console.log('📚 Returning fallback tutors data');
    
    // Use the response object properly
    res.status(200).json(tutors);
    return;
  } catch (error) {
    console.error('❌ Tutors API error:', error);
    
    // Ensure response object exists before using it
    if (res && typeof res.status === 'function') {
      res.status(500).json({ 
        error: 'Failed to fetch tutors', 
        details: error.message 
      });
    } else {
      console.error('Critical: Response object not available');
    }
    return;
  }
}
