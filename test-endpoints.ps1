# PowerShell script to test API endpoints
$API_BASE = "https://studynovaai.vercel.app/api"

Write-Host "🧪 Testing LearnQuest API Endpoints..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health-check" -Method GET
    Write-Host "✅ Health Check: OK" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: Test Simple Endpoint
Write-Host "`n2️⃣ Testing Simple Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/test-simple" -Method GET
    Write-Host "✅ Test Simple: OK" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Test Simple: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 3: Test Upload Endpoint (without auth - should fail)
Write-Host "`n3️⃣ Testing Upload Endpoint (no auth)..." -ForegroundColor Yellow
try {
    $boundary = [System.Guid]::NewGuid().ToString() 
    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $body = @"
--$boundary
Content-Disposition: form-data; name="test"

value
--$boundary--
"@
    
    $response = Invoke-RestMethod -Uri "$API_BASE/test-upload" -Method POST -Body $body -Headers $headers
    Write-Host "✅ Test Upload: OK" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Test Upload: FAILED (Expected without auth)" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

# Test 4: User Profile (without auth - should fail)
Write-Host "`n4️⃣ Testing User Profile (no auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/user-profile" -Method GET
    Write-Host "✅ User Profile: OK" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ User Profile: FAILED (Expected without auth)" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

Write-Host "`n🏁 API Endpoint Testing Complete!" -ForegroundColor Green
Write-Host "Note: Auth-required endpoints should fail without proper authentication." -ForegroundColor Cyan