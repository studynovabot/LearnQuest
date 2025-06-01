import { NextApiRequest, NextApiResponse } from 'next';

// Pinecone upsert endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vectors } = req.body;

    if (!vectors || !Array.isArray(vectors)) {
      return res.status(400).json({ error: 'Invalid vectors data' });
    }

    // Pinecone configuration
    const PINECONE_API_KEY = 'pcsk_59mbXi_HQ9o2j3xXRLjszb6uTbFRApCRFFXi1D3CHTzGrw751HNsxPDndaUFnTqfaTWbNR';
    const PINECONE_ENVIRONMENT = 'gcp-starter';
    const PINECONE_INDEX_NAME = 'learnquest-documents';

    // Pinecone API endpoint
    const pineconeUrl = `https://${PINECONE_INDEX_NAME}-${PINECONE_ENVIRONMENT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/vectors/upsert`;

    const response = await fetch(pineconeUrl, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: vectors,
        namespace: '' // Default namespace
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinecone upsert error:', errorText);
      
      // If index doesn't exist, try to create it
      if (response.status === 404) {
        await createPineconeIndex();
        // Retry the upsert
        const retryResponse = await fetch(pineconeUrl, {
          method: 'POST',
          headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: vectors,
            namespace: ''
          })
        });
        
        if (!retryResponse.ok) {
          throw new Error(`Pinecone upsert failed after retry: ${await retryResponse.text()}`);
        }
        
        const retryData = await retryResponse.json();
        return res.status(200).json(retryData);
      }
      
      throw new Error(`Pinecone upsert failed: ${errorText}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Upsert error:', error);
    res.status(500).json({ 
      error: 'Failed to upsert vectors',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to create Pinecone index
async function createPineconeIndex() {
  const PINECONE_API_KEY = 'pcsk_59mbXi_HQ9o2j3xXRLjszb6uTbFRApCRFFXi1D3CHTzGrw751HNsxPDndaUFnTqfaTWbNR';
  const PINECONE_ENVIRONMENT = 'gcp-starter';
  const PINECONE_INDEX_NAME = 'learnquest-documents';

  try {
    const createUrl = `https://controller.${PINECONE_ENVIRONMENT}.pinecone.io/databases`;
    
    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: PINECONE_INDEX_NAME,
        dimension: 384,
        metric: 'cosine',
        pods: 1,
        replicas: 1,
        pod_type: 'p1.x1'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Pinecone index:', errorText);
    } else {
      console.log('Pinecone index created successfully');
      // Wait a bit for index to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  } catch (error) {
    console.error('Error creating Pinecone index:', error);
  }
}
