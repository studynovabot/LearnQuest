// Clean storage utilities for Vercel serverless functions
import { getFirestoreDb } from './firebase.js';

export class FirebaseStorage {
  constructor() {
    this.db = null;
  }

  getFirestoreDb() {
    if (!this.db) {
      this.db = getFirestoreDb();
    }
    return this.db;
  }

  async createUser(userData) {
    const db = this.getFirestoreDb();

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

    await db.collection('users').doc(user.id).set(user);
    return user;
  }

  async getUserByEmail(email) {
    const db = this.getFirestoreDb();

    const snapshot = await db.collection('users').where('email', '==', email).get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
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
    const userRef = db.collection('users').doc(userId);

    await userRef.update({
      lastLogin: new Date(),
      updatedAt: new Date()
    });

    const updatedDoc = await userRef.get();
    if (!updatedDoc.exists) {
      throw new Error('User not found after update');
    }

    return updatedDoc.data();
  }
}

// Export singleton instance
export const storage = new FirebaseStorage();