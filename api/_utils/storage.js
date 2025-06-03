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

  async getUserById(userId) {
    const db = this.getFirestoreDb();
    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data();
  }

  async updateUserPassword(userId, hashedPassword) {
    const db = this.getFirestoreDb();
    const userRef = db.collection('users').doc(userId);

    await userRef.update({
      password: hashedPassword,
      updatedAt: new Date(),
      passwordChangedAt: new Date()
    });

    return true;
  }

  async deleteUser(userId) {
    const db = this.getFirestoreDb();
    const batch = db.batch();

    // Get user data first
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    // Delete user's chat history
    const chatQuery = await db.collection('chats').where('userId', '==', userId).get();
    chatQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user's content uploads
    const uploadsQuery = await db.collection('contentUploads').where('userId', '==', userId).get();
    uploadsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user document
    batch.delete(userDoc.ref);

    // Create deletion log for audit purposes
    const deletionLog = {
      userId: userId,
      userEmail: userData.email,
      deletedAt: new Date(),
      deletionReason: 'User requested account deletion',
      userRole: userData.role || 'user',
      accountCreatedAt: userData.createdAt || null
    };

    batch.set(db.collection('deletionLogs').doc(), deletionLog);

    // Execute batch deletion
    await batch.commit();

    return true;
  }
}

// Export singleton instance
export const storage = new FirebaseStorage();