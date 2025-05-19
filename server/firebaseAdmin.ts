import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Firebase credentials - in production, these should be loaded from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || 'studynovabot';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@studynovabot.iam.gserviceaccount.com';
const privateKey = process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDnDGTbgrgqLdkJ\ncLeQrISyvZsVH4UcWDNEhFqX5d4AUD/l+q962HYGdkgS6k4v1jvNzb0U5T3byTAm\nrGpSGVJE3qRvP9C3kFlNWGbObYGNcaF62zO0/46vVM1PxTsuovhau8j8Grd5543T\nf/ktkp+nC8CbL0DGLitdWNGMNjdneNVVtDqZaiU7jID/oMKW6tpQLXBHaDvfR2TH\nbzQz7FvEIEPQ/d/rIjt95pLuvKusV/6LxOwC18GEjlIfqX49WVYbULU2H4kGfDYl\nhZt+PatEBf81Apc3wU9vN/LbYQmQGoU7S6v3/jU9IxPEOafmXY3wGyZduIXmvDJR\nPPcuwlG/AgMBAAECggEAaXUNv+eNWastihKJpp4nv1GtrFmDrylO1TI4C2bfCnOW\nhskCOWb9j/uC8CdD4q+9AjWq3RO5RU0yDiTaLnjiRQ7+LM0K3g4jxJrZ6dSvsjiw\nRNwyYKXYoYxqXcOfPK0kAH3/wZoMLrcS0/twZ22qM1u44NwTi6FdJ7E3i/DfHvl5\nEBi4ndlaFgpKt5dmBaoeTsFYkyMr5vXVyyGe+4OWqgg+ewQwHuohI9m23Ns401Z1\naGXx8s0eQBnOtWnQZVd+LyAuBjSasDvuQpXXCaUjDffzHqnNV/6VH/fYZATPVWGW\n6uRCUu0TuVW52dftaerISzapZ+J0+/7p2ZuZMFBqeQKBgQD35MiI152Gn3j7RQhI\nuMQ1sZkLszfAVLZnqTYGUS0YnCak3ooCQNufGAVeePIc3Rr+Rzfef6MKoOmrENRg\nxSVzN66aGERj8ivQbZXpCYrBEfaja3pzfkR3LGPr4Z2+k9EFMURYTbDTP+Pvkz8f\ne19niOw3MkTGO5x1HoFQudYDOwKBgQDumpeYijJ/EcyI2oZr8XCYIlo8x4GYrj9f\nK0nBYmMW6euzcQ5h0+rrHbOVeG9bOYlifaxzHfiRORH1e6Ln9D7YQ2MkbuNGp4R8\nkHlMXIvZdHQ/9Z2RsKOhGVsOAMdhdSMuyLG1j3OxKm4J2C5gP09u/Bqnmg8SXKwa\nRa1KmCJ7TQKBgCRpDDNdSBvv7Hsrpo3X5anlTg9z4Wp0ht4u8mp3HeKRfPOWZDr0\nf82cX52Csj0fFMnoeAJMSQxUmj2wGSGlk1ya/yBPFCyB84GHtw8lgaXeF5XlQXUZ\nRMEkWgDZgKvvVjInDFzT/Hbq2XXk8M6U9mxkph1tWsCrHM3vDxtmUFLlAoGAC50u\nv9gKOTEumYK5hEuORXl2lvrHDh19LC65OlaFqDnepS9dmdls1+DsOtxP30rfqxGe\n8UOGM9tpSl+oQE4dOP2et8lF+sxwoHePz+25SO5oMizMbKkCbfcD/ZyAF/hRrBdM\nvx+qa/c6v/Pr3fd28FoJGhtfnG8yWV0G4FijZQkCgYBHK3mMmJX6B0o84lv7OswO\npqUitFTR4u3ZxaW/huA5uXZ99QsqldISbbBynBaaXYiFZ68O0AftA2Y0peAK1FXI\ncmbULlmh3ixbd4FXp+957l/QiDbigyfrlqyPBWuWoBDmv4ygq8plZreNN7DWhLmk\nCpmAwsIt14tI8+PTE3WEXQ==\n-----END PRIVATE KEY-----\n";

console.log('Initializing Firebase with project ID:', projectId);

// Initialize Firebase Admin with service account credentials
let app;
let firestoreDb;

try {
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      // Add databaseURL to fix connection issues
      databaseURL: `https://${projectId}.firebaseio.com`
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase Admin app');
  }

  // Get Firestore instance
  firestoreDb = getFirestore(app);

  // Test Firestore connection
  firestoreDb.collection('test').doc('connection-test').set({
    timestamp: new Date(),
    status: 'connected'
  }).then(() => {
    console.log('Firestore connection test successful');
  }).catch(err => {
    console.error('Firestore connection test failed:', err);
  });

  console.log('Firestore instance created successfully');

} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  if (error instanceof Error) {
    throw new Error(`Firebase initialization failed: ${error.message}. Please check your credentials and ensure the Firestore API is enabled.`);
  } else {
    throw new Error('Firebase initialization failed due to an unknown error. Please check your credentials and ensure the Firestore API is enabled.');
  }
}

export const adminDb = firestoreDb;

export function initializeFirebase() {
  if (getApps().length === 0) {
    console.log('Initializing Firebase with project ID:', process.env.FIREBASE_PROJECT_ID || projectId);
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || clientEmail,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || privateKey).replace(/\\n/g, '\n')
      }),
      // Add databaseURL to fix connection issues
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || projectId}.firebaseio.com`
    });
    console.log('Firebase Admin initialized successfully');
  }
}