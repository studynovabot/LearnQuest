// Firebase utilities for Vercel serverless functions
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'studynovabot.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'studynovabot',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'studynovabot.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '250481817155',
  appId: process.env.FIREBASE_APP_ID || '1:250481817155:web:16ef3bbdb36bbc375dc6f6'
};

// Initialize Firebase
export function initializeFirebase() {
  try {
    if (!getApps().length) {
      console.log('🔥 Initializing Firebase with config:', {
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
      });
      return initializeApp(firebaseConfig);
    }
    return getApps()[0];
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
  }
}

// Get Firestore instance
export function getFirestoreDb() {
  if (process.env.NODE_ENV === 'test') {
    const mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ 
        exists: true, 
        data: () => ({ /* mock data */ }) 
      })
    };
    
    return {
      initializeFirebase: jest.fn(),
      getFirestoreDb: () => mockDb,
      getUserPerformanceData: async () => ({ /* mock data */ })
    };
  }
  try {
    const app = initializeFirebase();
    return getFirestore(app);
  } catch (error) {
    console.error('❌ Error getting Firestore instance:', error);
    throw error;
  }
}

export async function getUserPerformanceData(db, userId) {
  try {
    const snapshot = await db.collection('userPerformance').doc(userId).get();
    if (snapshot.exists) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user performance data:', error);
    return null;
  }
}
