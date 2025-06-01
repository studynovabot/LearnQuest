// Configuration file for API keys and environment variables

export const config = {
  // Pinecone Configuration
  pinecone: {
    apiKey: 'pcsk_59mbXi_HQ9o2j3xXRLjszb6uTbFRApCRFFXi1D3CHTzGrw751HNsxPDndaUFnTqfaTWbNR',
    environment: 'gcp-starter',
    indexName: 'learnquest-documents',
    dimension: 384 // Using smaller dimension for text-based embeddings
  },

  // Embedding Configuration (using simple text-based embeddings)
  embeddings: {
    method: 'text-hash', // Simple text-based similarity
    dimension: 384 // Smaller dimension for efficiency
  },

  // Groq Configuration (existing)
  groq: {
    apiKey: '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',
    model: 'llama-3.1-8b-instant'
  },

  // Together AI Configuration (existing)
  together: {
    apiKey: '386f94fa38882002186da7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7',
    models: {
      deepseek: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
      llama: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
    }
  },

  // OCR Configuration (existing)
  ocr: {
    apiKey: 'K85411479688957'
  },

  // Starry AI Configuration (existing)
  starryAI: {
    apiKey: 'Bcv0WVCdscDikozcYN8HdwwTzt7inw'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    supportedTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    chunkSize: 1000,
    chunkOverlap: 200
  },

  // Vector Database Configuration
  vectorDB: {
    similarityThreshold: 0.1,
    maxResults: 10,
    defaultNamespace: 'learnquest'
  }
};

// Helper functions
export const getApiKey = (service: keyof typeof config) => {
  const serviceConfig = config[service];
  if ('apiKey' in serviceConfig) {
    return serviceConfig.apiKey;
  }
  return '';
};

export const isConfigured = (service: keyof typeof config) => {
  const apiKey = getApiKey(service);
  return apiKey && apiKey.length > 0;
};

// Validation functions
export const validatePineconeConfig = () => {
  const { apiKey, environment, indexName } = config.pinecone;
  return !!(apiKey && environment && indexName);
};

export const validateGroqConfig = () => {
  return !!config.groq.apiKey;
};

// Export individual configs for easier access
export const pineconeConfig = config.pinecone;
export const uploadConfig = config.upload;
export const vectorDBConfig = config.vectorDB;
