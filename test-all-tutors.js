// Test script to check all tutors with the same question
const fetch = require('node-fetch');

async function testAllTutors() {
  console.log('Testing all tutors with the question: "What is science?"');
  console.log('='.repeat(50));
  
  // Get all tutors
  try {
    const tutorsResponse = await fetch('http://localhost:5000/api/tutors');
    const tutors = await tutorsResponse.json();
    
    console.log(`Found ${tutors.length} tutors to test`);
    
    // Test each tutor
    for (const tutor of tutors) {
      console.log(`\nTesting Tutor #${tutor.id}: ${tutor.name} (${tutor.subject})`);
      console.log('-'.repeat(50));
      
      try {
        const startTime = Date.now();
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agentId: tutor.id.toString(),
            content: 'What is science?',
            userId: 'test-user'
          })
        });
        
        const responseTime = Date.now() - startTime;
        const data = await response.json();
        
        console.log(`Response time: ${responseTime}ms`);
        console.log(`Status: ${response.status}`);
        
        if (data.content) {
          // Check if it's a fallback response
          const isFallback = data.content.includes("While I'm having trouble connecting") || 
                            data.content.includes("I'm having trouble connecting");
          
          console.log(`Response type: ${isFallback ? 'FALLBACK' : 'REAL API'}`);
          console.log(`Response preview: ${data.content.substring(0, 100)}...`);
        } else {
          console.log('ERROR: No content in response');
          console.log(data);
        }
      } catch (error) {
        console.log(`ERROR testing tutor ${tutor.id}: ${error.message}`);
      }
    }
    
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Failed to get tutors:', error);
  }
}

// Run the test
testAllTutors();