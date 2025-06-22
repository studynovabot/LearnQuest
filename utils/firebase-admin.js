// Firebase Admin SDK initialization for server-side operations
import admin from 'firebase-admin';
import { loadEnvVariables } from './env-loader.js';
import { firebaseConfig } from '../firebase-config.js';

// Ensure environment variables are loaded
loadEnvVariables();

// Initialize Firebase Admin
let adminApp;
let adminFirestore;

/**
 * Initialize Firebase Admin SDK (Optimized for Vercel)
 * @returns {admin.app.App} Firebase Admin app instance
 */
export function initializeFirebaseAdmin() {
  if (!adminApp) {
    try {
      // Check if Firebase Admin is already initialized
      if (admin.apps.length === 0) {
        console.log('🚀 Initializing Firebase Admin (cold start)...');
        const initStart = Date.now();
        
        // Create credential from private key (optimized validation)
        const serviceAccount = {
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey
        };

        // Quick validation
        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
          console.error('❌ Firebase Admin service account incomplete');
          return null;
        }

        // Initialize the app with minimal config for faster startup
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId
        });
        
        console.log(`✅ Firebase Admin initialized in ${Date.now() - initStart}ms`);
      } else {
        // Use existing app instance (warm start)
        adminApp = admin.app();
        console.log('ℹ️ Using existing Firebase Admin app');
      }
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
      return null;
    }
  }
  return adminApp;
}

/**
 * Get Firestore Admin instance
 * @returns {admin.firestore.Firestore} Firestore Admin instance
 */
export function getFirestoreAdminDb() {
  // If Firebase Admin app is not initialized, initialize it
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
    if (!adminApp) {
      console.error('❌ Cannot initialize Firestore Admin: Firebase Admin app initialization failed');
      return null;
    }
  }
  
  // If Firestore Admin is already initialized, return it
  if (adminFirestore) {
    return adminFirestore;
  }
  
  // Initialize Firestore Admin
  try {
    adminFirestore = admin.firestore(adminApp);
    
    // Verify the connection by setting some default settings
    adminFirestore.settings({ ignoreUndefinedProperties: true });
    
    console.log('📄 Firestore Admin initialized successfully');
    return adminFirestore;
  } catch (error) {
    console.error('❌ Firestore Admin initialization error:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

/**
 * Get Auth Admin instance
 * @returns {admin.auth.Auth} Auth Admin instance
 */
export function getAuthAdmin() {
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
    if (!adminApp) return null;
  }
  
  try {
    return adminApp.auth();
  } catch (error) {
    console.error('❌ Firebase Auth Admin initialization error:', error);
    return null;
  }
}