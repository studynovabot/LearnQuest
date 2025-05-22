const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Create the tutors
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
    name: 'Chemistry Coach',
    subject: 'Chemistry',
    iconName: 'smile',
    color: 'yellow',
    xpRequired: 0
  },
  {
    id: '8',
    name: 'Biology Buddy',
    subject: 'Biology',
    iconName: 'smile',
    color: 'emerald',
    xpRequired: 0
  },
  {
    id: '9',
    name: 'Geography Guide',
    subject: 'Geography',
    iconName: 'compass',
    color: 'teal',
    xpRequired: 0
  },
  {
    id: '10',
    name: 'Personal Coach',
    subject: 'Personal Development',
    iconName: 'user',
    color: 'pink',
    xpRequired: 0
  },
  {
    id: '11',
    name: 'Motivational Mentor',
    subject: 'Motivation',
    iconName: 'smile',
    color: 'amber',
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

async function seedTutors() {
  console.log('🌱 Starting tutor seeding...');
  
  for (const tutor of defaultTutors) {
    try {
      const tutorRef = db.collection('tutors').doc(tutor.id);
      await tutorRef.set(tutor);
      console.log(`✅ Created tutor: ${tutor.name}`);
    } catch (error) {
      console.log(`ℹ️ Tutor ${tutor.name} may already exist or error:`, error.message);
    }
  }
  
  console.log('✅ Tutor seeding completed!');
  process.exit(0);
}

seedTutors().catch(error => {
  console.error('❌ Error during seeding:', error);
  process.exit(1);
});
