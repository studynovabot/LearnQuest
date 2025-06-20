// Simple and effective Q&A parser for educational content
export function parseQAFromText(textContent, metadata) {
  try {
    console.log('🔍 Starting simple Q&A parsing...');
    
    // Split by Q1., Q2., etc. and filter out empty sections
    const qaSections = textContent
      .split(/(?=Q\d+\.)/g)
      .filter(section => section.trim().length > 10);
    
    const results = [];
    
    qaSections.forEach((section, index) => {
      const trimmed = section.trim();
      if (!trimmed.startsWith('Q')) return;
      
      // Extract question number
      const qMatch = trimmed.match(/^Q(\d+)\.\s*(.+)/s);
      if (!qMatch) return;
      
      const questionNumber = parseInt(qMatch[1]);
      const content = qMatch[2];
      
      // Split content into lines and find where answer starts
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let questionLines = [];
      let answerLines = [];
      let foundAnswer = false;
      
      for (let line of lines) {
        // Check if this line starts an answer (starts with capital letter after question)
        if (!foundAnswer && questionLines.length > 0 && /^[A-Z]/.test(line) && !line.endsWith('?')) {
          foundAnswer = true;
          answerLines.push(line);
        } else if (foundAnswer) {
          answerLines.push(line);
        } else {
          questionLines.push(line);
        }
      }
      
      const question = questionLines.join(' ').trim();
      const answer = answerLines.join(' ').trim();
      
      if (question.length > 5 && answer.length > 10) {
        results.push({
          ...metadata,
          question,
          answer,
          questionNumber,
          extractedAt: new Date().toISOString(),
          confidence: 0.95
        });
      }
    });
    
    console.log(`✅ Successfully parsed ${results.length} Q&A pairs`);
    return results;
    
  } catch (error) {
    console.error('❌ Error parsing Q&A:', error);
    return [];
  }
}

// Save to JSONL format
export async function saveQAToJSONL(qaPairs, outputPath) {
  try {
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');
    
    // Create directory if it doesn't exist
    await mkdir(path.dirname(outputPath), { recursive: true });
    
    const jsonlContent = qaPairs
      .map(qa => JSON.stringify(qa))
      .join('\n');
    
    await writeFile(outputPath, jsonlContent, 'utf-8');
    console.log(`✅ Saved ${qaPairs.length} Q&A pairs to ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ Error saving to JSONL:', error);
    throw error;
  }
}