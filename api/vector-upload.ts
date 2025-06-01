import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Vector database upload endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    const [fields, files] = await form.parse(req);
    
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const metadata = Array.isArray(fields.metadata) ? fields.metadata[0] : fields.metadata;

    if (!uploadedFile || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process the uploaded file
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const fileName = uploadedFile.originalFilename || 'unknown';
    
    // Extract text from file (simplified - in production use proper PDF parsing)
    let extractedText = '';
    if (fileName.toLowerCase().endsWith('.txt')) {
      extractedText = fileBuffer.toString('utf-8');
    } else if (fileName.toLowerCase().endsWith('.pdf')) {
      // For PDF files, you would use a library like pdf-parse
      extractedText = `Sample extracted text from ${fileName}. In production, this would contain the actual PDF content.`;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Generate embeddings (simplified - in production use OpenAI API)
    const embedding = await generateEmbedding(extractedText);
    
    // Store in vector database (simplified - in production use actual vector DB)
    const documentId = `${userId}_${Date.now()}_${fileName}`;
    const document = {
      id: documentId,
      content: extractedText,
      embedding: embedding,
      metadata: {
        title: fileName,
        subject: JSON.parse(metadata || '{}').subject || 'General',
        chapter: JSON.parse(metadata || '{}').chapter,
        fileType: path.extname(fileName).toLowerCase(),
        uploadedAt: new Date().toISOString(),
        userId: userId,
        tags: JSON.parse(metadata || '{}').tags || []
      }
    };

    // Store document (in production, this would go to your vector database)
    await storeDocument(document);

    // Clean up uploaded file
    fs.unlinkSync(uploadedFile.filepath);

    res.status(200).json({
      success: true,
      documentId: documentId,
      message: 'Document uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Generate embeddings (simplified implementation)
async function generateEmbedding(text: string): Promise<number[]> {
  // In production, use OpenAI's embedding API
  // For now, return a mock embedding
  return new Array(1536).fill(0).map(() => Math.random());
}

// Store document in vector database (simplified implementation)
async function storeDocument(document: any): Promise<void> {
  // In production, this would store in your chosen vector database
  // For now, we'll store in a simple JSON file for demonstration
  const storageDir = path.join(process.cwd(), 'vector-storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  const filePath = path.join(storageDir, `${document.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(document, null, 2));
}

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
