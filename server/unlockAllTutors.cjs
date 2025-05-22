const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function unlockAllTutorsForUser() {
  console.log('🔓 Unlocking all tutors for existing users...');
  
  // Get all users
  const usersSnapshot = await db.collection('users').get();
  const allTutorIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    console.log(`🔓 Unlocking tutors for user: ${userId}`);
    
    for (const tutorId of allTutorIds) {
      try {
        const uniqueId = `userTutor_${userId}_${tutorId}_${Date.now()}`;
        const userTutorRef = db.collection('userTutors').doc(uniqueId);
        
        await userTutorRef.set({
          id: uniqueId,
          userId,
          tutorId,
          unlocked: true
        });
        
        console.log(`✅ Unlocked tutor ${tutorId} for user ${userId}`);
      } catch (error) {
        console.log(`ℹ️ Tutor ${tutorId} may already be unlocked for user ${userId}`);
      }
    }
  }
  
  console.log('✅ All tutors unlocked for all users!');
  process.exit(0);
}

unlockAllTutorsForUser().catch(error => {
  console.error('❌ Error during unlocking:', error);
  process.exit(1);
});
