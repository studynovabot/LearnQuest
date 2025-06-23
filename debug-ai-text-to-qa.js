// Debug script to test the ai-text-to-qa API endpoint
const fetch = require('node-fetch');

async function testAITextToQA() {
  try {
    console.log('🔍 Testing ai-text-to-qa API endpoint...');
    
    const testData = {
      text: "Chemical reactions are processes in which one or more substances are changed into one or more new substances. In a chemical reaction, the atoms of the reactants are rearranged to form products with different properties. For example, when iron rusts, it combines with oxygen to form iron oxide. This is a chemical reaction where iron and oxygen are the reactants, and iron oxide is the product.",
      metadata: {
        subject: "Science",
        class: "10",
        board: "CBSE",
        chapter: "Chemical Reactions and Equations"
      },
      options: {
        maxQuestions: 5,
        difficulty: "mixed"
      }
    };

    const response = await fetch('https://studynovaai.vercel.app/api/ai-text-to-qa', {
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
      console.log('✅ Success! Generated', jsonData.qaPairs?.length || 0, 'Q&A pairs');
    } else {
      console.log('❌ Request failed with status:', response.status);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAITextToQA();