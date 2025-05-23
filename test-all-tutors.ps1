# Test all 15 AI tutors to ensure they're working properly
$baseUrl = "http://localhost:5000/api/chat"
$userId = "user_1747991020366_4atbkfx"

# Define test cases for each tutor
$tutorTests = @(
    @{ id = "1"; name = "Nova"; question = "Hello Nova, can you help me with my studies?" },
    @{ id = "2"; name = "Math Mentor"; question = "Can you help me solve quadratic equations?" },
    @{ id = "3"; name = "Science Sage"; question = "Explain photosynthesis to me" },
    @{ id = "4"; name = "Language Luminary"; question = "Help me improve my essay writing" },
    @{ id = "5"; name = "History Helper"; question = "Tell me about the Renaissance period" },
    @{ id = "6"; name = "Physics Pro"; question = "Explain Newton's laws of motion" },
    @{ id = "7"; name = "Chemistry Coach"; question = "What is the periodic table?" },
    @{ id = "8"; name = "Biology Buddy"; question = "How does DNA replication work?" },
    @{ id = "9"; name = "Geography Guide"; question = "Explain climate change effects" },
    @{ id = "10"; name = "Personal Coach"; question = "Help me with study time management" },
    @{ id = "11"; name = "Motivational Mentor"; question = "I need motivation to study harder" },
    @{ id = "12"; name = "Computer Science Coach"; question = "Teach me about algorithms" },
    @{ id = "13"; name = "Art & Design Advisor"; question = "What are the principles of design?" },
    @{ id = "14"; name = "Music Maestro"; question = "Explain music theory basics" },
    @{ id = "15"; name = "Philosophy Philosopher"; question = "What is ethics in philosophy?" }
)

Write-Host "🤖 Testing all 15 AI Tutors..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($test in $tutorTests) {
    Write-Host "Testing $($test.name) (ID: $($test.id))..." -ForegroundColor Yellow
    
    $body = @{
        content = $test.question
        agentId = $test.id
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = $userId
        } -Body $body -TimeoutSec 30
        
        if ($response.StatusCode -eq 200) {
            $responseData = $response.Content | ConvertFrom-Json
            if ($responseData.content -and $responseData.content -ne "I'm having trouble responding right now. Please try again.") {
                Write-Host "✅ $($test.name): SUCCESS" -ForegroundColor Green
                Write-Host "   Response: $($responseData.content.Substring(0, [Math]::Min(100, $responseData.content.Length)))..." -ForegroundColor Gray
                $successCount++
            } else {
                Write-Host "❌ $($test.name): FAILED - Empty or error response" -ForegroundColor Red
                $failCount++
            }
        } else {
            Write-Host "❌ $($test.name): FAILED - HTTP $($response.StatusCode)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ $($test.name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    # Small delay between requests
    Start-Sleep -Seconds 2
}

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "🎯 Test Results:" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount/15" -ForegroundColor Green
Write-Host "❌ Failed: $failCount/15" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "🎉 ALL TUTORS ARE WORKING PERFECTLY!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tutors need attention" -ForegroundColor Yellow
}
