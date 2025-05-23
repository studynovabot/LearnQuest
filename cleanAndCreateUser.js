// cleanAndCreateUser.js - Clean old users and create new one with email schema
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function deleteAllUsers() {
  try {
    console.log('🧹 Deleting all existing users...');
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${snapshot.docs.length} users`);
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  }
}

async function createUser() {
  try {
    console.log('👤 Creating new user with email schema...');
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
    
    console.log('✅ User created with email field!');
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

async function main() {
  await deleteAllUsers();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  await createUser();
  process.exit(0);
}

main();
