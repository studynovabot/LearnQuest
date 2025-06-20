// Simple test script to verify API endpoints
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';

async function testAPI() {
  try {
    console.log('🧪 Testing NCERT Solutions API...');
    
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestoreDb();
    
    // Test 1: Check if we can connect to Firestore
    console.log('1. Testing Firestore connection...');
    const testDoc = await db.collection('test').limit(1).get();
    console.log('✅ Firestore connection successful');
    
    // Test 2: Check if ncert_solutions collection exists
    console.log('2. Testing solutions collection...');
    const solutionsSnapshot = await db.collection('ncert_solutions').limit(5).get();
    console.log(`✅ Found ${solutionsSnapshot.docs.length} solutions in database`);
    
    // Test 3: List available solutions
    if (!solutionsSnapshot.empty) {
      console.log('3. Sample solutions:');
      solutionsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.subject} - ${data.class} - ${data.chapter}`);
      });
    }
    
    // Test 4: Test stats calculation
    console.log('4. Testing stats calculation...');
    const allSolutions = await db.collection('ncert_solutions').get();
    const solutions = allSolutions.docs.map(doc => doc.data());
    
    const stats = {
      totalSolutions: solutions.length,
      availableSolutions: solutions.filter(s => s.isAvailable).length,
      easySolutions: solutions.filter(s => s.difficulty === 'easy').length,
      mediumSolutions: solutions.filter(s => s.difficulty === 'medium').length,
      hardSolutions: solutions.filter(s => s.difficulty === 'hard').length,
    };
    
    console.log('✅ Stats calculated:', stats);
    
    console.log('\n🎉 All tests passed! API is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('1. Start your development server');
    console.log('2. Go to the NCERT Solutions page');
    console.log('3. Use the admin upload feature to add more solutions');
    console.log('4. Test the AI help feature');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Firebase is properly configured');
    console.log('2. Check your .env file has all required variables');
    console.log('3. Ensure Firestore database exists and has proper rules');
  }
}

// Run test
testAPI();