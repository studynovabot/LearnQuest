// Quick Firebase connection test
import { initializeFirebase } from './api/_utils/firebase.js';

async function testFirebase() {
  try {
    console.log('🔄 Testing Firebase connection...');
    const { app, db } = initializeFirebase();
    console.log('✅ Firebase connected successfully');
    
    // Test a simple read operation
    const testCollection = await db.collection('users').limit(1).get();
    console.log('✅ Firestore read test successful');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
}

testFirebase().then(success => {
  console.log('Test result:', success ? 'PASS' : 'FAIL');
  process.exit(success ? 0 : 1);
});
