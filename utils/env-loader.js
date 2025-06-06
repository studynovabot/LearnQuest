// Environment variable loader for serverless functions
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Load environment variables from .env files
 * This ensures environment variables are properly loaded in serverless functions
 */
export function loadEnvVariables() {
  try {
    // Try to load from .env file in the root directory
    const rootEnvPath = path.resolve(process.cwd(), '.env');
    
    if (fs.existsSync(rootEnvPath)) {
      console.log('📄 Loading environment variables from .env file');
      config({ path: rootEnvPath });
    }
    
    // Also try to load from .env.local if it exists
    const localEnvPath = path.resolve(process.cwd(), '.env.local');
    
    if (fs.existsSync(localEnvPath)) {
      console.log('📄 Loading environment variables from .env.local file');
      config({ path: localEnvPath });
    }
    
    // Check if Firebase configuration is loaded
    const firebaseConfigLoaded = 
      process.env.FIREBASE_API_KEY && 
      process.env.FIREBASE_PROJECT_ID;
    
    if (firebaseConfigLoaded) {
      console.log('✅ Firebase configuration loaded successfully');
    } else {
      console.warn('⚠️ Firebase configuration not found in environment variables');
    }
    
    return firebaseConfigLoaded;
  } catch (error) {
    console.error('❌ Error loading environment variables:', error);
    return false;
  }
}

/**
 * Get Firebase configuration from environment variables
 * @returns {Object} Firebase configuration object
 */
export function getFirebaseConfigFromEnv() {
  return {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
      process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
  };
}