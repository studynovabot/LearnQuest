# PowerShell script to test PDF upload fixes
Write-Host "🧪 Testing PDF Upload API Fixes..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$baseUrl = "https://studynovaai.vercel.app"
$authToken = "eyJhbGciOiJIUzI1NiIs..."

# Test 1: Health Check
Write-Host "`n🔍 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health-check" -Method GET
    Write-Host "✅ Health Check: SUCCESS" -ForegroundColor Green
    Write-Host $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Health Check: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: GET admin-pdf-upload
Write-Host "`n🔍 Test 2: GET /api/admin-pdf-upload" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin-pdf-upload" -Method GET -Headers $headers
    Write-Host "✅ GET admin-pdf-upload: SUCCESS" -ForegroundColor Green
    Write-Host $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ GET admin-pdf-upload: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: GET new upload endpoint
Write-Host "`n🔍 Test 3: GET /api/admin-pdf-upload?endpoint=upload-pdf" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin-pdf-upload?endpoint=upload-pdf" -Method GET -Headers $headers
    Write-Host "✅ New upload endpoint: SUCCESS" -ForegroundColor Green
    Write-Host $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ New upload endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: POST to upload endpoint (without file - should fail gracefully)
Write-Host "`n🔍 Test 4: POST /api/admin-pdf-upload?endpoint=upload-pdf (without file)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $authToken"
    }
    
    # Create empty form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $contentType = "multipart/form-data; boundary=$boundary"
    
    $body = @"
--$boundary
Content-Disposition: form-data; name="board"

cbse
--$boundary
Content-Disposition: form-data; name="class"

10
--$boundary
Content-Disposition: form-data; name="subject"

science
--$boundary
Content-Disposition: form-data; name="chapter"

test-chapter
--$boundary--
"@

    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin-pdf-upload?endpoint=upload-pdf" -Method POST -Headers @{"Authorization" = "Bearer $authToken"; "Content-Type" = $contentType} -Body $body
    Write-Host "⚠️ POST without file: Unexpected success" -ForegroundColor Yellow
    Write-Host $response | ConvertTo-Json -Depth 2
} catch {
    $errorDetails = $_.Exception.Response
    if ($errorDetails) {
        $reader = New-Object System.IO.StreamReader($errorDetails.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "✅ POST without file: Expected failure (400/422)" -ForegroundColor Green
        Write-Host "Response: $responseBody" -ForegroundColor Cyan
    } else {
        Write-Host "❌ POST without file: Unexpected error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 API Test Summary:" -ForegroundColor Cyan
Write-Host "- If all tests above show SUCCESS or expected failures, the API is working correctly" -ForegroundColor Green
Write-Host "- The 500 errors from your original test should now be resolved" -ForegroundColor Green
Write-Host "- You can now test with actual PDF file uploads using the HTML test page" -ForegroundColor Yellow

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open the test-pdf-fixes.html file in your browser" -ForegroundColor White
Write-Host "2. Run the mock PDF upload test" -ForegroundColor White
Write-Host "3. Try uploading a real PDF file" -ForegroundColor White
Write-Host "4. Check the browser console for detailed logs" -ForegroundColor White