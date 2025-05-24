// Test script for AI functionality
import * as dotenv from 'dotenv';
import { initializeFirebase } from './firebaseAdmin.js';
import { FirebaseStorage } from './firebasestorage.js';
import { getAIServiceForAgent } from './ai/index.js';

// Load environment variables
dotenv.config();

// Initialize Firebase
console.error('Initializing Firebase...');
initializeFirebase();
console.error('Firebase initialized');

// Initialize storage
const storage = new FirebaseStorage();
console.error('Firebase storage initialized');

// Test AI functionality
async function testAI() {
  try {
    console.error('Testing AI functionality...');
    
    // Get all tutors
    console.error('Fetching tutors...');
    const tutors = await storage.getAllTutors();
    console.error(`Found ${tutors.length} tutors`);
    
    if (tutors.length === 0) {
      console.error('No tutors found. Seeding may be required.');
      return;
    }
    
    // Test the first tutor
    const tutor = tutors[0];
    console.error(`Testing tutor: ${tutor.name || tutor.id}`);
    
    // Get AI service
    const aiService = getAIServiceForAgent(tutor.id);
    if (!aiService) {
      console.error('AI service not available for this tutor');
      return;
    }
    
    console.error('AI service available, testing response generation...');
    
    // Test response generation
    const response = await aiService.generateResponse(
      'Hello, can you give me a short greeting?',
      []
    );
    
    console.error('Response received:');
    console.error(response);
    
    console.error('AI test completed successfully');
  } catch (error) {
    console.error('Error testing AI:', error);
  }
}

// Run the test
console.error('Starting AI test...');
testAI()
  .then(() => {
    console.error('Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });