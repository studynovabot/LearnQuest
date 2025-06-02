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

    // Use your actual Firebase project credentials
    const projectId = 'learnquest-ai';
    const serviceAccount = {
      type: "service_account",
      project_id: projectId,
      private_key_id: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
      private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
UAoAMhYiwL+Edt/yrMRE4O4+/LolitNaY7mlbfDu0Vo23MjqQBaJ5UOASAhzA6+9
WJO3RIrAiQQBtQEOILmuFqBujsscfnpC1urIVNuUBuoy6L4wZaiLbMpLHrn1
FbcfYdVRIyDxdwdxMHocAQYkuAjXEuOiifqfMjkQn9Ll+DiWolKXRlBhMTi10+
zqnyAGCfPw2iIkVx2IgAa6Dsg+SqorSLuTuHiYsIlVLXgHcGxaXB5Rg7z0X9UJ
OOVkLcXSmA+oo5+cSCS3DCJVYvs0+bDBHdAipmgEHKRJWoWnFb0WoWoWnFb0Wo
WoWnFb0WoWoWnFb0WoWnFb0WoWoWnFb0WoWnFb0WoWoWnFb0WoWoWnFb0WoWo
AgMBAAECggEBALc+lQh2QpuXhuW8++DQkf3G1o/+Nxo6l8AKaQiAjXiQBtQEOIL
muFqBujsscfnpC1urIVNuUBuoy6L4wZaiLbMpLHrn1FbcfYdVRIyDxdwdxMHoc
AQYkuAjXEuOiifqfMjkQn9Ll+DiWolKXRlBhMTi10+zqnyAGCfPw2iIkVx2IgA
a6Dsg+SqorSLuTuHiYsIlVLXgHcGxaXB5Rg7z0X9UJOOVkLcXSmA+oo5+cSCS3
DCJVYvs0+bDBHdAipmgEHKRJWoWnFb0WoWoWnFb0WoWoWnFb0WoWoWnFb0WoWo
WnFb0WoWnFb0WoWoWnFb0WoWoWnFb0WoWoWnFb0WoWoWnFb0WoWoWnFb0WoWo
QKBgQDYyCWUuyFQs0i2XnDVEhQGm+6LWnOhL2+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
QKBgQDYyCWUuyFQs0i2XnDVEhQGm+6LWnOhL2+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
QKBgQDYyCWUuyFQs0i2XnDVEhQGm+6LWnOhL2+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
QKBgQDYyCWUuyFQs0i2XnDVEhQGm+6LWnOhL2+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
QKBgQDYyCWUuyFQs0i2XnDVEhQGm+6LWnOhL2+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+
-----END PRIVATE KEY-----`,
      client_email: "firebase-adminsdk-xyz@learnquest-ai.iam.gserviceaccount.com",
      client_id: "123456789012345678901",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40learnquest-ai.iam.gserviceaccount.com"
    };

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId
    });

    db = getFirestore(firebaseApp);

    console.log('✅ Firebase initialized successfully');
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
