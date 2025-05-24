// Vercel serverless function for tutors - All 15 AI Agents
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';

// All 15 AI Tutors Configuration
const ALL_TUTORS = [
  { id: '1', name: 'Nova', subject: 'General AI Tutor', description: 'Your personal AI learning companion for all subjects', unlocked: true, xpRequired: 0, avatar: '🤖', specialization: 'general' },
  { id: '2', name: 'MathWiz', subject: 'Mathematics', description: 'Expert in algebra, calculus, geometry, and advanced mathematics', unlocked: true, xpRequired: 0, avatar: '🔢', specialization: 'math' },
  { id: '3', name: 'ScienceBot', subject: 'Science', description: 'Physics, chemistry, biology, and earth sciences specialist', unlocked: true, xpRequired: 0, avatar: '🔬', specialization: 'science' },
  { id: '4', name: 'LinguaLearn', subject: 'English', description: 'Grammar, literature, writing, and language arts expert', unlocked: true, xpRequired: 0, avatar: '📚', specialization: 'english' },
  { id: '5', name: 'HistoryWise', subject: 'History', description: 'World history, civilizations, and historical analysis', unlocked: true, xpRequired: 0, avatar: '🏛️', specialization: 'history' },
  { id: '6', name: 'CodeMaster', subject: 'Programming', description: 'Coding, algorithms, and software development mentor', unlocked: true, xpRequired: 0, avatar: '💻', specialization: 'programming' },
  { id: '7', name: 'ArtVision', subject: 'Arts', description: 'Visual arts, music, and creative expression guide', unlocked: true, xpRequired: 0, avatar: '🎨', specialization: 'arts' },
  { id: '8', name: 'EcoExpert', subject: 'Environmental Science', description: 'Ecology, sustainability, and environmental studies', unlocked: true, xpRequired: 0, avatar: '🌱', specialization: 'environmental' },
  { id: '9', name: 'PhiloThink', subject: 'Philosophy', description: 'Critical thinking, ethics, and philosophical reasoning', unlocked: true, xpRequired: 0, avatar: '🤔', specialization: 'philosophy' },
  { id: '10', name: 'PsychoGuide', subject: 'Psychology', description: 'Human behavior, mental health, and psychological concepts', unlocked: true, xpRequired: 0, avatar: '🧠', specialization: 'psychology' },
  { id: '11', name: 'EconAnalyst', subject: 'Economics', description: 'Economic theory, markets, and financial literacy', unlocked: true, xpRequired: 0, avatar: '📈', specialization: 'economics' },
  { id: '12', name: 'GeoExplorer', subject: 'Geography', description: 'World geography, cultures, and spatial analysis', unlocked: true, xpRequired: 0, avatar: '🌍', specialization: 'geography' },
  { id: '13', name: 'MotivateMe', subject: 'Motivation', description: 'Personal development and motivational coaching', unlocked: true, xpRequired: 0, avatar: '💪', specialization: 'motivation' },
  { id: '14', name: 'StudyBuddy', subject: 'Study Skills', description: 'Learning techniques and study strategies', unlocked: true, xpRequired: 0, avatar: '📖', specialization: 'study_skills' },
  { id: '15', name: 'PersonalAI', subject: 'Personalized Learning', description: 'Adaptive learning tailored to your unique needs', unlocked: true, xpRequired: 0, avatar: '✨', specialization: 'personalized' }
];

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();

      if (req.method === 'GET') {
        // Get user ID from headers (you'll need to implement proper auth)
        const userId = req.headers['x-user-id'] || 'demo-user';

        // Return all 15 tutors (all unlocked by default as requested)
        res.status(200).json({
          tutors: ALL_TUTORS,
          message: 'All 15 AI tutors loaded successfully',
          totalTutors: ALL_TUTORS.length,
          unlockedTutors: ALL_TUTORS.filter(t => t.unlocked).length,
          cors: 'enabled',
          platform: 'vercel'
        });
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Tutors error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
