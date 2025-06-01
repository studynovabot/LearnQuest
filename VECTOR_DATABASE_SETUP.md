# Vector Database Setup Guide for LearnQuest

## Overview
This guide explains how to implement a vector database system in your LearnQuest web app for PDF uploads and intelligent document search in the NCERT Solutions component.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   File Upload   │───▶│  PDF Processing  │───▶│ Vector Database │
│   Component     │    │   & Embedding    │    │    Storage      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ NCERT Solutions │◀───│  Search & Query  │◀───│   Vector Search │
│   Component     │    │    Interface     │    │     Engine      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Files Created

### Core Library Files
- `client/src/lib/vectorDatabase.ts` - Vector database service and utilities
- `client/src/lib/pdfProcessor.ts` - PDF processing and text extraction
- `client/src/components/FileUpload.tsx` - File upload component
- `client/src/components/ContentManager.tsx` - Content management interface
- `client/src/components/NCERTSolutions.tsx` - Enhanced NCERT solutions with search
- `api/vector-upload.ts` - Backend upload endpoint
- `api/vector-search.ts` - Backend search endpoint

## 🚀 Implementation Steps

### Step 1: Choose Vector Database Provider

#### Option A: Pinecone (Recommended for Production)
```bash
npm install @pinecone-database/pinecone
```

#### Option B: Supabase with pgvector (Cost-effective)
```bash
npm install @supabase/supabase-js
```

#### Option C: Chroma (Self-hosted)
```bash
npm install chromadb
```

### Step 2: Install Required Dependencies

```bash
# Core dependencies
npm install openai formidable pdf-parse

# For PDF processing (browser-side)
npm install pdfjs-dist

# For file handling
npm install multer

# For vector operations
npm install @tensorflow/tfjs
```

### Step 3: Environment Variables

Add to your `.env` file:

```env
# OpenAI for embeddings
OPENAI_API_KEY=your_openai_api_key

# Pinecone (if using)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=ncert-documents

# Supabase (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# File upload settings
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR=./uploads
```

### Step 4: Database Schema (if using Supabase)

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for metadata filtering
CREATE INDEX ON documents USING gin (metadata);
```

### Step 5: Update Existing Components

#### Update the sidebar to include Document Search:

```typescript
// In client/src/components/layout/SlidingSidebar.tsx
// Add this to navigationItems array:
{
  icon: SearchIcon,
  label: "Document Search",
  path: "/document-search",
  description: "AI-Powered Search"
}
```

#### Add route to App.tsx:

```typescript
// In client/src/App.tsx
import DocumentSearch from "@/pages/DocumentSearch";

// Add this route:
<Route path="/document-search">
  <MainLayout>
    <DocumentSearch />
  </MainLayout>
</Route>
```

## 🔧 Configuration Options

### Vector Database Configuration

```typescript
// Example configuration for different providers
const vectorConfig = {
  // Pinecone
  pinecone: {
    provider: 'pinecone',
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
    indexName: 'ncert-documents',
    dimension: 1536
  },
  
  // Supabase
  supabase: {
    provider: 'supabase',
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    dimension: 1536
  },
  
  // Chroma
  chroma: {
    provider: 'chroma',
    host: 'localhost',
    port: 8000,
    dimension: 1536
  }
};
```

## 📊 Usage Examples

### Upload a PDF Document

```typescript
import { pdfProcessor } from '@/lib/pdfProcessor';

const handleUpload = async (file: File) => {
  const metadata = {
    title: 'Class 12 Physics Chapter 1',
    subject: 'Physics',
    chapter: 'Electric Charges and Fields',
    tags: ['electricity', 'physics', 'class12']
  };
  
  const result = await pdfProcessor.processPDF(file, metadata, userId);
  if (result.success) {
    console.log(`Uploaded with ${result.chunks} chunks`);
  }
};
```

### Search Documents

```typescript
import { pdfProcessor } from '@/lib/pdfProcessor';

const searchDocuments = async (query: string) => {
  const results = await pdfProcessor.searchDocuments(query, {
    subject: 'Physics',
    userId: currentUserId
  });
  
  results.forEach(result => {
    console.log(`${result.document.metadata.title}: ${result.score}`);
    console.log(result.relevantChunk);
  });
};
```

## 🔍 Features Implemented

### File Upload Component
- ✅ Drag & drop interface
- ✅ File validation (PDF, DOC, DOCX, TXT)
- ✅ Progress tracking
- ✅ Metadata input (title, subject, chapter, tags)
- ✅ Batch upload support

### Content Manager
- ✅ Upload interface
- ✅ Document management
- ✅ Search functionality
- ✅ Filter by subject/chapter
- ✅ Delete documents
- ✅ Upload statistics

### Enhanced NCERT Solutions
- ✅ Vector-powered search
- ✅ Quick access to chapters
- ✅ Recent searches
- ✅ Suggestions based on subject
- ✅ Relevance scoring

### PDF Processing
- ✅ Text extraction
- ✅ Content chunking
- ✅ Embedding generation
- ✅ Metadata handling

## 🚀 Deployment Considerations

### Vercel Deployment
- Use Vercel's file system for temporary storage
- Consider using external storage (AWS S3, Cloudinary) for production
- Implement proper error handling for serverless functions

### Performance Optimization
- Implement caching for frequently searched queries
- Use streaming for large file uploads
- Optimize embedding generation with batching

### Security
- Validate file types and sizes
- Implement user authentication for uploads
- Sanitize metadata inputs
- Use proper CORS settings

## 🔧 Troubleshooting

### Common Issues

1. **Large file uploads failing**
   - Increase Vercel function timeout
   - Implement chunked uploads
   - Use external storage service

2. **Embedding generation slow**
   - Batch multiple texts together
   - Use faster embedding models
   - Implement caching

3. **Search results not relevant**
   - Improve text chunking strategy
   - Fine-tune similarity thresholds
   - Add more metadata for filtering

## 📈 Future Enhancements

- [ ] OCR for scanned PDFs
- [ ] Multi-language support
- [ ] Advanced filtering options
- [ ] Collaborative document sharing
- [ ] AI-generated summaries
- [ ] Integration with existing tutoring system

## 🎯 Next Steps

1. Choose your vector database provider
2. Install required dependencies
3. Set up environment variables
4. Test with sample PDF uploads
5. Integrate with existing NCERT Solutions
6. Deploy and monitor performance

This implementation provides a solid foundation for document upload and intelligent search functionality in your LearnQuest application!
