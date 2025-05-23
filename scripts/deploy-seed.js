#!/usr/bin/env node

/**
 * Deployment seeding script for Vercel
 * This script seeds the Firebase database with initial data during deployment
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
function initializeFirebase() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Missing required Firebase environment variables');
    }

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase Admin initialized successfully');
  }
}

// Get Firestore instance
function getDb() {
  return getFirestore();
}

// Default tutors data
const defaultTutors = [
  {
    id: '1',
    name: 'Nova',
    subject: 'General',
    iconName: 'robot',
    color: 'blue',
    xpRequired: 0
  },
  {
    id: '2',
    name: 'Math Mentor',
    subject: 'Mathematics',
    iconName: 'calculator',
    color: 'green',
    xpRequired: 0
  },
  {
    id: '3',
    name: 'Science Sage',
    subject: 'Science',
    iconName: 'compass',
    color: 'purple',
    xpRequired: 0
  },
  {
    id: '4',
    name: 'Language Luminary',
    subject: 'Language Arts',
    iconName: 'languages',
    color: 'orange',
    xpRequired: 0
  },
  {
    id: '5',
    name: 'History Helper',
    subject: 'History',
    iconName: 'user',
    color: 'red',
    xpRequired: 0
  },
  {
    id: '6',
    name: 'Physics Pro',
    subject: 'Physics',
    iconName: 'compass',
    color: 'indigo',
    xpRequired: 0
  },
  {
    id: '7',
    name: 'Chemistry Champion',
    subject: 'Chemistry',
    iconName: 'compass',
    color: 'teal',
    xpRequired: 0
  },
  {
    id: '8',
    name: 'Biology Buddy',
    subject: 'Biology',
    iconName: 'compass',
    color: 'emerald',
    xpRequired: 0
  },
  {
    id: '9',
    name: 'Geography Guide',
    subject: 'Geography',
    iconName: 'user',
    color: 'amber',
    xpRequired: 0
  },
  {
    id: '10',
    name: 'Economics Expert',
    subject: 'Economics',
    iconName: 'user',
    color: 'lime',
    xpRequired: 0
  },
  {
    id: '11',
    name: 'Psychology Pro',
    subject: 'Psychology',
    iconName: 'user',
    color: 'pink',
    xpRequired: 0
  },
  {
    id: '12',
    name: 'Computer Science Coach',
    subject: 'Computer Science',
    iconName: 'robot',
    color: 'cyan',
    xpRequired: 0
  },
  {
    id: '13',
    name: 'Art & Design Advisor',
    subject: 'Art & Design',
    iconName: 'smile',
    color: 'rose',
    xpRequired: 0
  },
  {
    id: '14',
    name: 'Music Maestro',
    subject: 'Music',
    iconName: 'smile',
    color: 'violet',
    xpRequired: 0
  },
  {
    id: '15',
    name: 'Philosophy Philosopher',
    subject: 'Philosophy',
    iconName: 'user',
    color: 'slate',
    xpRequired: 0
  }
];

// Default store items
const defaultStoreItems = [
  {
    id: 'title_scholar',
    name: 'Scholar',
    type: 'title',
    price: 100,
    description: 'Show your dedication to learning'
  },
  {
    id: 'title_genius',
    name: 'Genius',
    type: 'title',
    price: 500,
    description: 'For the truly brilliant minds'
  },
  {
    id: 'theme_dark',
    name: 'Dark Theme',
    type: 'theme',
    price: 200,
    description: 'Easy on the eyes'
  },
  {
    id: 'theme_colorful',
    name: 'Colorful Theme',
    type: 'theme',
    price: 300,
    description: 'Bright and vibrant'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding for deployment...');

    // Initialize Firebase
    initializeFirebase();
    const db = getDb();

    // Seed tutors
    console.log('📚 Seeding tutors...');
    for (const tutor of defaultTutors) {
      try {
        const tutorRef = db.collection('tutors').doc(tutor.id);
        await tutorRef.set(tutor, { merge: true });
        console.log(`✅ Seeded tutor: ${tutor.name}`);
      } catch (error) {
        console.log(`⚠️ Tutor ${tutor.name} may already exist:`, error.message);
      }
    }

    // Seed store items
    console.log('🛍️ Seeding store items...');
    for (const item of defaultStoreItems) {
      try {
        const itemRef = db.collection('storeItems').doc(item.id);
        await itemRef.set(item, { merge: true });
        console.log(`✅ Seeded store item: ${item.name}`);
      } catch (error) {
        console.log(`⚠️ Store item ${item.name} may already exist:`, error.message);
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${defaultTutors.length} tutors and ${defaultStoreItems.length} store items`);

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Deployment seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Deployment seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
