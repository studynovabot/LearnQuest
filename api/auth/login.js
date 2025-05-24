// Vercel serverless function for user login
import { handleCors } from '../_utils/cors.js';
import { initializeFirebase } from '../_utils/firebase.js';
import { storage } from '../_utils/storage.js';
import bcrypt from 'bcryptjs';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('🔐 Login API called:', req.method);

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      console.log('🔄 Initializing Firebase...');
      // Initialize Firebase
      initializeFirebase();
      console.log('✅ Firebase initialized');

      const { email, password } = req.body;
      console.log('📧 Login attempt for email:', email);

      if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      console.log('🔍 Looking up user by email...');
      const user = await storage.getUserByEmail(email);

      if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('✅ User found, verifying password...');
      // Compare password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log('❌ Invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('✅ Password valid, adding login XP...');
      // Add login XP reward
      const loginXP = user.isPro ? 30 : 15;
      const updatedUser = await storage.addUserXP(user.id, loginXP);

      // Don't return the password
      const { password: _, ...userWithoutPassword } = updatedUser;

      console.log('✅ Login successful for user:', userWithoutPassword.id);
      return res.status(200).json({
        user: userWithoutPassword,
        loginReward: loginXP,
        streakUpdated: false
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ message: errorMessage });
    }
  });
}
