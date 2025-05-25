// Vercel serverless function for user registration
import { handleCors } from '../_utils/cors.js';
import { initializeFirebase } from '../_utils/firebase.js';
import { storage } from '../_utils/storage.js';
import bcrypt from 'bcryptjs';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('📝 Registration API called:', req.method, req.url);

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
      console.log('📧 Registration request:', { email, displayName, isPro });

      if (!email || !password || !displayName) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
          message: 'Email, password, and display name are required' 
        });
      }

      console.log('🔍 Checking if user already exists...');
      const existingUser = await storage.getUserByEmail(email);

      if (existingUser) {
        console.log('❌ User already exists');
        return res.status(409).json({ 
          message: 'User already exists with this email' 
        });
      }

      console.log('🔐 Hashing password...');
      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log('👤 Creating new user...');

      // Check if user should be admin
      const adminEmails = ['thakurranveersingh505@gmail.com', 'tradingproffical@gmail.com'];
      const isAdmin = adminEmails.includes(email);

      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password: hashedPassword,
        displayName,
        isPro: isPro || false,
        className: '',
        board: '',
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
        updatedAt: new Date()
      };

      console.log('💾 Saving user to storage...');
      const savedUser = await storage.createUser(newUser);

      // Don't return the password
      const { password: _, ...userWithoutPassword } = savedUser;

      console.log('✅ Registration successful for user:', userWithoutPassword.id);
      return res.status(201).json({
        user: userWithoutPassword,
        welcomeBonus: 100
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ message: errorMessage });
    }
  });
}
