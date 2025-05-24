// Storage utilities for Vercel serverless functions
import { getFirestoreDb } from './firebase.js';
import bcrypt from 'bcryptjs';

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
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      password: hashedPassword,
      displayName: userData.displayName,
      isPro: userData.isPro || false,
      xp: 0,
      streak: 0,
      className: '',
      board: '',
      avatarUrl: '',
      createdAt: new Date(),
      lastLogin: new Date()
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

  async addUserXP(userId, xpAmount) {
    const db = this.getFirestoreDb();
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      xp: require('firebase-admin/firestore').FieldValue.increment(xpAmount)
    });
    
    const updatedDoc = await userRef.get();
    return updatedDoc.data();
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
