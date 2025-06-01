// Vercel serverless function for vector database document upload
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';
import { pineconeService, generateSimpleEmbedding } from './_utils/pinecone.js';

// Admin configuration
const ADMIN_EMAIL = 'thakurranveersingh505@gmail.com';

// Check if user is admin
function isAdmin(userEmail) {
  return userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Get user limits based on admin status
function getUserLimits(userEmail) {
  if (isAdmin(userEmail)) {
    return {
      maxFileSize: 500 * 1024 * 1024, // 500MB for admin
      maxChunks: 'unlimited',
      maxUploads: 'unlimited',
      priority: 'high'
    };
  }

  return {
    maxFileSize: 50 * 1024 * 1024, // 50MB for regular users
    maxChunks: 100,
    maxUploads: 50,
    priority: 'normal'
  };
}

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
      const userEmail = req.headers['x-user-email'] || '';

      if (!content || !metadata) {
        return res.status(400).json({ message: 'Content and metadata are required' });
      }

      // Get user limits and check admin status
      const userLimits = getUserLimits(userEmail);
      const userIsAdmin = isAdmin(userEmail);

      console.log(`📤 Vector Upload: Processing document upload for ${userIsAdmin ? 'ADMIN' : 'USER'}: ${userEmail}`);

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

        // Generate embedding using Pinecone service
        const embedding = generateSimpleEmbedding(chunk, 384);

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

        // Store in both Firestore and Pinecone
        try {
          // Store metadata in Firestore
          await db.collection('vector_documents').doc(chunkId).set(chunkDocument);

          // Store vector in Pinecone
          const pineconeVector = {
            id: chunkId,
            values: embedding,
            metadata: {
              content: chunk.substring(0, 1000), // Limit content size for metadata
              title: metadata.title,
              subject: metadata.subject,
              chapter: metadata.chapter || '',
              userId: userId,
              uploadedAt: new Date().toISOString()
            }
          };

          await pineconeService.upsert([pineconeVector]);
          storedChunks.push(chunkId);
          console.log(`✅ Vector Upload: Stored chunk ${i + 1}/${chunks.length} in both Firestore and Pinecone`);
        } catch (error) {
          console.error(`❌ Vector Upload: Failed to store chunk ${i}:`, error);
          // Still count as stored if at least Firestore succeeded
          try {
            await db.collection('vector_documents').doc(chunkId).set(chunkDocument);
            storedChunks.push(chunkId);
            console.log(`⚠️ Vector Upload: Stored chunk ${i + 1}/${chunks.length} in Firestore only (Pinecone failed)`);
          } catch (firestoreError) {
            console.error(`❌ Vector Upload: Failed to store chunk ${i} in Firestore:`, firestoreError);
          }
        }
      }

      // Update user record (no gamification)
      try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          await userRef.update({
            lastActivity: new Date(),
            isAdmin: userIsAdmin,
            adminEmail: userIsAdmin ? userEmail : null
          });
        } else if (userIsAdmin) {
          // Create admin user record if doesn't exist
          await userRef.set({
            email: userEmail,
            isAdmin: true,
            adminEmail: userEmail,
            role: 'owner',
            createdAt: new Date(),
            lastActivity: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating user record:', error);
      }

      // Record upload activity
      try {
        await db.collection('document_uploads').add({
          userId,
          userEmail,
          isAdmin: userIsAdmin,
          documentId,
          title: metadata.title,
          subject: metadata.subject,
          chunksStored: storedChunks.length,
          totalChunks: chunks.length,
          userLimits,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error recording upload activity:', error);
      }

      console.log(`🎉 Vector Upload: Successfully uploaded ${storedChunks.length}/${chunks.length} chunks for ${userIsAdmin ? 'ADMIN' : 'USER'}`);

      res.status(200).json({
        success: true,
        documentId: documentId,
        chunksStored: storedChunks.length,
        totalChunks: chunks.length,
        isAdmin: userIsAdmin,
        userLimits,
        message: `Document uploaded and processed successfully${userIsAdmin ? ' (Admin privileges applied)' : ''}`
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
