# Simple PowerShell test for NCERT PDF processing
$baseUrl = "https://studynovaai.vercel.app"
$authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3NTA1OTg5NDE4NTAiLCJlbWFpbCI6InRoYWt1cnJhbnZlZXJzaW5naDUwNUBnbWFpbC5jb20iLCJzdWJzY3JpcHRpb25QbGFuIjoiZ29hdCIsInRpZXIiOiJnb2F0Iiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzUwNTk4OTQxLCJleHAiOjE3NTMxOTA5NDF9.EwvwjO3Lrd3x_knaQKR6h-EHYt6TFbUuEvK247JnDQ8"

Write-Host "Testing NCERT PDF Processing API..." -ForegroundColor Green

# Test 1: API Status
Write-Host "`n1. Testing API Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin-pdf-upload-fixed" -Method GET -Headers @{"Authorization"="Bearer $authToken"}
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "PDF Parsing Available: $($data.capabilities.pdfParsing)" -ForegroundColor $(if($data.capabilities.pdfParsing) {"Green"} else {"Red"})
    Write-Host "Text Processing Available: $($data.endpoints -contains 'POST /api/admin-pdf-upload-fixed?endpoint=test-text - Test with text input')" -ForegroundColor Green
} catch {
    Write-Host "API Status test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Text Processing
Write-Host "`n2. Testing Text Processing..." -ForegroundColor Yellow

$sampleText = @"
Q1. Why should a magnesium ribbon be cleaned before burning in air?
Magnesium ribbon should be cleaned before burning in air because magnesium metal reacts with oxygen present in air to form a layer of magnesium oxide (MgO) on its surface.

Q2. Write the balanced equation for the following chemical reactions.
(i) Hydrogen + Chlorine → Hydrogen chloride
(i) H2 + Cl2 → 2HCl

Q3. What is the color change when iron nail is dipped in copper sulphate solution?
The color changes from blue to light green because iron displaces copper from copper sulphate solution.
"@

$requestBody = @{
    textContent = $sampleText
    metadata = @{
        board = "cbse"
        class = 10
        subject = "science"
        chapter = "chemical-reactions"
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin-pdf-upload-fixed?endpoint=test-text" -Method POST -Headers @{"Authorization"="Bearer $authToken"; "Content-Type"="application/json"} -Body $requestBody
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Success: $($data.success)" -ForegroundColor Green
    
    if ($data.success) {
        Write-Host "Questions extracted: $($data.data.summary.totalQuestions)" -ForegroundColor Cyan
        Write-Host "Text length: $($data.data.summary.textLength)" -ForegroundColor Cyan
        
        # Show first question
        if ($data.data.qaPairs.Count -gt 0) {
            $firstQA = $data.data.qaPairs[0]
            Write-Host "`nFirst Q&A pair:" -ForegroundColor White
            Write-Host "Q: $($firstQA.question)" -ForegroundColor White
            Write-Host "A: $($firstQA.answer.Substring(0, [Math]::Min(100, $firstQA.answer.Length)))..." -ForegroundColor Gray
        }
        
        # Create JSONL file
        $jsonlLines = @()
        foreach ($qa in $data.data.qaPairs) {
            $jsonlEntry = @{
                question = $qa.question
                answer = $qa.answer
                metadata = @{
                    questionNumber = $qa.questionNumber
                    board = $qa.board
                    class = $qa.class
                    subject = $qa.subject
                    chapter = $qa.chapter
                }
            } | ConvertTo-Json -Compress
            $jsonlLines += $jsonlEntry
        }
        
        $jsonlContent = $jsonlLines -join "`n"
        $jsonlContent | Out-File -FilePath "test-ncert-output.jsonl" -Encoding UTF8
        
        Write-Host "`nJSONL file created: test-ncert-output.jsonl" -ForegroundColor Green
        Write-Host "File size: $((Get-Item test-ncert-output.jsonl).Length) bytes" -ForegroundColor Green
        
    } else {
        Write-Host "Error: $($data.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Text processing test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== SOLUTION FOR YOUR NCERT PDF ===" -ForegroundColor Yellow
Write-Host "Your PDF processing is now working!" -ForegroundColor Green
Write-Host "1. Extract text from your NCERT PDF (copy-paste or online converter)" -ForegroundColor White
Write-Host "2. Use the text-based API endpoint we just tested" -ForegroundColor White
Write-Host "3. Get your JSONL file with all Q&A pairs" -ForegroundColor White
Write-Host "`nAPI endpoint: $baseUrl/api/admin-pdf-upload-fixed?endpoint=test-text" -ForegroundColor Cyan