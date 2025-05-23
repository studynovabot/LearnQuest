import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin.js';
import {
  type User, type InsertUser,
  type Subject, type InsertSubject,
  type Task, type InsertTask,
  type AITutor,
  type UserTutor,
  type ChatMessage, type InsertChatMessage,
  type StoreItem, type InsertStoreItem,
  type UserItem, type InsertUserItem,
  type Question, type InsertQuestion,
  type Answer, type InsertAnswer,
  type QuestionRating
} from "./types/schema.js";
import { IStorage } from './storage.js';
import bcrypt from 'bcryptjs';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export class FirebaseStorage implements IStorage {
  // Method to get the Firestore database instance
  getFirestoreDb() {
    return adminDb;
  }
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const userDoc = await adminDb.collection('users').doc(id).get();
      if (userDoc.exists) {
        return userDoc.data() as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = adminDb.collection('users');
      const querySnapshot = await usersRef.where('username', '==', username).get();
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          lastLogin: data?.lastLogin?.toDate(),
          createdAt: data?.createdAt?.toDate(),
          updatedAt: data?.updatedAt?.toDate()
        } as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const usersRef = adminDb.collection('users');
      // Generate a unique ID for the document
      const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newUserRef = usersRef.doc(uniqueId);

      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser: User = {
        id: uniqueId,
        ...user,
        password: hashedPassword,
        xp: 0,
        level: 1,
        streak: 0,
        lastLogin: new Date(),
        isPro: user.isPro ?? false,
        title: null,
        avatarUrl: null,
        questionsCompleted: 0,
        hoursStudied: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await newUserRef.set({
        ...newUser,
        lastLogin: newUser.lastLogin ? Timestamp.fromDate(newUser.lastLogin) : null,
        createdAt: Timestamp.fromDate(newUser.createdAt),
        updatedAt: Timestamp.fromDate(newUser.updatedAt)
      });

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    try {
      const userRef = adminDb.collection('users').doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return undefined;
      }

      const updatedData = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await userRef.update(updatedData);

      const updatedUserDoc = await userRef.get();
      const userData = updatedUserDoc.data();
      return {
        id,
        ...userData,
        lastLogin: userData?.lastLogin?.toDate(),
        createdAt: userData?.createdAt?.toDate(),
        updatedAt: userData?.updatedAt?.toDate()
      } as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async updateUserProfile(id: string, data: { displayName?: string; className?: string; board?: string }): Promise<User | undefined> {
    try {
      const userRef = adminDb.collection('users').doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return undefined;
      }

      const updatedData = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await userRef.update(updatedData);

      const updatedUserDoc = await userRef.get();
      const userData = updatedUserDoc.data();
      return {
        id,
        ...userData,
        lastLogin: userData?.lastLogin?.toDate(),
        createdAt: userData?.createdAt?.toDate(),
        updatedAt: userData?.updatedAt?.toDate()
      } as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return undefined;
    }
  }

  // Subject operations
  async getUserSubjects(userId: string): Promise<Subject[]> {
    try {
      const subjectsRef = adminDb.collection('subjects');
      const querySnapshot = await subjectsRef.where('userId', '==', userId).get();

      // Filter out duplicates based on unique subject IDs
      const uniqueSubjects = new Map<string, Subject>();
      querySnapshot.docs.forEach((doc: any) => {
        const subject = { id: doc.id, ...doc.data() } as Subject;
        uniqueSubjects.set(subject.id, subject);
      });

      return Array.from(uniqueSubjects.values());
    } catch (error) {
      console.error('Error getting user subjects:', error);
      return [];
    }
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    try {
      const subjectsRef = adminDb.collection('subjects');
      // Generate a unique ID for the document
      const uniqueId = `subject_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newSubjectRef = subjectsRef.doc(uniqueId);

      const newSubject: Subject = {
        id: uniqueId,
        ...subject,
        status: subject.status || 'average',
        progress: subject.progress ?? 0
      };

      await newSubjectRef.set(newSubject);

      return newSubject;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject | undefined> {
    try {
      const subjectRef = adminDb.collection('subjects').doc(id);
      const subjectDoc = await subjectRef.get();

      if (!subjectDoc.exists) {
        return undefined;
      }

      await subjectRef.update(data);

      const updatedSubjectDoc = await subjectRef.get();
      return { id, ...updatedSubjectDoc.data() } as Subject;
    } catch (error) {
      console.error('Error updating subject:', error);
      return undefined;
    }
  }

  // Task operations
  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const tasksRef = adminDb.collection('tasks');
      const querySnapshot = await tasksRef.where('userId', '==', userId).get();

      return querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as Task[];
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return [];
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    try {
      const tasksRef = adminDb.collection('tasks');
      // Generate a unique ID for the document
      const uniqueId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newTaskRef = tasksRef.doc(uniqueId);

      const newTask: Task = {
        id: uniqueId,
        ...task,
        completed: false,
        priority: task.priority || 'medium',
        progress: null,
        createdAt: new Date()
      };

      await newTaskRef.set({
        ...newTask,
        createdAt: Timestamp.fromDate(newTask.createdAt)
      });

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
    try {
      const taskRef = adminDb.collection('tasks').doc(id);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        return undefined;
      }

      await taskRef.update(data);

      const updatedTaskDoc = await taskRef.get();
      const updatedData = updatedTaskDoc.data();

      if (!updatedData) {
        return undefined;
      }

      return {
        id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate() || new Date()
      } as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = adminDb.collection('tasks').doc(taskId);
      await taskRef.delete();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // AI Tutor operations
  async createTutor(tutor: AITutor): Promise<AITutor> {
    try {
      const tutorsRef = adminDb.collection('tutors');
      const tutorRef = tutorsRef.doc(tutor.id);

      await tutorRef.set(tutor);

      return tutor;
    } catch (error) {
      console.error('Error creating tutor:', error);
      throw new Error('Failed to create tutor in database');
    }
  }

  async getAllTutors(): Promise<AITutor[]> {
    try {
      const tutorsRef = adminDb.collection('tutors');
      const querySnapshot = await tutorsRef.get();
      return querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        // All tutors are now unlocked by default (0 XP required)
        if (data.unlockXp === undefined) {
          data.unlockXp = 0; // All tutors unlocked
        }
        return {
          id: doc.id,
          ...data
        } as AITutor;
      });
    } catch (error) {
      console.error('Error getting all tutors:', error);
      throw new Error('Failed to retrieve tutors from database');
    }
  }

  async getUserTutors(userId: string): Promise<(AITutor & { unlocked: boolean })[]> {
    try {
      const allTutors = await this.getAllTutors();

      // ALL TUTORS ARE NOW UNLOCKED BY DEFAULT
      return allTutors.map(tutor => ({
        ...tutor,
        unlocked: true // All tutors unlocked
      }));
    } catch (error) {
      console.error('Error getting user tutors:', error);
      return [];
    }
  }

  async unlockTutor(userId: string, tutorId: string): Promise<boolean> {
    try {
      const userTutorsRef = adminDb.collection('userTutors');
      // Generate a unique ID for the document
      const uniqueId = `userTutor_${userId}_${tutorId}_${Date.now()}`;
      const newUserTutorRef = userTutorsRef.doc(uniqueId);

      await newUserTutorRef.set({
        id: uniqueId,
        userId,
        tutorId,
        unlocked: true
      });

      return true;
    } catch (error) {
      console.error('Error unlocking tutor:', error);
      return false;
    }
  }

  // Chat operations
  async getUserChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const messagesRef = adminDb.collection('chatMessages');
      const querySnapshot = await messagesRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      // Convert Firestore documents to ChatMessage objects and reverse to get chronological order
      const uniqueMessages = new Map<string, ChatMessage>();
      querySnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        const message = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()
        } as ChatMessage;
        uniqueMessages.set(message.id, message);
      });

      return Array.from(uniqueMessages.values()).reverse();
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw new Error('Failed to retrieve chat messages from database');
    }
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const messagesRef = adminDb.collection('chatMessages');
      // Generate a unique ID for the document
      const uniqueId = `message_${message.userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newMessageRef = messagesRef.doc(uniqueId);

      // Create the new message object
      const newMessage: ChatMessage = {
        id: uniqueId,
        ...message,
        createdAt: new Date()
      };

      // Save the new message to Firestore
      await newMessageRef.set({
        ...newMessage,
        createdAt: Timestamp.fromDate(newMessage.createdAt)
      });
      console.log(`Message saved to Firestore with ID: ${newMessage.id}`);

      try {
        // Enforce the 50 message limit per user
        // First, get all messages for this user ordered by creation time
        const querySnapshot = await messagesRef
          .where('userId', '==', message.userId)
          .orderBy('createdAt', 'desc')
          .get();

        // If we have more than 50 messages, delete the oldest ones
        if (querySnapshot.docs.length > 50) {
          console.log(`Enforcing 50 message limit. Current count: ${querySnapshot.docs.length}`);
          const messagesToDelete = querySnapshot.docs.slice(50);

          // Use a batch to delete multiple messages efficiently
          const batch = adminDb.batch();
          messagesToDelete.forEach((doc: any) => {
            batch.delete(doc.ref);
          });

          await batch.commit();
          console.log(`Deleted ${messagesToDelete.length} old messages for user ${message.userId}`);
        }
      } catch (limitError) {
        // If there's an error enforcing the limit, log it but don't fail the message creation
        console.error('Error enforcing message limit:', limitError);
        console.log('Continuing without enforcing message limit');
      }

      return newMessage;
    } catch (error) {
      console.error('Error creating chat message:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to save chat message to database: ${error.message}`);
      } else {
        throw new Error('Failed to save chat message to database: Unknown error');
      }
    }
  }

  // Store operations
  async getAllStoreItems(): Promise<StoreItem[]> {
    try {
      const itemsRef = adminDb.collection('storeItems');
      const querySnapshot = await itemsRef.get();

      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as StoreItem[];
    } catch (error) {
      console.error('Error getting store items:', error);
      return [];
    }
  }

  async getUserItems(userId: string): Promise<string[]> {
    try {
      const userItemsRef = adminDb.collection('userItems');
      const querySnapshot = await userItemsRef.where('userId', '==', userId).get();

      return querySnapshot.docs.map((doc: any) => doc.data().itemId);
    } catch (error) {
      console.error('Error getting user items:', error);
      return [];
    }
  }

  async purchaseItem(userId: string, itemId: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      const items = await this.getAllStoreItems();
      const item = items.find(i => i.id === itemId);

      if (!user || !item) {
        return false;
      }

      if (user.xp < item.price) {
        return false;
      }

      await this.updateUser(userId, { xp: user.xp - item.price });

      const userItemsRef = adminDb.collection('userItems');
      // Generate a unique ID for the document
      const uniqueId = `userItem_${userId}_${itemId}_${Date.now()}`;
      const newUserItemRef = userItemsRef.doc(uniqueId);

      await newUserItemRef.set({
        id: uniqueId,
        userId,
        itemId,
        purchasedAt: Timestamp.fromDate(new Date())
      });

      return true;
    } catch (error) {
      console.error('Error purchasing item:', error);
      return false;
    }
  }

  // Leaderboard operations
  async getLeaderboard(limit = 10): Promise<User[]> {
    try {
      const usersRef = adminDb.collection('users');
      const querySnapshot = await usersRef
        .orderBy('xp', 'desc')
        .limit(limit)
        .get();

      return querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastLogin: data.lastLogin?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as User;
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Streak operations
  async updateUserStreak(userId: string, increment: boolean): Promise<number> {
    try {
      const user = await this.getUser(userId);
      if (!user) return 0;

      const newStreak = increment ? user.streak + 1 : 0;

      await this.updateUser(userId, {
        streak: newStreak,
        lastLogin: new Date()
      });

      return newStreak;
    } catch (error) {
      console.error('Error updating user streak:', error);
      return 0;
    }
  }

  async getLastLoginDate(userId: string): Promise<Date | undefined> {
    try {
      const user = await this.getUser(userId);
      return user?.lastLogin || undefined;
    } catch (error) {
      console.error('Error getting last login date:', error);
      return undefined;
    }
  }

  // XP operations
  async addUserXP(userId: string, amount: number): Promise<User> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      const newXp = user.xp + amount;

      const updatedUser = await this.updateUser(userId, {
        xp: newXp
      });

      if (!updatedUser) throw new Error('Failed to update user');

      return updatedUser;
    } catch (error) {
      console.error('Error adding user XP:', error);
      throw error;
    }
  }

  async getUserRank(userId: string): Promise<number> {
    try {
      const usersRef = adminDb.collection('users');
      const querySnapshot = await usersRef
        .orderBy('xp', 'desc')
        .get();

      const rank = querySnapshot.docs.findIndex((doc: any) => doc.id === userId) + 1;
      return rank === 0 ? querySnapshot.docs.length + 1 : rank;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 0;
    }
  }

  // Delete old chat messages, keeping only the most recent N
  async deleteOldChatMessages(userId: string, keep = 50): Promise<number> {
    try {
      const messagesRef = adminDb.collection('chatMessages');
      const querySnapshot = await messagesRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(keep + 1)
        .get();

      if (querySnapshot.docs.length <= keep) {
        return 0;
      }

      const batch = adminDb.batch();
      querySnapshot.docs.slice(keep).forEach((doc: any) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return querySnapshot.docs.length - keep;
    } catch (error) {
      console.error('Error deleting old chat messages:', error);
      return 0;
    }
  }

  async getTask(taskId: string): Promise<Task | null> {
    const doc = await adminDb.collection('tasks').doc(taskId).get();
    return doc.exists ? (doc.data() as Task) : null;
  }

  async getSubject(subjectId: string): Promise<Subject | null> {
    const doc = await adminDb.collection('subjects').doc(subjectId).get();
    return doc.exists ? (doc.data() as Subject) : null;
  }

  async getTutor(tutorId: string): Promise<AITutor | null> {
    const doc = await adminDb.collection('tutors').doc(tutorId).get();
    return doc.exists ? (doc.data() as AITutor) : null;
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    const doc = await adminDb.collection('questions').doc(questionId).get();
    return doc.exists ? (doc.data() as Question) : null;
  }

  async getAnswer(answerId: string): Promise<Answer | null> {
    const doc = await adminDb.collection('answers').doc(answerId).get();
    return doc.exists ? (doc.data() as Answer) : null;
  }
}