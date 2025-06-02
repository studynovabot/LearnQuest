// Storage utilities for Vercel serverless functions
import { getFirestoreDb } from './firebase.js';

// In-memory storage for development (will be replaced with Firebase when properly configured)
let inMemoryUsers = new Map();
let inMemoryTutors = new Map();
let inMemoryUserTutors = new Map();

export class FirebaseStorage {
  constructor() {
    this.db = null;
    this.useInMemory = false;
  }

  getFirestoreDb() {
    try {
      if (!this.db) {
        this.db = getFirestoreDb();
      }
      return this.db;
    } catch (error) {
      console.log('⚠️ Firebase not available, using in-memory storage');
      this.useInMemory = true;
      return null;
    }
  }

  async createUser(userData) {
    const db = this.getFirestoreDb();

    // Password should already be hashed by the calling function
    const user = {
      id: userData.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      email: userData.email,
      password: userData.password, // Already hashed
      displayName: userData.displayName,
      isPro: userData.isPro || false,
      className: userData.className || '',
      board: userData.board || '',
      role: userData.role || 'user',
      createdAt: userData.createdAt || new Date(),
      lastLogin: userData.lastLogin || new Date(),
      updatedAt: userData.updatedAt || new Date()
    };

    if (this.useInMemory || !db) {
      // Use in-memory storage
      inMemoryUsers.set(user.email, user);
      console.log('✅ User created in memory:', user.email);
      return user;
    } else {
      // Use Firebase
      await db.collection('users').doc(user.id).set(user);
      return user;
    }
  }

  async getUserByEmail(email) {
    const db = this.getFirestoreDb();

    if (this.useInMemory || !db) {
      // Use in-memory storage
      const user = inMemoryUsers.get(email);
      console.log('🔍 Looking up user in memory:', email, user ? 'found' : 'not found');
      return user || null;
    } else {
      // Use Firebase
      const snapshot = await db.collection('users').where('email', '==', email).get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data();
    }
  }

  async getUser(userId) {
    const db = this.getFirestoreDb();
    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data();
  }

  async updateUserLastLogin(userId) {
    const db = this.getFirestoreDb();

    if (this.useInMemory || !db) {
      // Use in-memory storage - find user by ID
      for (const [email, user] of inMemoryUsers.entries()) {
        if (user.id === userId) {
          user.lastLogin = new Date();
          user.updatedAt = new Date();
          inMemoryUsers.set(email, user);
          console.log('✅ Updated user last login in memory:', email);
          return user;
        }
      }
      console.log('❌ User not found in memory for ID:', userId);
      return null;
    } else {
      // Use Firebase
      const userRef = db.collection('users').doc(userId);

      try {
        await userRef.update({
          lastLogin: new Date(),
          updatedAt: new Date()
        });

        const updatedDoc = await userRef.get();
        if (!updatedDoc.exists) {
          throw new Error('User not found after update');
        }

        return updatedDoc.data();
      } catch (error) {
        console.error('❌ Error updating user last login:', error);
        // Return the original user data if update fails
        const userDoc = await userRef.get();
        return userDoc.exists ? userDoc.data() : null;
      }
    }
  }

  async getAllTutors() {
    const db = this.getFirestoreDb();
    const snapshot = await db.collection('tutors').get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async getUserTutors(userId) {
    const allTutors = await this.getAllTutors();
    const db = this.getFirestoreDb();

    // Get user's unlocked tutors
    const unlockedSnapshot = await db.collection('user_tutors')
      .where('userId', '==', userId)
      .get();

    const unlockedTutorIds = unlockedSnapshot.docs.map(doc => doc.data().tutorId);

    return allTutors.map(tutor => ({
      ...tutor,
      unlocked: unlockedTutorIds.includes(tutor.id)
    }));
  }

  async unlockTutor(userId, tutorId) {
    const db = this.getFirestoreDb();

    // Check if already unlocked
    const existingSnapshot = await db.collection('user_tutors')
      .where('userId', '==', userId)
      .where('tutorId', '==', tutorId)
      .get();

    if (!existingSnapshot.empty) {
      return true; // Already unlocked
    }

    // Add unlock record
    await db.collection('user_tutors').add({
      userId,
      tutorId,
      unlockedAt: new Date()
    });

    return true;
  }
}

// Export singleton instance
export const storage = new FirebaseStorage();
