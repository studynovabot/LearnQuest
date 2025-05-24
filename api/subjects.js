export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return hardcoded subjects data
    const subjects = [
      {
        id: '1',
        name: 'Mathematics',
        icon: '🔢',
        description: 'Numbers, algebra, geometry, and more',
        color: 'blue'
      },
      {
        id: '2',
        name: 'Science',
        icon: '🔬',
        description: 'Physics, chemistry, biology, and earth science',
        color: 'green'
      },
      {
        id: '3',
        name: 'English',
        icon: '📚',
        description: 'Literature, grammar, writing, and reading',
        color: 'purple'
      },
      {
        id: '4',
        name: 'History',
        icon: '🏛️',
        description: 'World history, civilizations, and events',
        color: 'orange'
      },
      {
        id: '5',
        name: 'Geography',
        icon: '🌍',
        description: 'World geography, maps, and cultures',
        color: 'teal'
      }
    ];

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error in subjects API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
