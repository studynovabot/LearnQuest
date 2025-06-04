// Firebase utilities for Vercel serverless functions
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase-config';

let firebaseApp;
let firestoreDb;

// Initialize Firebase
export async function initializeFirebase() {
  if (!firebaseApp) {
    try {
      console.log('🔥 Initializing Firebase with config:', firebaseConfig);
      firebaseApp = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw error;
    }
  }
  return firebaseApp;
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
