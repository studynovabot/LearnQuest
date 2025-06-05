// Enhanced file storage utilities for educational content uploads
import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Storage
let storage = null;

function getFirebaseStorage() {
  if (!storage) {
    const apps = getApps();
    if (apps.length > 0) {
      storage = getStorage(apps[0]);
    }
  }
  return storage;
}

export async function uploadToStorage(filePath, fileName, metadata = {}) {
  try {
    // Try Firebase Storage first, fallback to local storage
    const firebaseStorage = getFirebaseStorage();

    if (firebaseStorage && process.env.NODE_ENV === 'production') {
      return await uploadToFirebaseStorage(filePath, fileName, metadata);
    } else {
      return await uploadToLocal(filePath, fileName);
    }
  } catch (error) {
    console.error('Storage upload error:', error);
    // Fallback to local storage
    return await uploadToLocal(filePath, fileName);
  }
}

export async function deleteFromStorage(fileName) {
  try {
    const firebaseStorage = getFirebaseStorage();

    if (firebaseStorage && process.env.NODE_ENV === 'production') {
      return await deleteFromFirebaseStorage(fileName);
    } else {
      return deleteFromLocal(fileName);
    }
  } catch (error) {
    console.error('Storage delete error:', error);
    // Try local storage as fallback
    return deleteFromLocal(fileName);
  }
}

// Firebase Storage functions
async function uploadToFirebaseStorage(filePath, fileName, metadata = {}) {
  try {
    const storage = getFirebaseStorage();
    const bucket = storage.bucket();

    const file = bucket.file(`educational-content/${fileName}`);

    await file.save(fs.readFileSync(filePath), {
      metadata: {
        contentType: metadata.mimeType || 'application/pdf',
        metadata: {
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/educational-content/${fileName}`;
  } catch (error) {
    console.error('Firebase Storage upload error:', error);
    throw error;
  }
}

async function deleteFromFirebaseStorage(fileName) {
  try {
    const storage = getFirebaseStorage();
    const bucket = storage.bucket();
    const file = bucket.file(`educational-content/${fileName}`);

    await file.delete();
    return true;
  } catch (error) {
    console.error('Firebase Storage delete error:', error);
    throw error;
  }
}

// Local storage functions (fallback)
async function uploadToLocal(filePath, fileName) {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const targetPath = path.join(uploadsDir, fileName);

  // Create directory if it doesn't exist
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy file to uploads directory
  fs.copyFileSync(filePath, targetPath);

  return `/uploads/${fileName}`;
}

function deleteFromLocal(fileName) {
  const filePath = path.join(process.cwd(), 'uploads', fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return true;
}

// Utility functions for file handling
export function generateUniqueFileName(originalName, type, board, classNum, subject) {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);

  return `${type}/${board}/${classNum}/${subject}/${timestamp}_${baseName}${extension}`;
}

export function validateFileType(fileName, allowedTypes = ['.pdf', '.doc', '.docx']) {
  const extension = path.extname(fileName).toLowerCase();
  return allowedTypes.includes(extension);
}

export function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
