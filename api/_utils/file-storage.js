// File storage utilities for PDF uploads
import fs from 'fs';
import path from 'path';

// For development, we'll use local storage
// In production, you can integrate with Firebase Storage or Google Cloud Storage

export async function uploadToStorage(filePath, fileName) {
  try {
    // Use local storage for development
    return uploadToLocal(filePath, fileName);
  } catch (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
}

export async function deleteFromStorage(fileName) {
  try {
    return deleteFromLocal(fileName);
  } catch (error) {
    console.error('Storage delete error:', error);
    throw error;
  }
}

// Local storage functions
function uploadToLocal(filePath, fileName) {
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
}
