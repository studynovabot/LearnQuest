// Firebase utilities for Vercel serverless functions
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from '../firebase-config.js';

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
        // Validate Firebase config before initializing
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          console.error('❌ Firebase configuration is incomplete:', 
            JSON.stringify({
              apiKeyPresent: !!firebaseConfig.apiKey,
              projectIdPresent: !!firebaseConfig.projectId,
              authDomainPresent: !!firebaseConfig.authDomain,
              storageBucketPresent: !!firebaseConfig.storageBucket,
              appIdPresent: !!firebaseConfig.appId
            })
          );
          return null;
        }
        
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
      // Just log the error and return null
      return null;
    }
  }
  return firebaseApp;
}

// Get Firestore instance
export function getFirestoreDb() {
  // If Firebase app is not initialized, we can't get Firestore
  if (!firebaseApp) {
    console.error('❌ Cannot initialize Firestore: Firebase app is not initialized');
    return null;
  }
  
  // If Firestore is already initialized, return it
  if (firestoreDb) {
    return firestoreDb;
  }
  
  // Initialize Firestore
  try {
    firestoreDb = getFirestore(firebaseApp);
    
    // Verify that Firestore was initialized correctly
    if (!firestoreDb) {
      console.error('❌ Firestore initialization failed: getFirestore returned null or undefined');
      return null;
    }
    
    console.log('📄 Firestore initialized successfully');
    return firestoreDb;
  } catch (error) {
    console.error('❌ Firestore initialization error:', error);
    // Return null instead of throwing to prevent app crashes
    return null;
  }
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
