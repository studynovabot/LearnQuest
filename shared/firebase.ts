// Mock Firebase implementation for development
// This avoids the need for actual Firebase credentials during development
import { Timestamp } from 'firebase/firestore';

// Create a simple in-memory database
const inMemoryDb: Record<string, Record<string, any>> = {
  users: {},
  ai_tutors: {},
  subjects: {},
  tasks: {},
  store_items: {},
  user_tutors: {}
};

// Mock Firestore document reference
class MockDocumentReference {
  private collectionName: string;
  private docId: string;

  constructor(collectionName: string, docId: string) {
    this.collectionName = collectionName;
    this.docId = docId;
  }

  async get() {
    const collection = inMemoryDb[this.collectionName] || {};
    const doc = collection[this.docId];
    
    return {
      exists: !!doc,
      data: () => doc || null,
      id: this.docId
    };
  }

  async set(data: any) {
    if (!inMemoryDb[this.collectionName]) {
      inMemoryDb[this.collectionName] = {};
    }
    inMemoryDb[this.collectionName][this.docId] = { ...data };
    return Promise.resolve();
  }

  async update(data: any) {
    if (!inMemoryDb[this.collectionName]) {
      inMemoryDb[this.collectionName] = {};
    }
    
    if (!inMemoryDb[this.collectionName][this.docId]) {
      inMemoryDb[this.collectionName][this.docId] = {};
    }
    
    inMemoryDb[this.collectionName][this.docId] = {
      ...inMemoryDb[this.collectionName][this.docId],
      ...data
    };
    
    return Promise.resolve();
  }

  async delete() {
    if (inMemoryDb[this.collectionName] && inMemoryDb[this.collectionName][this.docId]) {
      delete inMemoryDb[this.collectionName][this.docId];
    }
    return Promise.resolve();
  }
}

// Mock Firestore collection reference
class MockCollectionReference {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  doc(docId: string) {
    return new MockDocumentReference(this.collectionName, docId);
  }

  async add(data: any) {
    const id = Date.now().toString();
    await this.doc(id).set(data);
    return { id };
  }

  where() {
    return {
      get: async () => {
        const collection = inMemoryDb[this.collectionName] || {};
        const docs = Object.entries(collection).map(([id, data]) => ({
          id,
          data: () => data,
          exists: true
        }));
        
        return {
          docs,
          empty: docs.length === 0,
          forEach: (callback: (doc: any) => void) => {
            docs.forEach(callback);
          }
        };
      }
    };
  }
}

// Mock Firebase app
const app = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'mock-api-key',
    authDomain: 'mock-project.firebaseapp.com',
    projectId: 'mock-project',
  }
};

// Mock Firebase auth
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Mock a signed-in user
    setTimeout(() => callback({ 
      uid: '1', 
      email: 'alex@example.com',
      displayName: 'Alex Johnson'
    }), 100);
    return () => {}; // Return unsubscribe function
  },
  signInWithEmailAndPassword: async () => ({ 
    user: { 
      uid: '1',
      email: 'alex@example.com',
      displayName: 'Alex Johnson'
    } 
  }),
  createUserWithEmailAndPassword: async () => ({ 
    user: { 
      uid: '1',
      email: 'alex@example.com',
      displayName: 'Alex Johnson'
    } 
  }),
  signOut: async () => {}
};

// Mock Firestore database
const db = {
  collection: (collectionName: string) => new MockCollectionReference(collectionName)
};

// Mock Firebase storage
const storage = {
  ref: () => ({
    put: async () => ({
      ref: {
        getDownloadURL: async () => 'https://mock-storage-url.com/image.jpg'
      }
    }),
    delete: async () => {}
  })
};

console.log('Using mock Firebase implementation');

// Export the mock implementations
export { app, auth, db, storage, Timestamp };