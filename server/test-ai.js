import { getAIServiceForAgent } from './ai/index.js';
import { initializeFirebase } from './firebaseAdmin.js';
import { FirebaseStorage } from './firebasestorage.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Custom logger that uses console.error to ensure output is visible
const log = (message) => {
  console.error(`[TEST] ${message}`);
};

// Initialize Firebase
log('Initializing Firebase...');
initializeFirebase();
log('Firebase initialized');

// Initialize storage
const storage = new FirebaseStorage();
log('Firebase storage initialized');

// Test function to check AI agent functionality
async function testAIAgents() {
  try {
    log('Testing AI agents...');
    
    // Get all tutors
    const tutors = await storage.getAllTutors();
    log(`Found ${tutors.length} tutors`);
    
    // Test each AI agent
    for (let i = 0; i < Math.min(tutors.length, 15); i++) {
      const tutor = tutors[i];
      log(`Testing tutor ${i+1}/${Math.min(tutors.length, 15)}: ${tutor.name || 'Unknown'}`);
      
      try {
        // Get AI service for this agent
        const aiService = getAIServiceForAgent(tutor.id);
        log(`AI service for ${tutor.name || 'Unknown'}: ${aiService ? 'Available' : 'Not available'}`);
        
        if (aiService) {
          // Test a simple message
          log(`Sending test message to ${tutor.name || 'Unknown'}...`);
          const response = await aiService.generateResponse(
            `Hello, I'm testing if you're working properly. Please respond with a short greeting.`,
            []
          );
          
          log(`Response from ${tutor.name || 'Unknown'}: ${response ? 'Success' : 'Failed'}`);
          if (response) {
            log(`Sample response: ${response.substring(0, 100)}...`);
          }
        }
      } catch (error) {
        log(`Error testing tutor ${tutor.name || 'Unknown'}: ${error.message}`);
      }
    }
    
    log('AI agent testing completed');
  } catch (error) {
    log(`Error testing AI agents: ${error.message}`);
    log(error.stack);
  }
}

// Run the test
log('Starting AI agent test...');
testAIAgents()
  .then(() => {
    log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    log(`Test failed: ${error.message}`);
    log(error.stack);
    process.exit(1);
  });