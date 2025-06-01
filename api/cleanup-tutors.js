// Vercel serverless function to clean up duplicate tutors in Firebase
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  // Only allow POST requests for safety
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed for cleanup'
    });
  }

  try {
    console.log('🧹 Starting tutors cleanup...');
    
    // Initialize Firebase
    const { db } = initializeFirebase();
    
    // Get all tutors from Firebase
    const tutorsRef = db.collection('tutors');
    const snapshot = await tutorsRef.get();
    
    const deletedTutors = [];
    const keptTutors = [];
    
    // Delete all tutors to clean up duplicates
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
      deletedTutors.push(doc.id);
    });
    
    await batch.commit();
    
    console.log(`🗑️ Deleted ${deletedTutors.length} tutors from Firebase`);
    
    return res.status(200).json({
      success: true,
      message: 'Tutors cleanup completed - Firebase tutors collection cleared',
      deletedCount: deletedTutors.length,
      deletedTutors: deletedTutors,
      note: 'The app will now use the original 15 tutors from the API instead of Firebase'
    });

  } catch (error) {
    console.error('❌ Tutors cleanup failed:', error);
    return res.status(500).json({
      success: false,
      message: `Tutors cleanup failed: ${error.message}`
    });
  }
}
