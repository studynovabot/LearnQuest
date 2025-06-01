// Vercel serverless function for vector database document upload
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Simple text-based embedding generation
function generateTextEmbedding(text) {
  const dimension = 384;
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const embedding = new Array(dimension).fill(0);
  
  words.forEach((word, index) => {
    const hash = simpleHash(word);
    const positions = [
      Math.abs(hash) % dimension,
      Math.abs(hash * 2) % dimension,
      Math.abs(hash * 3) % dimension
    ];
    
    const weight = Math.log(1 + 1) / Math.log(words.length + 1);
    positions.forEach(pos => {
      embedding[pos] += weight;
    });
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimension; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Chunk text into smaller pieces
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const words = text.split(' ');
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      initializeFirebase();
      const db = getFirestoreDb();

      const { content, metadata } = req.body;
      const userId = req.headers['x-user-id'] || 'demo-user';

      if (!content || !metadata) {
        return res.status(400).json({ message: 'Content and metadata are required' });
      }

      console.log('📤 Vector Upload: Processing document upload...');

      // Generate document ID
      const documentId = `${userId}_${Date.now()}_${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Chunk the content
      const chunks = chunkText(content, 1000, 200);
      console.log(`📄 Vector Upload: Created ${chunks.length} chunks`);

      const storedChunks = [];

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkId = `${documentId}_chunk_${i}`;

        // Generate embedding
        const embedding = generateTextEmbedding(chunk);

        // Prepare document data
        const chunkDocument = {
          id: chunkId,
          content: chunk,
          embedding: embedding,
          metadata: {
            title: metadata.title,
            subject: metadata.subject,
            chapter: metadata.chapter || '',
            fileType: metadata.fileType || 'text',
            uploadedAt: new Date().toISOString(),
            userId: userId,
            tags: metadata.tags || [],
            parentDocumentId: documentId,
            chunkIndex: i
          },
          createdAt: new Date()
        };

        // Store in Firestore
        try {
          await db.collection('vector_documents').doc(chunkId).set(chunkDocument);
          storedChunks.push(chunkId);
          console.log(`✅ Vector Upload: Stored chunk ${i + 1}/${chunks.length}`);
        } catch (error) {
          console.error(`❌ Vector Upload: Failed to store chunk ${i}:`, error);
        }
      }

      // Award XP for document upload
      const xpEarned = Math.min(storedChunks.length * 2, 50); // 2 XP per chunk, max 50

      try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const currentXP = userDoc.data().xp || 0;
          await userRef.update({
            xp: currentXP + xpEarned,
            lastActivity: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating user XP:', error);
      }

      // Record upload activity
      try {
        await db.collection('document_uploads').add({
          userId,
          documentId,
          title: metadata.title,
          subject: metadata.subject,
          chunksStored: storedChunks.length,
          totalChunks: chunks.length,
          xpEarned,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error recording upload activity:', error);
      }

      console.log(`🎉 Vector Upload: Successfully uploaded ${storedChunks.length}/${chunks.length} chunks`);

      res.status(200).json({
        success: true,
        documentId: documentId,
        chunksStored: storedChunks.length,
        totalChunks: chunks.length,
        xpEarned,
        message: 'Document uploaded and processed successfully'
      });

    } catch (error) {
      console.error('Vector upload error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to upload document',
        error: error.message 
      });
    }
  });
}
