// Detailed test for PDF upload functionality
// Run this in browser console after logging in

async function detailedUploadTest() {
    console.log('🔍 Starting Detailed Upload Test...');
    
    const API_BASE = 'https://studynovaai.vercel.app/api';
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ No auth token found. Please login first.');
        return;
    }
    
    console.log('✅ Auth token found');
    
    // Test 1: Check if test-upload endpoint exists
    console.log('\n1️⃣ Testing test-upload endpoint...');
    try {
        const response = await fetch(`${API_BASE}/test-upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: new FormData()
        });
        
        console.log('Test-upload status:', response.status);
        const responseText = await response.text();
        console.log('Test-upload response:', responseText.substring(0, 300));
        
        if (response.status === 404) {
            console.log('⚠️ test-upload endpoint not found - might not be deployed');
        }
    } catch (error) {
        console.log('❌ Test-upload error:', error.message);
    }
    
    // Test 2: Check user-profile endpoint
    console.log('\n2️⃣ Testing user-profile endpoint...');
    try {
        const response = await fetch(`${API_BASE}/user-profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('User-profile status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ User profile working');
        } else {
            const errorText = await response.text();
            console.log('❌ User profile error:', errorText.substring(0, 200));
        }
    } catch (error) {
        console.log('❌ User profile error:', error.message);
    }
    
    // Test 3: Test actual upload-pdf endpoint
    console.log('\n3️⃣ Testing upload-pdf endpoint...');
    try {
        const formData = new FormData();
        formData.append('board', 'cbse');
        formData.append('class', '10');
        formData.append('subject', 'science');
        formData.append('chapter', 'test-chapter');
        
        const response = await fetch(`${API_BASE}/upload-pdf`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });
        
        console.log('Upload-pdf status:', response.status);
        console.log('Upload-pdf headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Upload-pdf response length:', responseText.length);
        console.log('Upload-pdf response preview:', responseText.substring(0, 500));
        
        // Try to parse as JSON
        try {
            const jsonData = JSON.parse(responseText);
            console.log('✅ Response is valid JSON:', jsonData);
        } catch (parseError) {
            console.log('❌ Response is not JSON. Likely HTML error page.');
            
            // Check if it's an HTML error page
            if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
                console.log('⚠️ Server returned HTML error page instead of JSON');
                
                // Extract error info from HTML if possible
                const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
                if (titleMatch) {
                    console.log('Error page title:', titleMatch[1]);
                }
            }
        }
        
    } catch (error) {
        console.log('❌ Upload-pdf error:', error.message);
    }
    
    // Test 4: Test admin-review endpoint
    console.log('\n4️⃣ Testing admin-review endpoint...');
    try {
        const response = await fetch(`${API_BASE}/admin-review`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Admin-review status:', response.status);
        const responseText = await response.text();
        console.log('Admin-review response:', responseText.substring(0, 300));
        
    } catch (error) {
        console.log('❌ Admin-review error:', error.message);
    }
    
    console.log('\n✅ Detailed test complete!');
}

// Instructions for running
console.log(`
🧪 DETAILED UPLOAD TEST
======================

To run this test:
1. Make sure you're logged in to the app
2. Copy and paste this entire script in the browser console
3. Run: detailedUploadTest()

The test will check:
- Authentication token
- Test upload endpoint
- User profile endpoint  
- PDF upload endpoint (without file)
- Admin review endpoint
`);

// Auto-run if in browser
if (typeof window !== 'undefined') {
    detailedUploadTest();
}