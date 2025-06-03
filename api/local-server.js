// Local development server for testing the API
import express from 'express';
import cors from 'cors';
import mockChatRouter from './mock-chat.js';

const app = express();
const PORT = 3001;

// Enable JSON parsing for request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Mount the mock chat API
app.use('/api/chat', mockChatRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Local API server running at http://localhost:${PORT}`);
  console.log(`📝 Mock chat API available at http://localhost:${PORT}/api/chat`);
});