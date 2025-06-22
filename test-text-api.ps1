# PowerShell script to test the text-based API
$baseUrl = "https://studynovaai.vercel.app"
$authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3NTA1OTg5NDE4NTAiLCJlbWFpbCI6InRoYWt1cnJhbnZlZXJzaW5naDUwNUBnbWFpbC5jb20iLCJzdWJzY3JpcHRpb25QbGFuIjoiZ29hdCIsInRpZXIiOiJnb2F0Iiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzUwNTk4OTQxLCJleHAiOjE3NTMxOTA5NDF9.EwvwjO3Lrd3x_knaQKR6h-EHYt6TFbUuEvK247JnDQ8"

# Sample NCERT text for testing
$sampleText = @"
Q1. Why should a magnesium ribbon be cleaned before burning in air?
Magnesium ribbon should be cleaned before burning in air because magnesium metal reacts with oxygen present in air to form a layer of magnesium oxide (MgO) on its surface. This layer of magnesium oxide prevents the burning of magnesium ribbon. Therefore, it should be cleaned by sand paper to remove the layer of MgO so that the underlying metal can be exposed to air.

Q2. Write the balanced equation for the following chemical reactions.
(i) Hydrogen + Chlorine → Hydrogen chloride
(ii) Barium chloride + Aluminium sulphate → Barium sulphate + Aluminium chloride
(iii) Sodium + Water → Sodium hydroxide + Hydrogen

(i) H2 + Cl2 → 2HCl
(ii) 3BaCl2 + Al2(SO4)3 → 3BaSO4 + 2AlCl3
(iii) 2Na + 2H2O → 2NaOH + H2

Q3. Write a balanced chemical equation with state symbols for the following reactions.
(i) Solutions of barium chloride and sodium sulphate in water react to give insoluble barium sulphate and the solution of sodium chloride.
(ii) Sodium hydroxide solution (in water) reacts with hydrochloric acid solution (in water) to produce sodium chloride solution and water.

(i) BaCl2(aq) + Na2SO4(aq) → BaSO4(s) + 2NaCl(aq)
(ii) NaOH(aq) + HCl(aq) → NaCl(aq) + H2O(l)
"@

# Create request body
$requestBody = @{
    textContent = $sampleText
    metadata = @{
        board = "cbse"
        class = 10
        subject = "science"
        chapter = "chemical-reactions-and-equations"
    }
} | ConvertTo-Json -Depth 3

# Test the text-based API
Write-Host "🧪 Testing NCERT Text Processing API..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin-pdf-upload-fixed?endpoint=test-text" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $authToken"
            "Content-Type" = "application/json"
        } `
        -Body $requestBody
    
    $responseData = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Success: $($responseData.success)" -ForegroundColor Green
    
    if ($responseData.success) {
        Write-Host "📊 Extracted Q`&A Pairs: $($responseData.data.summary.totalQuestions)" -ForegroundColor Cyan
        Write-Host "📝 Text Length: $($responseData.data.summary.textLength)" -ForegroundColor Cyan
        
        Write-Host "`n📚 Sample Q`&A Pairs:" -ForegroundColor Yellow
        for ($i = 0; $i -lt [Math]::Min(3, $responseData.data.qaPairs.Count); $i++) {
            $qa = $responseData.data.qaPairs[$i]
            Write-Host "Q$($i+1): $($qa.question)" -ForegroundColor White
            Write-Host "A$($i+1): $($qa.answer.Substring(0, [Math]::Min(100, $qa.answer.Length)))..." -ForegroundColor Gray
            Write-Host ""
        }
        
        # Create JSONL file
        $jsonlLines = @()
        foreach ($qa in $responseData.data.qaPairs) {
            $jsonlEntry = @{
                question = $qa.question
                answer = $qa.answer
                metadata = @{
                    questionNumber = $qa.questionNumber
                    board = $qa.board
                    class = $qa.class
                    subject = $qa.subject
                    chapter = $qa.chapter
                    extractedAt = $qa.extractedAt
                }
            } | ConvertTo-Json -Compress
            $jsonlLines += $jsonlEntry
        }
        
        $jsonlContent = $jsonlLines -join "`n"
        $jsonlFile = "ncert-chemical-reactions-qa-pairs.jsonl"
        
        $jsonlContent | Out-File -FilePath $jsonlFile -Encoding UTF8
        
        Write-Host "💾 JSONL file created: $jsonlFile" -ForegroundColor Green
        Write-Host "📊 File contains $($responseData.data.qaPairs.Count) Q`&A pairs" -ForegroundColor Green
        
    } else {
        Write-Host "❌ API Error: $($responseData.message)" -ForegroundColor Red
        Write-Host "Response: $($response.Content)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Green
Write-Host "📖 Instructions for your NCERT PDF:" -ForegroundColor Yellow
Write-Host "1. Open your PDF: 'NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf'" -ForegroundColor White
Write-Host "2. Select all text (Ctrl+A) and copy (Ctrl+C)" -ForegroundColor White
Write-Host "3. Replace the `$sampleText variable in this script with your PDF text" -ForegroundColor White
Write-Host "4. Run this script again to process your actual PDF content" -ForegroundColor White