// Vercel serverless function for tutors - All 15 AI Agents
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';

// All 15 AI Tutors Configuration
const ALL_TUTORS = [
  { id: '1', name: 'Nova', subject: 'General AI Tutor', description: 'Your personal AI learning companion for all subjects', unlocked: true, xpRequired: 0, iconName: 'robot', color: 'blue', specialization: 'general' },
  { id: '2', name: 'MathWiz', subject: 'Mathematics', description: 'Expert in algebra, calculus, geometry, and advanced mathematics', unlocked: true, xpRequired: 0, iconName: 'calculator', color: 'purple', specialization: 'math' },
  { id: '3', name: 'ScienceBot', subject: 'Science', description: 'Physics, chemistry, biology, and earth sciences specialist', unlocked: true, xpRequired: 0, iconName: 'flask', color: 'green', specialization: 'science' },
  { id: '4', name: 'LinguaLearn', subject: 'English', description: 'Grammar, literature, writing, and language arts expert', unlocked: true, xpRequired: 0, iconName: 'book', color: 'orange', specialization: 'english' },
  { id: '5', name: 'HistoryWise', subject: 'History', description: 'World history, civilizations, and historical analysis', unlocked: true, xpRequired: 0, iconName: 'landmark', color: 'amber', specialization: 'history' },
  { id: '6', name: 'CodeMaster', subject: 'Programming', description: 'Coding, algorithms, and software development mentor', unlocked: true, xpRequired: 0, iconName: 'code', color: 'cyan', specialization: 'programming' },
  { id: '7', name: 'ArtVision', subject: 'Arts', description: 'Visual arts, music, and creative expression guide', unlocked: true, xpRequired: 0, iconName: 'palette', color: 'pink', specialization: 'arts' },
  { id: '8', name: 'EcoExpert', subject: 'Environmental Science', description: 'Ecology, sustainability, and environmental studies', unlocked: true, xpRequired: 0, iconName: 'leaf', color: 'emerald', specialization: 'environmental' },
  { id: '9', name: 'PhiloThink', subject: 'Philosophy', description: 'Critical thinking, ethics, and philosophical reasoning', unlocked: true, xpRequired: 0, iconName: 'smile', color: 'indigo', specialization: 'philosophy' },
  { id: '10', name: 'PsychoGuide', subject: 'Psychology', description: 'Human behavior, mental health, and psychological concepts', unlocked: true, xpRequired: 0, iconName: 'brain', color: 'violet', specialization: 'psychology' },
  { id: '11', name: 'EconAnalyst', subject: 'Economics', description: 'Economic theory, markets, and financial literacy', unlocked: true, xpRequired: 0, iconName: 'trending-up', color: 'red', specialization: 'economics' },
  { id: '12', name: 'GeoExplorer', subject: 'Geography', description: 'World geography, cultures, and spatial analysis', unlocked: true, xpRequired: 0, iconName: 'globe', color: 'teal', specialization: 'geography' },
  { id: '13', name: 'MotivateMe', subject: 'Motivation', description: 'Personal development and motivational coaching', unlocked: true, xpRequired: 0, iconName: 'flex', color: 'yellow', specialization: 'motivation' },
  { id: '14', name: 'StudyBuddy', subject: 'Study Skills', description: 'Learning techniques and study strategies', unlocked: true, xpRequired: 0, iconName: 'book-open', color: 'slate', specialization: 'study_skills' },
  { id: '15', name: 'PersonalAI', subject: 'Personalized Learning', description: 'Adaptive learning tailored to your unique needs', unlocked: true, xpRequired: 0, iconName: 'sparkles', color: 'rose', specialization: 'personalized' }
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
        // Frontend expects just the array, not an object with tutors property
        res.status(200).json(ALL_TUTORS);
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
