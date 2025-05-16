// createUser123.js
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or use cert() with your service account
  });
}

const db = admin.firestore();

async function createUser() {
  const userRef = db.collection('users').doc('user-123');
  await userRef.set({
    username: "thakurranveersingh505@gmail.com",
    displayName: "thakurranveersingh505@gmail.com",
    xp: 0,
    level: 1,
    streak: 0,
    isPro: false,
    title: null,
    avatarUrl: null,
    questionsCompleted: 0,
    hoursStudied: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('User user-123 created!');
}

createUser().catch(console.error);