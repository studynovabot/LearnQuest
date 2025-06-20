// File upload utility for NCERT solutions
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

// Save uploaded file
export async function saveUploadedFile(file, type = 'solution') {
  try {
    if (!file || !file.path) {
      throw new Error('Invalid file provided');
    }

    const uploadsDir = await ensureUploadsDir();
    const fileExtension = path.extname(file.originalFilename || '');
    const filename = `${type}_${uuidv4()}${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Copy file from temp location to uploads directory
    await fs.copyFile(file.path, filepath);
    
    // Clean up temp file
    try {
      await fs.unlink(file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    return {
      filename,
      originalName: file.originalFilename,
      size: file.size,
      path: `/uploads/${filename}`,
      mimeType: file.headers ? file.headers['content-type'] : 'application/octet-stream'
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Failed to save file: ${error.message}`);
  }
}

// Validate file type
export function validateFileType(file, allowedTypes = ['pdf']) {
  if (!file || !file.originalFilename) {
    throw new Error('No file provided');
  }

  const extension = path.extname(file.originalFilename).toLowerCase().slice(1);
  if (!allowedTypes.includes(extension)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return true;
}

// Validate file size (in bytes)
export function validateFileSize(file, maxSize = 10 * 1024 * 1024) { // 10MB default
  if (!file || !file.size) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }

  return true;
}