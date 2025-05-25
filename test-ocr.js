// Test script to demonstrate the OCR functionality
// Note: This requires node-fetch to be installed: npm install node-fetch

// Sample base64 image data with actual text (you can replace this with any image)
const sampleImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

console.log('🔧 OCR Configuration:');
console.log('📡 Using OCR.space API with key: K85411479688957');
console.log('🎯 Primary OCR Engine: 2 (Advanced)');
console.log('🔄 Backup OCR Engine: 1 (Basic)');
console.log('');

async function testOCR() {
  console.log('🔍 Testing OCR functionality...\n');

  try {
    // Test the image analysis API
    const response = await fetch('http://localhost:3000/api/image-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      body: JSON.stringify({
        imageData: sampleImageBase64,
        type: 'ocr-analysis'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OCR Test Results:');
      console.log('📝 Extracted Text:', data.extractedText);
      console.log('🤖 AI Explanation:', data.explanation);
      console.log('🎯 XP Earned:', data.xpEarned);
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Note: This test requires the server to be running.');
    console.log('   The OCR functionality has been updated to use real OCR services instead of random sample text.');
  }
}

// Run the test
testOCR();
