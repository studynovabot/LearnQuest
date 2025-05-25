import express from 'express';
import cors from 'cors';
import path from 'path';

// Import route handlers
import authHandler from './auth.js';
import chatHandler from './chat.js';
import tutorsHandler from './tutors.js';
import tasksHandler from './tasks.js';
import storeHandler from './store.js';
import leaderboardHandler from './leaderboard.js';
import flashNotesHandler from './flash-notes.js';
import flowChartsHandler from './flow-charts.js';
import ncertSolutionsHandler from './ncert-solutions.js';
import imageGenerationHandler from './image-generation.js';
import imageAnalysisHandler from './image-analysis.js';
import contentManagerHandler from './content-manager.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Route handlers
app.all('/api/auth*', (req, res) => authHandler(req, res));
app.all('/api/chat', (req, res) => chatHandler(req, res));
app.all('/api/tutors', (req, res) => tutorsHandler(req, res));
app.all('/api/tasks', (req, res) => tasksHandler(req, res));
app.all('/api/store', (req, res) => storeHandler(req, res));
app.all('/api/leaderboard', (req, res) => leaderboardHandler(req, res));
app.all('/api/flash-notes', (req, res) => flashNotesHandler(req, res));
app.all('/api/flow-charts', (req, res) => flowChartsHandler(req, res));
app.all('/api/ncert-solutions', (req, res) => ncertSolutionsHandler(req, res));
app.all('/api/image-generation', (req, res) => imageGenerationHandler(req, res));
app.all('/api/image-analysis', (req, res) => imageAnalysisHandler(req, res));
app.all('/api/content-manager*', (req, res) => contentManagerHandler(req, res));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;
