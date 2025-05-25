// Vercel serverless function for authentication (login and register)
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';
import bcrypt from 'bcryptjs';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('🔐 Auth API called:', req.method, req.url);

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      console.log('🔄 Initializing Firebase...');
      // Initialize Firebase
      initializeFirebase();
      console.log('✅ Firebase initialized');

      const { action, email, password, displayName, isPro } = req.body;
      console.log('📧 Auth request:', { action, email, displayName, isPro });

      if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Determine action from URL or body
      const authAction = action || (req.url?.includes('register') ? 'register' : 'login');

      if (authAction === 'login') {
        // Handle login
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

      } else if (authAction === 'register') {
        // Handle registration
        if (!displayName) {
          console.log('❌ Missing display name for registration');
          return res.status(400).json({ message: 'Display name is required for registration' });
        }

        console.log('🔍 Checking if user already exists...');
        const existingUser = await storage.getUserByEmail(email);

        if (existingUser) {
          console.log('❌ User already exists');
          return res.status(409).json({ message: 'User already exists with this email' });
        }

        console.log('🔐 Hashing password...');
        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('👤 Creating new user...');

        // Check if user should be admin
        const adminEmails = ['thakurranveersingh505@gmail.com'];
        const isAdmin = adminEmails.includes(email);

        // Create new user
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email,
          password: hashedPassword,
          displayName,
          isPro: isPro || false,
          xp: 100, // Welcome bonus
          level: 1,
          streak: 0,
          title: undefined,
          avatarUrl: undefined,
          questionsCompleted: 0,
          hoursStudied: 0,
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

      } else {
        console.log('❌ Invalid action:', authAction);
        return res.status(400).json({ message: 'Invalid action. Use "login" or "register"' });
      }

    } catch (error) {
      console.error('❌ Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ message: errorMessage });
    }
  });
}
