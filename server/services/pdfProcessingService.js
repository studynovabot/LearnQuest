const fs = require('fs');
const path = require('path');
const os = require('os');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || "studynova-ai",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk@studynova-ai.iam.gserviceaccount.com",
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n')
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "studynova-ai.appspot.com"
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

/**
 * Service for processing NCERT PDF files and extracting questions and answers
 */
class PDFProcessingService {
  /**
   * Process a PDF file and extract questions and answers
   * @param {Object} options - Processing options
   * @param {string} options.filePath - Path to the PDF file
   * @param {string} options.className - Class name (e.g., "Class 10")
   * @param {string} options.subject - Subject name (e.g., "Mathematics")
   * @param {string} options.chapterName - Chapter name (e.g., "Chapter 1: Real Numbers")
   * @returns {Promise<Object>} - Processing result
   */
  async processPDF(options) {
    const { filePath, className, subject, chapterName } = options;
    
    try {
      // Read the PDF file
      const dataBuffer = fs.readFileSync(filePath);
      
      // Parse the PDF
      const pdfData = await pdfParse(dataBuffer);
      
      // Extract text content
      const text = pdfData.text;
      
      // Process the text to identify questions and answers
      const result = await this.extractQuestionsAndAnswers(text, {
        className,
        subject,
        chapterName
      });
      
      // Save the extracted data to JSONL file
      const jsonlPath = await this.saveToJSONL(result, {
        className,
        subject,
        chapterName
      });
      
      return {
        success: true,
        message: 'PDF processed successfully',
        data: {
          questionsCount: result.questions.length,
          jsonlPath
        }
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        success: false,
        message: 'Failed to process PDF',
        error: error.message
      };
    }
  }
  
  /**
   * Extract questions and answers from text content
   * @param {string} text - Text content from PDF
   * @param {Object} metadata - Metadata for the content
   * @returns {Promise<Object>} - Extracted questions and answers
   */
  async extractQuestionsAndAnswers(text, metadata) {
    // This is a simplified implementation
    // In a real-world scenario, you would use more sophisticated NLP techniques
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const questions = [];
    let currentSection = 'exercise';
    let currentSectionName = 'Exercise';
    
    // Simple pattern matching for questions and exercises
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect section changes
      if (line.toLowerCase().includes('exercise') && !line.toLowerCase().includes('exercises')) {
        currentSection = 'exercise';
        currentSectionName = line;
        continue;
      } else if (line.toLowerCase().includes('example') && !line.toLowerCase().includes('examples')) {
        currentSection = 'example';
        currentSectionName = line;
        continue;
      } else if (line.toLowerCase().includes('intext question') || line.toLowerCase().includes('in-text question')) {
        currentSection = 'intext';
        currentSectionName = 'Intext Questions';
        continue;
      }
      
      // Detect questions
      // This is a simplified approach - in reality, you'd need more sophisticated pattern recognition
      if (/^\d+\.|\(\d+\)|\d+\)/.test(line) && line.length < 200) {
        // This looks like a question
        const questionText = line;
        
        // Look ahead for the answer (simplified)
        let answerText = '';
        let j = i + 1;
        while (j < lines.length && !(/^\d+\.|\(\d+\)|\d+\)/.test(lines[j].trim())) && j < i + 15) {
          answerText += lines[j] + ' ';
          j++;
        }
        
        // Create question object
        const question = {
          id: uuidv4(),
          number: questionText.match(/^\d+\.|\(\d+\)|\d+\)/)[0].replace(/[^\d]/g, ''),
          text: questionText,
          solution: answerText.trim(),
          sectionType: currentSection,
          sectionName: currentSectionName,
          metadata: {
            ...metadata,
            pageNumber: Math.floor(i / 40) + 1 // Rough estimate of page number
          }
        };
        
        questions.push(question);
      }
    }
    
    return {
      metadata,
      questions
    };
  }
  
  /**
   * Save extracted data to Firebase and local JSONL file
   * @param {Object} data - Extracted data
   * @param {Object} metadata - Metadata for the content
   * @returns {Promise<Object>} - Path to the saved data
   */
  async saveToJSONL(data, metadata) {
    const { className, subject, chapterName } = metadata;
    
    // Create directory structure if it doesn't exist (for local backup)
    const baseDir = path.join(__dirname, '..', 'data', 'ncert');
    const classDir = path.join(baseDir, className.replace(/\s+/g, '_'));
    const subjectDir = path.join(classDir, subject.replace(/\s+/g, '_'));
    
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    if (!fs.existsSync(classDir)) fs.mkdirSync(classDir, { recursive: true });
    if (!fs.existsSync(subjectDir)) fs.mkdirSync(subjectDir, { recursive: true });
    
    // Create filename and paths
    const chapterSlug = chapterName
      .replace(/Chapter\s+\d+:\s+/i, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
    
    const filename = `${chapterSlug}.jsonl`;
    const localFilePath = path.join(subjectDir, filename);
    
    // Create Firebase path
    const firebasePath = `ncert/${className.replace(/\s+/g, '_')}/${subject.replace(/\s+/g, '_')}/${chapterSlug}`;
    
    // Write data to local JSONL file as backup
    const jsonlData = data.questions.map(question => JSON.stringify(question)).join('\n');
    fs.writeFileSync(localFilePath, jsonlData);
    
    // Store data in Firebase
    try {
      // 1. Store chapter metadata in Firestore
      const chapterRef = db.collection('ncert').doc(firebasePath);
      await chapterRef.set({
        className,
        subject,
        chapterName,
        questionCount: data.questions.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // 2. Store each question as a document in a subcollection
      const questionsCollection = chapterRef.collection('questions');
      const batch = db.batch();
      
      data.questions.forEach(question => {
        const questionRef = questionsCollection.doc(question.id);
        batch.set(questionRef, {
          ...question,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      
      // 3. Also store the JSONL file in Firebase Storage for backup
      const tempFilePath = path.join(os.tmpdir(), filename);
      fs.writeFileSync(tempFilePath, jsonlData);
      
      await bucket.upload(tempFilePath, {
        destination: `ncert/${className.replace(/\s+/g, '_')}/${subject.replace(/\s+/g, '_')}/${filename}`,
        metadata: {
          contentType: 'application/jsonl',
          metadata: {
            className,
            subject,
            chapterName,
            questionCount: data.questions.length
          }
        }
      });
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      return {
        localFilePath,
        firebasePath,
        storagePath: `ncert/${className.replace(/\s+/g, '_')}/${subject.replace(/\s+/g, '_')}/${filename}`
      };
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      // Return local path if Firebase storage fails
      return { localFilePath };
    }
  }
  
  /**
   * Get all available NCERT data from Firebase
   * @returns {Promise<Object>} - Available NCERT data
   */
  async getAvailableNCERTData() {
    try {
      // Try to fetch from Firebase first
      const snapshot = await db.collection('ncert').get();
      
      if (snapshot.empty) {
        // Fall back to local data if Firebase is empty
        return this.getLocalNCERTData();
      }
      
      // Process Firebase data
      const chaptersMap = new Map();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const { className, subject, chapterName, questionCount } = data;
        
        // Create unique keys for class and subject
        const classKey = className.replace(/\s+/g, '_').toLowerCase();
        const subjectKey = `${classKey}_${subject.replace(/\s+/g, '_').toLowerCase()}`;
        
        // Extract chapter name without "Chapter X:" prefix
        const cleanChapterName = chapterName.replace(/Chapter\s+\d+:\s+/i, '');
        
        // Create chapter object
        const chapter = {
          id: `${classKey}_${subject.replace(/\s+/g, '_')}_${cleanChapterName.replace(/\s+/g, '_')}`.toLowerCase(),
          name: chapterName,
          questionCount: questionCount || 0,
          firebasePath: doc.id
        };
        
        // Add to map
        if (!chaptersMap.has(classKey)) {
          chaptersMap.set(classKey, {
            id: classKey,
            name: className,
            subjects: new Map()
          });
        }
        
        const classData = chaptersMap.get(classKey);
        
        if (!classData.subjects.has(subjectKey)) {
          classData.subjects.set(subjectKey, {
            id: subjectKey,
            name: subject,
            chapters: []
          });
        }
        
        classData.subjects.get(subjectKey).chapters.push(chapter);
      });
      
      // Convert maps to arrays
      const classes = Array.from(chaptersMap.values()).map(classData => {
        return {
          id: classData.id,
          name: classData.name,
          subjects: Array.from(classData.subjects.values())
        };
      });
      
      return { classes };
    } catch (error) {
      console.error('Error fetching from Firebase:', error);
      // Fall back to local data if Firebase fetch fails
      return this.getLocalNCERTData();
    }
  }
  
  /**
   * Get NCERT data from local filesystem (fallback)
   * @returns {Promise<Object>} - Available NCERT data
   */
  async getLocalNCERTData() {
    const baseDir = path.join(__dirname, '..', 'data', 'ncert');
    
    if (!fs.existsSync(baseDir)) {
      return {
        classes: []
      };
    }
    
    const classes = [];
    
    // Read class directories
    const classDirs = fs.readdirSync(baseDir);
    for (const classDir of classDirs) {
      const classPath = path.join(baseDir, classDir);
      if (fs.statSync(classPath).isDirectory()) {
        const className = classDir.replace(/_/g, ' ');
        const subjects = [];
        
        // Read subject directories
        const subjectDirs = fs.readdirSync(classPath);
        for (const subjectDir of subjectDirs) {
          const subjectPath = path.join(classPath, subjectDir);
          if (fs.statSync(subjectPath).isDirectory()) {
            const subjectName = subjectDir.replace(/_/g, ' ');
            const chapters = [];
            
            // Read chapter files
            const chapterFiles = fs.readdirSync(subjectPath);
            for (const chapterFile of chapterFiles) {
              if (chapterFile.endsWith('.jsonl')) {
                const chapterName = chapterFile
                  .replace('.jsonl', '')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
                
                // Read the first line to get question count
                const filePath = path.join(subjectPath, chapterFile);
                const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0];
                const questionCount = fs.readFileSync(filePath, 'utf8').split('\n').length;
                
                chapters.push({
                  id: `${className}_${subjectName}_${chapterName}`.replace(/\s+/g, '_').toLowerCase(),
                  name: `Chapter: ${chapterName}`,
                  questionCount,
                  filePath
                });
              }
            }
            
            subjects.push({
              id: `${className}_${subjectName}`.replace(/\s+/g, '_').toLowerCase(),
              name: subjectName,
              chapters
            });
          }
        }
        
        classes.push({
          id: className.replace(/\s+/g, '_').toLowerCase(),
          name: className,
          subjects
        });
      }
    }
    
    return {
      classes
    };
  }
  
  /**
   * Get questions for a specific chapter
   * @param {string} chapterPath - Path to the chapter (Firebase path or local file path)
   * @returns {Promise<Array>} - Questions for the chapter
   */
  async getQuestionsForChapter(chapterPath) {
    try {
      // Check if this is a Firebase path
      if (chapterPath.startsWith('ncert/')) {
        // Fetch from Firebase
        const chapterRef = db.collection('ncert').doc(chapterPath);
        const chapterDoc = await chapterRef.get();
        
        if (!chapterDoc.exists) {
          throw new Error('Chapter not found in Firebase');
        }
        
        // Get questions from subcollection
        const questionsSnapshot = await chapterRef.collection('questions').get();
        
        if (questionsSnapshot.empty) {
          throw new Error('No questions found for this chapter');
        }
        
        const questions = [];
        questionsSnapshot.forEach(doc => {
          questions.push(doc.data());
        });
        
        // Group questions by section
        const sections = {};
        for (const question of questions) {
          const sectionKey = `${question.sectionType}_${question.sectionName}`;
          if (!sections[sectionKey]) {
            sections[sectionKey] = {
              id: sectionKey.replace(/\s+/g, '_').toLowerCase(),
              name: question.sectionName,
              type: question.sectionType,
              questions: []
            };
          }
          
          sections[sectionKey].questions.push({
            id: question.id,
            number: question.number,
            text: question.text,
            solution: question.solution,
            hasDetailedSolution: question.solution && question.solution.length > 0
          });
        }
        
        return Object.values(sections);
      } else {
        // Fallback to local file
        if (!fs.existsSync(chapterPath)) {
          throw new Error('Chapter file not found');
        }
        
        const jsonlData = fs.readFileSync(chapterPath, 'utf8');
        const questions = jsonlData.split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => JSON.parse(line));
        
        // Group questions by section
        const sections = {};
        for (const question of questions) {
          const sectionKey = `${question.sectionType}_${question.sectionName}`;
          if (!sections[sectionKey]) {
            sections[sectionKey] = {
              id: sectionKey.replace(/\s+/g, '_').toLowerCase(),
              name: question.sectionName,
              type: question.sectionType,
              questions: []
            };
          }
          
          sections[sectionKey].questions.push({
            id: question.id,
            number: question.number,
            text: question.text,
            solution: question.solution,
            hasDetailedSolution: question.solution && question.solution.length > 0
          });
        }
        
        return Object.values(sections);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }
}

module.exports = new PDFProcessingService();