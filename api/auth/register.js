// Vercel serverless function for user registration
import { handleCors } from '../_utils/cors.js';
import { initializeFirebase } from '../_utils/firebase.js';
import { storage } from '../_utils/storage.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('📝 Register API called:', req.method);

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      console.log('🔄 Initializing Firebase...');
      // Initialize Firebase
      initializeFirebase();
      console.log('✅ Firebase initialized');

      const { email, password, displayName, isPro } = req.body;
      console.log('📧 Registration attempt for email:', email);

      // Validate input
      if (!email || !password || !displayName) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ message: 'Email, password, and display name are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format');
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }

      console.log('🔍 Checking if user already exists...');
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('❌ Email already exists');
        return res.status(409).json({ message: 'Email already exists' });
      }

      console.log('✅ Email available, creating user...');
      // Create user
      const userData = {
        email,
        password,
        displayName,
        isPro: Boolean(isPro)
      };

      const user = await storage.createUser(userData);
      console.log('✅ User created successfully:', user.id);

      // Unlock ALL tutors for new users
      console.log('🔓 Unlocking all tutors for new user...');
      const allTutorIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
      for (const tutorId of allTutorIds) {
        try {
          await storage.unlockTutor(user.id, tutorId);
          console.log(`✅ Unlocked tutor ${tutorId} for new user ${user.id}`);
        } catch (error) {
          console.log(`⚠️ Failed to unlock tutor ${tutorId} for user ${user.id}:`, error);
        }
      }

      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      console.log('✅ Registration successful for user:', userWithoutPassword.id);
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ message: errorMessage });
    }
  });
}
