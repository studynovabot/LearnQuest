import { NextApiRequest, NextApiResponse } from 'next';

// Pinecone query endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vector, topK = 10, includeMetadata = true, filter } = req.body;

    if (!vector || !Array.isArray(vector)) {
      return res.status(400).json({ error: 'Invalid vector data' });
    }

    // Pinecone configuration
    const PINECONE_API_KEY = 'pcsk_59mbXi_HQ9o2j3xXRLjszb6uTbFRApCRFFXi1D3CHTzGrw751HNsxPDndaUFnTqfaTWbNR';
    const PINECONE_ENVIRONMENT = 'gcp-starter';
    const PINECONE_INDEX_NAME = 'learnquest-documents';

    // Pinecone API endpoint
    const pineconeUrl = `https://${PINECONE_INDEX_NAME}-${PINECONE_ENVIRONMENT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/query`;

    // Prepare query body
    const queryBody: any = {
      vector: vector,
      topK: topK,
      includeMetadata: includeMetadata,
      namespace: '' // Default namespace
    };

    // Add filter if provided
    if (filter) {
      queryBody.filter = filter;
    }

    const response = await fetch(pineconeUrl, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinecone query error:', errorText);
      
      // If index doesn't exist, return empty results
      if (response.status === 404) {
        return res.status(200).json({
          matches: [],
          namespace: ''
        });
      }
      
      throw new Error(`Pinecone query failed: ${errorText}`);
    }

    const data = await response.json();
    
    // Ensure matches exist
    if (!data.matches) {
      data.matches = [];
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ 
      error: 'Failed to query vectors',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
