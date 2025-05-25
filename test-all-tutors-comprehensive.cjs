// Comprehensive test script for all 15 AI tutors
const fetch = require('node-fetch');

const BASE_URL = 'https://studynovaai.vercel.app';

// Test questions for each tutor based on their specialization
const TUTOR_TESTS = [
  { id: '1', name: 'Nova', subject: 'General AI Tutor', question: 'Hello Nova, can you help me with my studies today?' },
  { id: '2', name: 'MathWiz', subject: 'Mathematics', question: 'What is the quadratic formula and how do I use it?' },
  { id: '3', name: 'ScienceBot', subject: 'Science', question: 'Explain photosynthesis in simple terms' },
  { id: '4', name: 'LinguaLearn', subject: 'English', question: 'What is the difference between active and passive voice?' },
  { id: '5', name: 'HistoryWise', subject: 'History', question: 'Tell me about the causes of World War I' },
  { id: '6', name: 'CodeMaster', subject: 'Programming', question: 'What is a function in programming?' },
  { id: '7', name: 'ArtVision', subject: 'Arts', question: 'What are the primary colors and how do they mix?' },
  { id: '8', name: 'EcoExpert', subject: 'Environmental Science', question: 'What causes climate change?' },
  { id: '9', name: 'PhiloThink', subject: 'Philosophy', question: 'What is the meaning of ethics?' },
  { id: '10', name: 'PsychoGuide', subject: 'Psychology', question: 'What is cognitive psychology?' },
  { id: '11', name: 'EconAnalyst', subject: 'Economics', question: 'What is supply and demand?' },
  { id: '12', name: 'GeoExplorer', subject: 'Geography', question: 'What are the continents of the world?' },
  { id: '13', name: 'MotivateMe', subject: 'Motivation', question: 'I feel unmotivated to study. Can you help me?' },
  { id: '14', name: 'StudyBuddy', subject: 'Study Skills', question: 'What are effective study techniques?' },
  { id: '15', name: 'PersonalAI', subject: 'Personalized Learning', question: 'How can I learn more effectively based on my learning style?' }
];

async function testTutor(tutorTest) {
  console.log(`\n🧪 Testing ${tutorTest.name} (${tutorTest.subject})...`);
  console.log(`❓ Question: "${tutorTest.question}"`);

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'test-user-id'
      },
      body: JSON.stringify({
        content: tutorTest.question,
        agentId: tutorTest.id,
        userId: 'test-user'
      })
    });

    console.log(`📡 Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ ${tutorTest.name} FAILED: ${response.status} - ${errorText}`);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();

    if (data.content && data.content.length > 10) {
      console.log(`✅ ${tutorTest.name} SUCCESS`);
      console.log(`💬 Response: ${data.content.substring(0, 100)}...`);
      console.log(`⭐ XP Awarded: ${data.xpAwarded || 0}`);
      return { success: true, response: data.content };
    } else {
      console.log(`❌ ${tutorTest.name} FAILED: Empty or invalid response`);
      return { success: false, error: 'Empty or invalid response' };
    }

  } catch (error) {
    console.log(`❌ ${tutorTest.name} ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllTutors() {
  console.log('🚀 COMPREHENSIVE AI TUTORS TEST');
  console.log('================================');
  console.log(`Testing all ${TUTOR_TESTS.length} AI tutors...\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const tutorTest of TUTOR_TESTS) {
    const result = await testTutor(tutorTest);
    results.push({
      ...tutorTest,
      ...result
    });

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n🎯 TEST SUMMARY');
  console.log('===============');
  console.log(`✅ Successful: ${successCount}/${TUTOR_TESTS.length}`);
  console.log(`❌ Failed: ${failCount}/${TUTOR_TESTS.length}`);
  console.log(`📊 Success Rate: ${Math.round((successCount / TUTOR_TESTS.length) * 100)}%`);

  // Detailed results
  console.log('\n📋 DETAILED RESULTS');
  console.log('===================');

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} (ID: ${result.id}) - ${result.subject}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Failed tutors
  const failedTutors = results.filter(r => !r.success);
  if (failedTutors.length > 0) {
    console.log('\n🔧 TUTORS THAT NEED FIXING:');
    console.log('===========================');
    failedTutors.forEach(tutor => {
      console.log(`- ${tutor.name} (ID: ${tutor.id}): ${tutor.error}`);
    });
  }

  return results;
}

// Run the test
if (require.main === module) {
  testAllTutors().catch(console.error);
}

module.exports = { testAllTutors, testTutor, TUTOR_TESTS };
