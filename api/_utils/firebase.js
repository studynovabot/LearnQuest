// Firebase utilities for Vercel serverless functions
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase-config.js';

let firebaseApp;
let firestoreDb;

// Initialize Firebase
export async function initializeFirebase() {
  if (!firebaseApp) {
    try {
      // Only log non-sensitive config info
      console.log('🔥 Initializing Firebase for project:', firebaseConfig.projectId);
      firebaseApp = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('❌ Firebase initialization error:', error.message);
      throw error;
    }
  }
  return firebaseApp;
}

// Get Firestore instance
export function getFirestoreDb() {
  if (!firestoreDb) {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }
    firestoreDb = getFirestore(firebaseApp);
  }
  return firestoreDb;
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
