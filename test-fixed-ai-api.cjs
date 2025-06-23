// Test the fixed AI API with updated model
const fetch = require('node-fetch');

async function testFixedAIAPI() {
  try {
    console.log('🔍 Testing fixed ai-text-to-qa API endpoint...');
    
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

    console.log('📤 Sending request to production API...');
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
    console.log('📄 Response body (first 1000 chars):', responseData.substring(0, 1000));

    if (response.ok) {
      const jsonData = JSON.parse(responseData);
      console.log('✅ SUCCESS! AI API is now working!');
      console.log('📊 Generated', jsonData.qaPairs?.length || 0, 'Q&A pairs');
      
      if (jsonData.qaPairs && jsonData.qaPairs.length > 0) {
        console.log('\n📝 Sample Q&A pairs:');
        jsonData.qaPairs.slice(0, 2).forEach((qa, index) => {
          console.log(`\n${index + 1}. Q: ${qa.question}`);
          console.log(`   A: ${qa.answer}`);
        });
      }
    } else {
      console.log('❌ Request still failing with status:', response.status);
      try {
        const errorData = JSON.parse(responseData);
        console.log('❌ Error details:', errorData);
      } catch (e) {
        console.log('❌ Raw error:', responseData);
      }
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testFixedAIAPI();