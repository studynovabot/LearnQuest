// Vercel serverless function for user registration
import { handleCors } from '../_utils/cors.js';
import { initializeFirebase } from '../_utils/firebase.js';
import { storage } from '../_utils/storage.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Initialize Firebase
      initializeFirebase();

      const { email, password, displayName, isPro } = req.body;

      // Validate input
      if (!email || !password || !displayName) {
        return res.status(400).json({ message: 'Email, password, and display name are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // Create user
      const userData = {
        email,
        password,
        displayName,
        isPro: Boolean(isPro)
      };

      const user = await storage.createUser(userData);

      // Unlock ALL tutors for new users
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
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
