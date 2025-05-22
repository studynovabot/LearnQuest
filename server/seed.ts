import { storage } from './index.js';
import { type User, type Subject, type Task, type AITutor, type ChatMessage } from './types/schema.js';

// Create the initial dataset for the Study Nova app
export async function seedDatabase() {
  console.log('Seeding database (Firebase)...');
  try {
    // Create default AI tutors
    const defaultTutors: AITutor[] = [
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
        xpRequired: 50
      },
      {
        id: '3',
        name: 'Science Sage',
        subject: 'Science',
        iconName: 'compass',
        color: 'purple',
        xpRequired: 100
      },
      {
        id: '4',
        name: 'Language Luminary',
        subject: 'Language Arts',
        iconName: 'languages',
        color: 'orange',
        xpRequired: 150
      },
      {
        id: '5',
        name: 'Social Studies Scholar',
        subject: 'Social Studies',
        iconName: 'user',
        color: 'red',
        xpRequired: 200
      },
      {
        id: '6',
        name: 'AI Assistant',
        subject: 'Technology',
        iconName: 'robot',
        color: 'cyan',
        xpRequired: 250
      },
      {
        id: '7',
        name: 'Tech Tutor',
        subject: 'Computer Science',
        iconName: 'robot',
        color: 'indigo',
        xpRequired: 300
      },
      {
        id: '8',
        name: 'Motivator',
        subject: 'Personal Development',
        iconName: 'smile',
        color: 'pink',
        xpRequired: 350
      },
      {
        id: '9',
        name: 'Task Planner',
        subject: 'Organization',
        iconName: 'user',
        color: 'yellow',
        xpRequired: 400
      }
    ];

    // Create tutors in database
    for (const tutor of defaultTutors) {
      try {
        await storage.createTutor(tutor);
        console.log(`✅ Created tutor: ${tutor.name}`);
      } catch (error) {
        console.log(`ℹ️ Tutor ${tutor.name} may already exist`);
      }
    }

    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}