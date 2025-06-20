// Simple PDF processor for NCERT solutions
import fs from 'fs';
import path from 'path';

/**
 * Process the NCERT PDF file and create solution data
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Object} Solution data object
 */
export function processNCERTPDF(pdfPath) {
  try {
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    // Get file stats
    const stats = fs.statSync(pdfPath);
    const fileName = path.basename(pdfPath);
    
    // Extract information from the filename
    // "NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf"
    const fileInfo = parseFileName(fileName);
    
    // Create solution data based on filename
    const solutionData = {
      id: generateSolutionId(fileInfo),
      board: 'CBSE',
      class: fileInfo.class,
      subject: fileInfo.subject,
      chapter: fileInfo.chapterTitle,
      chapterNumber: fileInfo.chapterNumber,
      exercise: 'Complete Chapter Solutions',
      totalQuestions: estimateQuestions(fileInfo.subject, fileInfo.chapterNumber),
      difficulty: 'medium',
      isAvailable: true,
      lastUpdated: stats.mtime.toISOString(),
      viewCount: 0,
      solutionFile: pdfPath,
      fileSize: stats.size,
      thumbnailImage: null,
      createdBy: 'admin',
      aiHelpEnabled: true,
      uploadedAt: new Date().toISOString(),
      description: `Complete NCERT solutions for Class ${fileInfo.class} ${fileInfo.subject} Chapter ${fileInfo.chapterNumber}: ${fileInfo.chapterTitle}`,
      tags: [fileInfo.subject.toLowerCase(), `class${fileInfo.class}`, 'ncert', 'solutions']
    };

    return solutionData;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Parse filename to extract solution information
 * @param {string} fileName - PDF filename
 * @returns {Object} Parsed information
 */
function parseFileName(fileName) {
  // Extract info from: "NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf"
  
  const classMatch = fileName.match(/Class (\d+)/i);
  const subjectMatch = fileName.match(/Class \d+ ([A-Za-z]+)/i);
  const chapterMatch = fileName.match(/Chapter (\d+) ([^-]+)/i);
  
  return {
    class: classMatch ? classMatch[1] : '10',
    subject: subjectMatch ? subjectMatch[1] : 'Science',
    chapterNumber: chapterMatch ? parseInt(chapterMatch[1]) : 1,
    chapterTitle: chapterMatch ? chapterMatch[2].trim() : 'Chemical Reactions And Equations'
  };
}

/**
 * Generate unique solution ID
 * @param {Object} fileInfo - File information
 * @returns {string} Unique ID
 */
function generateSolutionId(fileInfo) {
  const { class: className, subject, chapterNumber } = fileInfo;
  return `cbse-class${className}-${subject.toLowerCase()}-ch${chapterNumber}`;
}

/**
 * Estimate number of questions based on subject and chapter
 * @param {string} subject - Subject name
 * @param {number} chapterNumber - Chapter number
 * @returns {number} Estimated questions
 */
function estimateQuestions(subject, chapterNumber) {
  // Rough estimates based on typical NCERT patterns
  const estimates = {
    'Science': {
      1: 15, 2: 12, 3: 18, 4: 10, 5: 14, 6: 16, 7: 13, 8: 15, 9: 17, 10: 12
    },
    'Mathematics': {
      1: 25, 2: 20, 3: 22, 4: 18, 5: 24, 6: 19, 7: 21, 8: 16, 9: 20, 10: 23
    }
  };
  
  return estimates[subject]?.[chapterNumber] || 15;
}

/**
 * Copy PDF to solutions directory
 * @param {string} sourcePath - Source PDF path
 * @param {string} solutionId - Solution ID
 * @returns {string} New file path
 */
export function copyPDFToSolutions(sourcePath, solutionId) {
  try {
    const solutionsDir = path.join(process.cwd(), 'public', 'solutions');
    
    // Create solutions directory if it doesn't exist
    if (!fs.existsSync(solutionsDir)) {
      fs.mkdirSync(solutionsDir, { recursive: true });
    }
    
    const fileName = `${solutionId}.pdf`;
    const destPath = path.join(solutionsDir, fileName);
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    
    // Return relative path for web access
    return `/solutions/${fileName}`;
  } catch (error) {
    console.error('Error copying PDF:', error);
    throw error;
  }
}