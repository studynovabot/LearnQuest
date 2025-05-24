import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Only use environment variables for credentials
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing Firebase Admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.');
}

console.log('Initializing Firebase with project ID:', projectId);

let app;
let firestoreDb;

try {
  if (getApps().length === 0) {
    let formattedPrivateKey = privateKey;
    if (privateKey && !privateKey.includes('\n')) {
      formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    }
    if (formattedPrivateKey && !formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.error('Private key does not start with the expected header. This may cause authentication issues.');
    }
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
      databaseURL: `https://${projectId}.firebaseio.com`
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase Admin app');
  }
  firestoreDb = getFirestore(app);
  console.log('Firestore instance created successfully');
  // Optionally, you can export firestoreDb here if needed
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  throw error;
}

export const adminDb = firestoreDb;

export function initializeFirebase() {
  // This function is now a no-op, kept for compatibility
  return firestoreDb;
}