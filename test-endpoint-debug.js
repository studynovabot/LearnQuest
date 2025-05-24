// Debug script to test specific endpoint
const BASE_URL = 'https://studynovaai.vercel.app';

async function debugEndpoint() {
  console.log('🔍 Debugging task endpoint...\n');

  const userId = 'debug-user-' + Date.now();
  let taskId = null;

  try {
    // First create a task to get an ID
    console.log('1️⃣ Creating a task first...');
    const createResponse = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify({
        description: 'Debug task',
        xpReward: 10,
        priority: 'low'
      })
    });

    if (createResponse.ok) {
      const task = await createResponse.json();
      taskId = task.id;
      console.log('✅ Task created with ID:', taskId);
    } else {
      console.error('❌ Failed to create task');
      return;
    }

    // Test different endpoint variations
    const endpoints = [
      `/api/tasks/${taskId}`,
      `/api/tasks/${taskId}.js`,
      `/api/tasks/[id]?id=${taskId}`,
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testing endpoint: ${endpoint}`);
      
      // Test OPTIONS request first
      try {
        const optionsResponse = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'OPTIONS',
          headers: {
            'X-User-ID': userId
          }
        });
        console.log(`   OPTIONS: ${optionsResponse.status} ${optionsResponse.statusText}`);
      } catch (error) {
        console.log(`   OPTIONS error: ${error.message}`);
      }

      // Test PATCH request
      try {
        const patchResponse = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId
          },
          body: JSON.stringify({
            description: 'Updated debug task'
          })
        });
        console.log(`   PATCH: ${patchResponse.status} ${patchResponse.statusText}`);
        
        if (!patchResponse.ok) {
          const errorText = await patchResponse.text();
          console.log(`   Error body: ${errorText}`);
        }
      } catch (error) {
        console.log(`   PATCH error: ${error.message}`);
      }
    }

    // Clean up - try to delete the task
    console.log('\n🧹 Cleaning up...');
    try {
      const deleteResponse = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-User-ID': userId
        }
      });
      console.log(`DELETE: ${deleteResponse.status} ${deleteResponse.statusText}`);
    } catch (error) {
      console.log(`DELETE error: ${error.message}`);
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugEndpoint();
