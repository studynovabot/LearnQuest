// Test the real API locally
import { processNCERTPDF, copyPDFToSolutions } from './utils/pdf-processor-simple.js';
import path from 'path';
import fs from 'fs';

console.log('🧪 Testing NCERT PDF processing...');

try {
  const pdfPath = path.join(process.cwd(), 'NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf');
  
  console.log('📄 PDF Path:', pdfPath);
  console.log('📄 File exists:', fs.existsSync(pdfPath));
  
  if (fs.existsSync(pdfPath)) {
    // Process the PDF
    const solutionData = processNCERTPDF(pdfPath);
    console.log('✅ Solution Data Generated:');
    console.log(JSON.stringify(solutionData, null, 2));
    
    // Test copying
    const webPath = copyPDFToSolutions(pdfPath, solutionData.id);
    console.log('✅ PDF copied to:', webPath);
    
  } else {
    console.error('❌ PDF file not found');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}