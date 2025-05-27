// Comprehensive deployment test for LearnQuest
console.log('🚀 Starting LearnQuest Deployment Test...');

// Test 1: Check if all required files exist
import fs from 'fs';
import path from 'path';

const requiredFiles = [
  'api/image-generation.js',
  'api/test-image.js',
  'client/src/pages/ImageTools.tsx',
  'vercel.json'
];

console.log('\n📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Test 2: Check environment variables
console.log('\n🔑 Checking environment variables...');
const requiredEnvVars = [
  'STARRY_AI_API_KEY',
  'FIREBASE_PROJECT_ID',
  'GROQ_API_KEY'
];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar} - Set (${value.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${envVar} - Not set`);
  }
});

// Test 3: Check package.json dependencies
console.log('\n📦 Checking package dependencies...');
try {
  const clientPackage = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
  const requiredDeps = ['@vercel/analytics', '@vercel/speed-insights'];
  
  requiredDeps.forEach(dep => {
    if (clientPackage.dependencies[dep]) {
      console.log(`✅ ${dep} - ${clientPackage.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - Missing`);
    }
  });
} catch (error) {
  console.log('❌ Error reading client package.json:', error.message);
}

console.log('\n✨ Deployment test completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: cd client && npm install');
console.log('2. Run: node dev-server.js');
console.log('3. Test image generation at: http://localhost:5000/image-tools');
console.log('4. Deploy to Vercel: vercel --prod');
