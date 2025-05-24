// CommonJS version of the test script
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Custom logger
function log(message) {
  process.stderr.write(`[TEST] ${message}\n`);
}

// Main test function
async function runTest() {
  log('Starting test in CommonJS format');
  
  try {
    // Check if Firebase config is available
    log('Checking Firebase configuration...');
    const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
    log(`Firebase Project ID: ${firebaseProjectId || 'Not found'}`);
    
    // Check if API keys are available
    const groqKeyExists = !!process.env.GROQ_API_KEY;
    const togetherKeyExists = !!process.env.TOGETHER_AI_API_KEY;
    log(`GROQ API Key exists: ${groqKeyExists}`);
    log(`Together AI API Key exists: ${togetherKeyExists}`);
    
    // Check if we can access the dist directory
    const distPath = path.join(__dirname, 'dist');
    log(`Checking dist directory: ${distPath}`);
    if (fs.existsSync(distPath)) {
      log('Dist directory exists');
      const files = fs.readdirSync(distPath);
      log(`Files in dist: ${files.join(', ')}`);
    } else {
      log('Dist directory does not exist');
    }
    
    // Check if we can access the AI module
    const aiPath = path.join(__dirname, 'ai');
    log(`Checking AI directory: ${aiPath}`);
    if (fs.existsSync(aiPath)) {
      log('AI directory exists');
      const files = fs.readdirSync(aiPath);
      log(`Files in AI directory: ${files.join(', ')}`);
    } else {
      log('AI directory does not exist');
    }
    
    log('Test completed successfully');
  } catch (error) {
    log(`Test failed: ${error.message}`);
    log(error.stack);
  }
}

// Run the test
runTest()
  .then(() => {
    log('Test script execution completed');
    process.exit(0);
  })
  .catch(error => {
    log(`Unhandled error: ${error.message}`);
    log(error.stack);
    process.exit(1);
  });