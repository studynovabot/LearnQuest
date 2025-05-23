import dotenv from 'dotenv';
import { seedDatabase } from './seed.js';

// Load environment variables
dotenv.config();

async function runSeed() {
  try {
    console.log('🌱 Starting database seeding...');
    await seedDatabase();
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
