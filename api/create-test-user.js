// Vercel serverless function for creating test user
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('👤 Create test user API called:', req.method);
    
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      console.log('🔄 Initializing Firebase...');
      // Initialize Firebase
      initializeFirebase();
      console.log('✅ Firebase initialized');

      // Check if test user already exists
      const testEmail = 'thakurranveersingh505@gmail.com';
      console.log('🔍 Checking if test user exists...');
      const existingUser = await storage.getUserByEmail(testEmail);
      
      if (existingUser) {
        console.log('✅ Test user already exists');
        const { password: _, ...userWithoutPassword } = existingUser;
        return res.status(200).json({
          message: 'Test user already exists',
          user: userWithoutPassword
        });
      }

      console.log('👤 Creating test user...');
      // Create test user
      const userData = {
        email: testEmail,
        password: 'India#321',
        displayName: 'Ranveer Singh',
        isPro: true
      };

      const user = await storage.createUser(userData);
      console.log('✅ Test user created successfully:', user.id);

      // Unlock ALL tutors for test user
      console.log('🔓 Unlocking all tutors for test user...');
      const allTutorIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
      for (const tutorId of allTutorIds) {
        try {
          await storage.unlockTutor(user.id, tutorId);
          console.log(`✅ Unlocked tutor ${tutorId} for test user ${user.id}`);
        } catch (error) {
          console.log(`⚠️ Failed to unlock tutor ${tutorId} for test user ${user.id}:`, error);
        }
      }

      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      console.log('✅ Test user creation successful');
      return res.status(201).json({
        message: 'Test user created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('❌ Test user creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ message: errorMessage });
    }
  });
}
