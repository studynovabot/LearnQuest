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
    // Log Firebase configuration details (without sensitive info)
    console.log('Firebase configuration:');
    console.log('- Project ID:', projectId);
    console.log('- Client Email:', clientEmail);
    console.log('- Private Key exists:', !!privateKey);
    console.log('- Private Key length:', privateKey ? privateKey.length : 0);

    // Check if private key is properly formatted
    let formattedPrivateKey = privateKey;

    // If the private key doesn't contain newlines, try to format it
    if (privateKey && !privateKey.includes('\n')) {
      console.log('Private key does not contain newlines, attempting to format it');
      formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Additional check to ensure the private key is properly formatted
    if (formattedPrivateKey && !formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.error('Private key does not start with the expected header. This may cause authentication issues.');
    }

    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
        // Add databaseURL to fix connection issues
        databaseURL: `https://${projectId}.firebaseio.com`
      });
      console.log('Firebase Admin initialized successfully');
    } catch (initError) {
      console.error('Error during Firebase initialization:', initError);

      // Try an alternative initialization approach
      console.log('Attempting alternative initialization approach...');

      // Try with explicit JSON parsing for the private key
      try {
        const explicitPrivateKey = JSON.parse(`"${privateKey}"`);
        app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: explicitPrivateKey,
          }),
          databaseURL: `https://${projectId}.firebaseio.com`
        });
        console.log('Firebase Admin initialized successfully with alternative approach');
      } catch (altError) {
        console.error('Alternative initialization also failed:', altError);
        throw initError; // Throw the original error
      }
    }
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase Admin app');
  }

  // Get Firestore instance
  firestoreDb = getFirestore(app);
  console.log('Firestore instance created successfully');

  // Test Firestore connection with retry logic
  let retryCount = 0;
  const maxRetries = 3;

  const testConnection = async () => {
    try {
      await firestoreDb.collection('test').doc('connection-test').set({
        timestamp: new Date(),
        status: 'connected'
      });
      console.log('Firestore connection test successful');
      return true;
    } catch (err) {
      console.error(`Firestore connection test failed (attempt ${retryCount + 1}/${maxRetries}):`, err);

      if (retryCount < maxRetries - 1) {
        retryCount++;
        console.log(`Retrying connection in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return testConnection();
      } else {
        console.error('All Firestore connection attempts failed. This may indicate issues with Firestore permissions or API enablement');
        return false;
      }
    }
  };

  // Execute the test connection
  testConnection();

} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);

  // Provide more detailed error information
  if (error instanceof Error) {
    const errorMessage = error.message;
    console.error('Error details:', errorMessage);

    // Check for common error patterns
    if (errorMessage.includes('credential')) {
      console.error('This appears to be a credential issue. Check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    } else if (errorMessage.includes('permission')) {
      console.error('This appears to be a permissions issue. Make sure your Firebase service account has the necessary permissions.');
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      console.error('This appears to be a resource not found issue. Make sure your Firebase project exists and is correctly configured.');
    }

    // In production, log the error but don't crash the server
    if (process.env.NODE_ENV === 'production') {
      console.error('Continuing despite Firebase initialization error in production mode');
      // Create a mock Firestore instance that logs errors instead of crashing
      firestoreDb = createMockFirestoreDb();
    } else {
      throw new Error(`Firebase initialization failed: ${errorMessage}. Please check your credentials and ensure the Firestore API is enabled.`);
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error('Continuing despite Firebase initialization error in production mode');
      firestoreDb = createMockFirestoreDb();
    } else {
      throw new Error('Firebase initialization failed due to an unknown error. Please check your credentials and ensure the Firestore API is enabled.');
    }
  }
}

// Create a mock Firestore DB that logs errors instead of crashing
function createMockFirestoreDb() {
  const mockDb = {
    collection: (name: string) => ({
      doc: (id?: string) => {
        const docId = id || `mock-${Date.now()}`;
        const docRef = {
          id: docId,
          get: async () => ({ exists: false, data: () => null }),
          set: async () => console.error(`Mock Firestore: Cannot write to ${name}/${docId} - Firebase not initialized`),
          update: async () => console.error(`Mock Firestore: Cannot update ${name}/${docId} - Firebase not initialized`),
          delete: async () => console.error(`Mock Firestore: Cannot delete ${name}/${docId} - Firebase not initialized`)
        };
        return docRef;
      },
      where: () => ({
        get: async () => ({ empty: true, docs: [] }),
        orderBy: () => ({
          get: async () => ({ empty: true, docs: [] }),
          limit: () => ({
            get: async () => ({ empty: true, docs: [] })
          })
        }),
        limit: () => ({
          get: async () => ({ empty: true, docs: [] })
        })
      }),
      orderBy: () => ({
        get: async () => ({ empty: true, docs: [] }),
        limit: () => ({
          get: async () => ({ empty: true, docs: [] })
        })
      }),
      limit: () => ({
        get: async () => ({ empty: true, docs: [] })
      }),
      get: async () => ({ empty: true, docs: [] })
    }),
    batch: () => ({
      set: () => {},
      update: () => {},
      delete: () => {},
      commit: async () => {}
    })
  };

  console.warn('Using mock Firestore database - data operations will not work');
  return mockDb;
}

export const adminDb = firestoreDb;

export function initializeFirebase() {
  if (getApps().length === 0) {
    console.log('Initializing Firebase with project ID:', process.env.FIREBASE_PROJECT_ID || projectId);

    // Get the private key and ensure it's properly formatted
    const privateKeyToUse = process.env.FIREBASE_PRIVATE_KEY || privateKey;
    let formattedPrivateKey = privateKeyToUse;

    // If the private key doesn't contain newlines, try to format it
    if (privateKeyToUse && !privateKeyToUse.includes('\n')) {
      console.log('Private key does not contain newlines, attempting to format it');
      formattedPrivateKey = privateKeyToUse.replace(/\\n/g, '\n');
    }

    // Additional check to ensure the private key is properly formatted
    if (formattedPrivateKey && !formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.error('Private key does not start with the expected header. This may cause authentication issues.');
    }

    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || clientEmail,
          privateKey: formattedPrivateKey
        }),
        // Add databaseURL to fix connection issues
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || projectId}.firebaseio.com`
      });
      console.log('Firebase Admin initialized successfully');
    } catch (initError) {
      console.error('Error during Firebase initialization:', initError);

      // Try an alternative initialization approach
      console.log('Attempting alternative initialization approach...');

      try {
        // Try with explicit JSON parsing for the private key
        const explicitPrivateKey = JSON.parse(`"${privateKeyToUse}"`);
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID || projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || clientEmail,
            privateKey: explicitPrivateKey
          }),
          databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || projectId}.firebaseio.com`
        });
        console.log('Firebase Admin initialized successfully with alternative approach');
      } catch (altError) {
        console.error('Alternative initialization also failed:', altError);

        // In production, continue despite errors
        if (process.env.NODE_ENV === 'production') {
          console.error('Continuing despite Firebase initialization error in production mode');
        } else {
          throw initError; // Throw the original error in development
        }
      }
    }
  }
}