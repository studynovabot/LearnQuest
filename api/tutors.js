// Vercel serverless function for AI tutors
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  try {
    if (req.method === 'GET') {
      console.log('📚 Fetching tutors from Firebase...');

      // Try to get tutors from Firebase first
      try {
        const { db } = initializeFirebase();
        const tutorsRef = db.collection('tutors');
        const snapshot = await tutorsRef.get();

        if (!snapshot.empty) {
          const tutors = [];
          snapshot.forEach(doc => {
            tutors.push({ id: doc.id, ...doc.data() });
          });
          console.log(`✅ Found ${tutors.length} tutors in Firebase`);
          return res.status(200).json(tutors);
        } else {
          console.log('⚠️ No tutors found in Firebase, using fallback data');
        }
      } catch (firebaseError) {
        console.error('❌ Firebase error, using fallback data:', firebaseError);
      }
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
      return res.status(200).json(tutors);

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Tutors API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}
