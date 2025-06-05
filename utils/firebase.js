// Firebase utilities for Vercel serverless functions
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from '../firebase-config';

// Initialize Firebase
let firebaseApp;
let firestoreDb;
let auth;
let storage;

export function initializeFirebase() {
  if (!firebaseApp) {
    try {
      // Check if Firebase is already initialized to prevent duplicate apps
      if (getApps().length === 0) {
        // Create a new app instance
        firebaseApp = initializeApp(firebaseConfig);
        console.log('🔥 Firebase initialized successfully');
      } else {
        // Use existing app instance
        firebaseApp = getApp();
        console.log('ℹ️ Using existing Firebase app');
      }
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      // Don't throw error to prevent app from crashing
      // Just log the error and continue without Firebase
    }
  }
  return firebaseApp;
}

// Get Firestore instance
export function getFirestoreDb() {
  if (!firestoreDb && firebaseApp) {
    try {
      firestoreDb = getFirestore(firebaseApp);
    } catch (error) {
      console.error('❌ Firestore initialization error:', error);
      // Return null instead of throwing to prevent app crashes
      return null;
    }
  }
  return firestoreDb;
}

// Get Auth instance
export function getAuthInstance() {
  if (!auth && firebaseApp) {
    try {
      auth = getAuth(firebaseApp);
    } catch (error) {
      console.error('❌ Firebase Auth initialization error:', error);
      return null;
    }
  }
  return auth;
}

// Get Storage instance
export function getStorageInstance() {
  if (!storage && firebaseApp) {
    try {
      storage = getStorage(firebaseApp);
    } catch (error) {
      console.error('❌ Firebase Storage initialization error:', error);
      return null;
    }
  }
  return storage;
}

export async function getUserPerformanceData(userId) {
  const db = getFirestoreDb();
  if (!db) return null;
  
  try {
    // Import needed functions
    const { doc, getDoc } = await import('firebase/firestore');
    
    const docRef = doc(db, 'userPerformance', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user performance data:', error);
    return null;
  }
}
