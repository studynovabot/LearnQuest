// Test script for verifying all tutors
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000';

async function testAllTutors() {
  console.log('🧪 Testing all tutors with "what is infinity" question...\n');

  try {
    // First get all tutors
    const tutorsResponse = await fetch(`${baseUrl}/api/tutors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'test-user-id'
      }
    });

    if (!tutorsResponse.ok) {
      throw new Error(`Failed to fetch tutors: ${tutorsResponse.status}`);
    }

    const tutors = await tutorsResponse.json();
    console.log(`📊 Found ${tutors.length} tutors to test\n`);

    // Test each tutor
    const results = [];
    for (const tutor of tutors) {
      console.log(`\n🧪 Testing ${tutor.name} (${tutor.subject})...`);
      
      try {
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-user-id'
          },
          body: JSON.stringify({
            content: 'what is infinity',
            agentId: tutor.id.toString(),
            userId: 'test-user'
          })
        });

        const data = await response.json();
        
        if (response.ok && data.content) {
          console.log(`✅ ${tutor.name} SUCCESS`);
          console.log(`💬 Response: ${data.content.substring(0, 100)}...`);
          results.push({
            tutor: tutor.name,
            status: 'success',
            response: data.content
          });
        } else {
          console.log(`❌ ${tutor.name} FAILED: ${response.status}`);
          results.push({
            tutor: tutor.name,
            status: 'failed',
            error: data.error || 'Unknown error'
          });
        }
      } catch (error) {
        console.log(`❌ ${tutor.name} ERROR: ${error.message}`);
        results.push({
          tutor: tutor.name,
          status: 'error',
          error: error.message
        });
      }

      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Print summary
    console.log('\n📊 Test Results Summary:');
    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status !== 'success').length;
    
    console.log(`\n✅ Successful responses: ${successCount}`);
    console.log(`❌ Failed responses: ${failCount}`);
    console.log(`📋 Total tutors tested: ${results.length}`);

    if (successCount === results.length) {
      console.log('\n🎉 All tutors are working perfectly!');
    } else {
      console.log('\n⚠️ Some tutors failed to respond properly. Check the logs above for details.');
    }

    return results;
  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  }
}

// Run the test
testAllTutors().catch(console.error);
