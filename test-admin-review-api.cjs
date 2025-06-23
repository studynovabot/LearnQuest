// Test the new admin-review endpoint
const fetch = require('node-fetch');

async function testAdminReviewAPI() {
  try {
    console.log('🔍 Testing admin-review API endpoint...');
    
    const testData = {
      sessionId: 'test_session_' + Date.now(),
      qaPairs: [
        {
          question: "What is a chemical reaction?",
          answer: "A chemical reaction is a process in which one or more substances are changed into one or more new substances.",
          difficulty: "easy",
          type: "definition",
          id: "qa_1"
        },
        {
          question: "What happens to atoms in a chemical reaction?",
          answer: "In a chemical reaction, atoms are rearranged to form products with different properties.",
          difficulty: "medium",
          type: "process",
          id: "qa_2"
        }
      ],
      metadata: {
        subject: "Science",
        class: "10",
        board: "CBSE",
        chapter: "Chemical Reactions and Equations"
      }
    };

    console.log('📤 Sending request to admin-review API...');
    const response = await fetch('https://studynovaai.vercel.app/api/admin-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log('📄 Response body:', responseData);

    if (response.ok) {
      const jsonData = JSON.parse(responseData);
      console.log('✅ SUCCESS! Admin review API is working!');
      console.log('🔥 Firebase upload completed!');
      console.log('📊 Uploaded', jsonData.data?.totalQuestions || 0, 'Q&A pairs');
      console.log('📋 Collection:', jsonData.data?.collectionName);
      console.log('📄 Document ID:', jsonData.data?.documentId);
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
    console.error('❌ Error testing admin-review API:', error.message);
  }
}

testAdminReviewAPI();