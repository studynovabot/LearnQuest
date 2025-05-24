// Test script for task CRUD operations
const BASE_URL = 'https://studynovaai.vercel.app';

async function testTaskOperations() {
  console.log('🧪 Testing Task CRUD Operations...\n');

  const userId = 'test-user-' + Date.now();
  let createdTaskId = null;

  try {
    // Test 1: Create a task
    console.log('1️⃣ Testing task creation...');
    const createResponse = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify({
        description: 'Test task for CRUD operations',
        xpReward: 25,
        priority: 'high'
      })
    });

    if (createResponse.ok) {
      const createdTask = await createResponse.json();
      createdTaskId = createdTask.id;
      console.log('✅ Task created successfully:', createdTask);
    } else {
      const errorText = await createResponse.text();
      console.error('❌ Task creation failed:', createResponse.status, errorText);
      return;
    }

    // Test 2: Update the task
    console.log('\n2️⃣ Testing task update...');
    const updateResponse = await fetch(`${BASE_URL}/api/tasks?id=${createdTaskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify({
        description: 'Updated test task description',
        priority: 'medium'
      })
    });

    if (updateResponse.ok) {
      const updatedTask = await updateResponse.json();
      console.log('✅ Task updated successfully:', updatedTask);
    } else {
      const errorText = await updateResponse.text();
      console.error('❌ Task update failed:', updateResponse.status, errorText);
    }

    // Test 3: Complete the task
    console.log('\n3️⃣ Testing task completion...');
    const completeResponse = await fetch(`${BASE_URL}/api/tasks?id=${createdTaskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify({
        completed: true
      })
    });

    if (completeResponse.ok) {
      const completedTask = await completeResponse.json();
      console.log('✅ Task completed successfully:', completedTask);
    } else {
      const errorText = await completeResponse.text();
      console.error('❌ Task completion failed:', completeResponse.status, errorText);
    }

    // Test 4: Delete the task
    console.log('\n4️⃣ Testing task deletion...');
    const deleteResponse = await fetch(`${BASE_URL}/api/tasks?id=${createdTaskId}`, {
      method: 'DELETE',
      headers: {
        'X-User-ID': userId
      }
    });

    if (deleteResponse.status === 204) {
      console.log('✅ Task deleted successfully');
    } else {
      const errorText = await deleteResponse.text();
      console.error('❌ Task deletion failed:', deleteResponse.status, errorText);
    }

    // Test 5: Verify task is deleted
    console.log('\n5️⃣ Verifying task deletion...');
    const verifyResponse = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'GET',
      headers: {
        'X-User-ID': userId
      }
    });

    if (verifyResponse.ok) {
      const tasks = await verifyResponse.json();
      const deletedTask = tasks.find(task => task.id === createdTaskId);
      if (!deletedTask) {
        console.log('✅ Task deletion verified - task not found in list');
      } else {
        console.log('❌ Task deletion verification failed - task still exists');
      }
    } else {
      console.error('❌ Failed to verify task deletion');
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testTaskOperations();
