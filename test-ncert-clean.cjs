// Test the updated NCERT Solutions API that should now read from Firebase

async function testNCERTSolutionsAPI() {
  try {
    console.log('🔍 Testing NCERT Solutions API with Firebase integration...');
    
    // Test the same filters as your PDF upload
    const testParams = new URLSearchParams({
      board: 'cbse',
      class: '10',
      subject: 'science',
      page: '1',
      limit: '20'
    });

    console.log('📤 Making request to NCERT Solutions API...');
    const response = await fetch(`https://studynovaai.vercel.app/api/ncert-solutions?${testParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log('📄 Response body (first 2000 chars):', responseData.substring(0, 2000));

    if (response.ok) {
      const jsonData = JSON.parse(responseData);
      console.log('✅ SUCCESS! NCERT Solutions API is working!');
      console.log('📊 Found', jsonData.solutions?.length || 0, 'solutions');
      console.log('📊 Total count:', jsonData.total || 0);
      
      if (jsonData.solutions && jsonData.solutions.length > 0) {
        console.log('\n📝 Sample solutions:');
        jsonData.solutions.slice(0, 3).forEach((solution, index) => {
          console.log(`\n${index + 1}. Q: ${solution.question.substring(0, 100)}...`);
          console.log(`   A: ${solution.answer.substring(0, 100)}...`);
          console.log(`   Chapter: ${solution.chapter}`);
          console.log(`   Difficulty: ${solution.difficulty}`);
        });
      }
    } else {
      console.log('❌ Request failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseData);
        console.log('❌ Error details:', errorData);
      } catch (e) {
        console.log('❌ Raw error:', responseData);
      }
    }

  } catch (error) {
    console.error('❌ Error testing NCERT Solutions API:', error.message);
  }
}

testNCERTSolutionsAPI();// Test the updated NCERT Solutions API that should now read from Firebase

async function testNCERTSolutionsAPI() {
  try {
    console.log('🔍 Testing NCERT Solutions API with Firebase integration...');
    
    // Test the same filters as your PDF upload
    const testParams = new URLSearchParams({
      board: 'cbse',
      class: '10',
      subject: 'science',
      page: '1',
      limit: '20'
    });

    console.log('📤 Making request to NCERT Solutions API...');
    const response = await fetch(`https://studynovaai.vercel.app/api/ncert-solutions?${testParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log('📄 Response body (first 2000 chars):', responseData.substring(0, 2000));

    if (response.ok) {
      const jsonData = JSON.parse(responseData);
      console.log('✅ SUCCESS! NCERT Solutions API is working!');
      console.log('📊 Found', jsonData.solutions?.length || 0, 'solutions');
      console.log('📊 Total count:', jsonData.total || 0);
      
      if (jsonData.solutions && jsonData.solutions.length > 0) {
        console.log('\n📝 Sample solutions:');
        jsonData.solutions.slice(0, 3).forEach((solution, index) => {
          console.log(`\n${index + 1}. Q: ${solution.question.substring(0, 100)}...`);
          console.log(`   A: ${solution.answer.substring(0, 100)}...`);
          console.log(`   Chapter: ${solution.chapter}`);
          console.log(`   Difficulty: ${solution.difficulty}`);
        });
      }
    } else {
      console.log('❌ Request failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseData);
        console.log('❌ Error details:', errorData);
      } catch (e) {
        console.log('❌ Raw error:', responseData);
      }
    }

  } catch (error) {
    console.error('❌ Error testing NCERT Solutions API:', error.message);
  }
}

testNCERTSolutionsAPI();