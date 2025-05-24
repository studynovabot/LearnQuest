// Deployment diagnostic script
import fs from 'fs';
import path from 'path';

console.log('🔍 VERCEL DEPLOYMENT DIAGNOSTICS');
console.log('='.repeat(40));

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function checkFileContent(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = content.includes(searchText);
    console.log(`${found ? '✅' : '❌'} ${description}`);
    return found;
  } catch (error) {
    console.log(`❌ ${description} (file not readable)`);
    return false;
  }
}

console.log('\n📁 CHECKING PROJECT STRUCTURE:');
checkFile('vercel.json', 'Vercel configuration');
checkFile('api/health.js', 'Health endpoint');
checkFile('api/_utils/firebase.js', 'Firebase utilities');
checkFile('api/_utils/cors.js', 'CORS utilities');
checkFile('api/auth/login.js', 'Login endpoint');
checkFile('api/auth/register.js', 'Register endpoint');
checkFile('api/chat.js', 'Chat endpoint');
checkFile('api/tutors.js', 'Tutors endpoint');
checkFile('api/tasks.js', 'Tasks endpoint');
checkFile('api/store.js', 'Store endpoint');
checkFile('api/seed.js', 'Seed endpoint');
checkFile('client/dist/index.html', 'Built frontend');

console.log('\n⚙️ CHECKING CONFIGURATION:');
checkFileContent('vercel.json', '"version": 2', 'Vercel version 2 config');
checkFileContent('vercel.json', '"api/**/*.js"', 'API functions configuration');
checkFileContent('vercel.json', 'FIREBASE_PROJECT_ID', 'Firebase environment variables');
checkFileContent('vercel.json', 'GROQ_API_KEY', 'Groq API key configuration');

console.log('\n🔧 CHECKING API FUNCTIONS:');
checkFileContent('api/health.js', 'export default function handler', 'Health function export');
checkFileContent('api/_utils/firebase.js', 'initializeFirebase', 'Firebase initialization');
checkFileContent('api/_utils/cors.js', 'setCorsHeaders', 'CORS headers function');
checkFileContent('api/chat.js', 'GROQ_API_KEY', 'Groq integration in chat');

console.log('\n📦 CHECKING DEPENDENCIES:');
checkFile('api/package.json', 'API package.json');
checkFileContent('api/package.json', 'firebase-admin', 'Firebase Admin SDK');
checkFileContent('api/package.json', 'bcryptjs', 'Password hashing');

console.log('\n🎯 CHECKING FRONTEND CONFIG:');
checkFileContent('client/src/config.ts', '/api', 'API URL configuration');
checkFileContent('client/src/config.ts', 'useMockData: false', 'Mock data disabled');

console.log('\n📋 DEPLOYMENT CHECKLIST:');
console.log('');
console.log('Before deploying to Vercel, ensure:');
console.log('1. ✅ All files above exist and are configured correctly');
console.log('2. 🔑 Environment variables are set in Vercel dashboard:');
console.log('   - NODE_ENV=production');
console.log('   - VITE_NODE_ENV=production');
console.log('   - FIREBASE_PROJECT_ID=studynovabot');
console.log('   - FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studynovabot.iam.gserviceaccount.com');
console.log('   - FIREBASE_PRIVATE_KEY=[your-private-key]');
console.log('   - GROQ_API_KEY=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');
console.log('   - TOGETHER_API_KEY=386f94fa38882002186da7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7');
console.log('3. 🚀 Code is pushed to GitHub');
console.log('4. 🔗 Vercel project is connected to GitHub repository');
console.log('');
console.log('After deployment:');
console.log('1. 🧪 Test /api/health endpoint');
console.log('2. 🌱 Run /api/seed to initialize database');
console.log('3. 🎮 Test frontend functionality');
console.log('4. 💬 Test AI chat features');
console.log('');
console.log('🎉 If all checks pass, your deployment should work perfectly!');

// Check if we're in the right directory
if (!fs.existsSync('vercel.json')) {
  console.log('\n⚠️  WARNING: Run this script from the project root directory!');
  process.exit(1);
}

console.log('\n✅ Diagnostic complete! Check the results above.');
