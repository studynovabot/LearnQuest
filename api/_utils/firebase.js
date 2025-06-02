// Firebase utilities for Vercel serverless functions
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let firebaseApp = null;
let db = null;

export function initializeFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, db };
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
      db = getFirestore(firebaseApp);
      return { app: firebaseApp, db };
    }

    // Use environment variables for Firebase credentials
    const projectId = process.env.FIREBASE_PROJECT_ID || 'studynovabot';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@studynovabot.iam.gserviceaccount.com';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is required');
    }

    // Clean up the private key (remove extra quotes and fix newlines)
    const cleanPrivateKey = privateKey.replace(/\\n/g, '\n');

    const serviceAccount = {
      type: "service_account",
      project_id: projectId,
      private_key: cleanPrivateKey,
      client_email: clientEmail,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
    };

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId
    });

    db = getFirestore(firebaseApp);

    console.log('✅ Firebase initialized successfully with project:', projectId);
    return { app: firebaseApp, db };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

export function getFirestoreDb() {
  if (!db) {
    const { db: database } = initializeFirebase();
    return database;
  }
  return db;
}
