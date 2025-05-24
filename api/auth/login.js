// Vercel serverless function for user login
import { handleCors } from '../_utils/cors.js';
import { initializeFirebase } from '../_utils/firebase.js';
import { storage } from '../_utils/storage.js';
import bcrypt from 'bcryptjs';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Initialize Firebase
      initializeFirebase();

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Add login XP reward
      const loginXP = user.isPro ? 30 : 15;
      const updatedUser = await storage.addUserXP(user.id, loginXP);

      // Don't return the password
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        user: userWithoutPassword,
        loginReward: loginXP,
        streakUpdated: false
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
