// createUserWithEmail.js
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function createUser() {
  try {
    const userRef = db.collection('users').doc('user-123');

    // Hash the password
    const hashedPassword = await bcrypt.hash('India#321', 10);

    await userRef.set({
      email: "thakurranveersingh505@gmail.com",
      password: hashedPassword,
      displayName: "Ranveer Singh",
      xp: 0,
      level: 1,
      streak: 0,
      isPro: false,
      title: null,
      avatarUrl: null,
      questionsCompleted: 0,
      hoursStudied: 0,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('User user-123 created with email field!');
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createUser();
