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

      // Determine action from URL or body - handle both /auth and /auth/register patterns
      let authAction = action;
      if (!authAction) {
        if (req.url?.includes('/register') || req.url?.includes('register')) {
          authAction = 'register';
        } else if (req.url?.includes('/login') || req.url?.includes('login')) {
          authAction = 'login';
        } else {
          authAction = 'login'; // default to login
        }
      }

      console.log('🎯 Determined action:', authAction);

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

        console.log('✅ Password valid, checking if first login...');

        // Check if this is the user's first login (within 5 minutes of account creation)
        let createdAt, lastLogin, isFirstLogin;

        try {
          // Handle different date formats from Firestore
          if (user.createdAt && user.createdAt.toDate) {
            // Firestore Timestamp
            createdAt = user.createdAt.toDate();
          } else if (user.createdAt) {
            // String or Date object
            createdAt = new Date(user.createdAt);
          } else {
            // Fallback to current time
            createdAt = new Date();
          }

          if (user.lastLogin && user.lastLogin.toDate) {
            // Firestore Timestamp
            lastLogin = user.lastLogin.toDate();
          } else if (user.lastLogin) {
            // String or Date object
            lastLogin = new Date(user.lastLogin);
          } else {
            lastLogin = null;
          }

          const now = new Date();
          const timeSinceCreation = now.getTime() - createdAt.getTime();
          isFirstLogin = !lastLogin || timeSinceCreation < (5 * 60 * 1000); // 5 minutes

          console.log('🕐 First login check:', {
            createdAt: createdAt.toISOString(),
            lastLogin: lastLogin?.toISOString(),
            timeSinceCreation: timeSinceCreation / 1000 / 60,
            isFirstLogin
          });
        } catch (dateError) {
          console.error('❌ Date parsing error:', dateError);
          // Fallback: assume it's not first login
          isFirstLogin = false;
        }

        // Update lastLogin timestamp
        const updatedUser = await storage.updateUserLastLogin(user.id);

        // Don't return the password and add first login flag
        const { password: _, ...userWithoutPassword } = {
          ...updatedUser,
          isFirstLogin
        };

        console.log('✅ Login successful for user:', userWithoutPassword.id, 'First login:', isFirstLogin);
        return res.status(200).json({
          user: userWithoutPassword,
          isFirstLogin
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
        const adminEmails = ['thakurranveersingh505@gmail.com', 'tradingproffical@gmail.com'];
        const isAdmin = adminEmails.includes(email);

        // Create new user
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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

        // Don't return the password and mark as first login
        const { password: _, ...userWithoutPassword } = {
          ...savedUser,
          isFirstLogin: true
        };

        console.log('✅ Registration successful for user:', userWithoutPassword.id);
        return res.status(201).json({
          user: userWithoutPassword,
          isFirstLogin: true
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
