import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { pdfProcessor, validateFile, FileMetadata, PDFProcessingResult } from '../lib/pdfProcessor';

interface FileUploadProps {
  onUploadComplete?: (results: PDFProcessingResult[]) => void;
  userId: string;
  className?: string;
}

interface FileWithMetadata {
  file: File;
  metadata: FileMetadata;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, userId, className = '' }) => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithMetadata[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validation = validateFile(file);
      
      if (validation.valid) {
        newFiles.push({
          file,
          metadata: {
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            subject: 'General',
            tags: []
          },
          status: 'pending'
        });
      } else {
        newFiles.push({
          file,
          metadata: {
            title: file.name,
            subject: 'General',
            tags: []
          },
          status: 'error',
          error: validation.error
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Update file metadata
  const updateFileMetadata = (index: number, metadata: Partial<FileMetadata>) => {
    setFiles(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, metadata: { ...item.metadata, ...metadata } }
        : item
    ));
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const results = await pdfProcessor.processMultipleFiles(
        validFiles.map(f => f.file),
        validFiles.map(f => f.metadata),
        userId,
        (progress, fileName) => {
          // Update progress for current file
          setFiles(prev => prev.map(item => 
            item.file.name === fileName 
              ? { ...item, progress, status: 'uploading' as const }
              : item
          ));
        }
      );

      // Update file statuses based on results
      results.forEach((result, index) => {
        const fileIndex = files.findIndex(f => f.file === validFiles[index].file);
        if (fileIndex !== -1) {
          setFiles(prev => prev.map((item, i) => 
            i === fileIndex 
              ? { 
                  ...item, 
                  status: result.success ? 'success' : 'error',
                  error: result.error,
                  progress: 100
                }
              : item
          ));
        }
      });

      if (onUploadComplete) {
        onUploadComplete(results);
      }

    } catch (error) {
      console.error('Upload error:', error);
      // Mark all pending files as error
      setFiles(prev => prev.map(item => 
        item.status === 'pending' || item.status === 'uploading'
          ? { ...item, status: 'error', error: 'Upload failed' }
          : item
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'Hindi', 'History', 'Geography', 'Political Science', 'Economics',
    'Computer Science', 'General'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Documents
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Select Files
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: PDF, DOC, DOCX, TXT (Max 50MB each)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Selected Files</h4>
          
          {files.map((fileItem, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {fileItem.file.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({(fileItem.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileItem.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {fileItem.status === 'uploading' && (
                    <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {fileItem.status === 'uploading' && fileItem.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fileItem.progress}%` }}
                  />
                </div>
              )}

              {/* Error Message */}
              {fileItem.status === 'error' && fileItem.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {fileItem.error}
                </div>
              )}

              {/* Metadata Form */}
              {fileItem.status === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={fileItem.metadata.title}
                      onChange={(e) => updateFileMetadata(index, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={fileItem.metadata.subject}
                      onChange={(e) => updateFileMetadata(index, { subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chapter (Optional)
                    </label>
                    <input
                      type="text"
                      value={fileItem.metadata.chapter || ''}
                      onChange={(e) => updateFileMetadata(index, { chapter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Chapter 1"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Upload Button */}
          {files.some(f => f.status === 'pending') && (
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="-ml-1 mr-3 h-5 w-5" />
                    Upload Files
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
