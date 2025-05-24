# Vercel Full-Stack Deployment Guide

This guide shows you how to deploy both your frontend and backend to Vercel in a single project, eliminating CORS errors completely.

## 🎯 Benefits of This Setup

- **No CORS Issues**: Frontend and backend on same domain
- **Single Project**: Easier to manage and deploy
- **Serverless**: Automatic scaling and cost-effective
- **Fast**: Global CDN for frontend, edge functions for backend

## 📁 Project Structure

```
LearnQuest/
├── client/                 # React frontend
├── api/                   # Vercel serverless functions (backend)
│   ├── _utils/           # Shared utilities
│   │   ├── firebase.js   # Firebase initialization
│   │   ├── cors.js       # CORS handling
│   │   └── storage.js    # Database operations
│   ├── auth/             # Authentication endpoints
│   │   ├── login.js
│   │   └── register.js
│   ├── chat.js           # AI chat endpoint
│   ├── health.js         # Health check
│   ├── tasks.js          # Task management
│   ├── tutors.js         # AI tutors
│   ├── store.js          # Store items
│   └── seed.js           # Database seeding
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## 🚀 Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your LearnQuest repository

### 2. Configure Environment Variables

In your Vercel dashboard, go to Settings > Environment Variables and add:

```
NODE_ENV=production
VITE_NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
GROQ_API_KEY=your-groq-api-key
TOGETHER_API_KEY=your-together-ai-key
```

### 3. Deploy

Vercel will automatically:
- Build your frontend (`client/`)
- Set up serverless functions (`api/`)
- Deploy everything to a single domain

## 🔧 How It Works

### Frontend (client/)
- Built with Vite
- Served from Vercel's global CDN
- API calls go to `/api/*` (same domain)

### Backend (api/)
- Serverless functions
- Each file in `api/` becomes an endpoint
- Automatic scaling and caching

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/tutors` - Get AI tutors
- `POST /api/chat` - AI chat
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `GET /api/store` - Get store items
- `GET /api/seed` - Seed database

## 🔥 Firebase Setup

Your Firebase configuration is handled in `api/_utils/firebase.js`. Make sure you have:

1. Firebase project created
2. Firestore database enabled
3. Service account key configured in environment variables

## 🎨 Frontend Configuration

The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:5004`
- **Production**: Uses `/api` (same domain, no CORS!)

## 🧪 Testing

After deployment:

1. Visit your Vercel URL
2. Test the health endpoint: `https://your-app.vercel.app/api/health`
3. Try registering a new user
4. Test the AI chat functionality

## 🔍 Monitoring

Vercel provides:
- Real-time logs
- Performance analytics
- Error tracking
- Function metrics

## 🛠️ Local Development

For local development:

```bash
# Install dependencies
npm install

# Start frontend
npm run dev:client

# For backend testing, use the existing server
npm run dev
```

## 🚨 Troubleshooting

### Common Issues:

1. **Environment Variables**: Make sure all Firebase and AI API keys are set
2. **Build Errors**: Check that all dependencies are in the right package.json files
3. **Function Timeouts**: Increase timeout in vercel.json if needed
4. **CORS Errors**: Should not happen with this setup, but check browser console

### Debug Steps:

1. Check Vercel function logs
2. Test individual API endpoints
3. Verify Firebase connection
4. Check environment variables

## 📈 Scaling

This setup automatically scales:
- Frontend: Global CDN
- Backend: Serverless functions scale to zero when not used
- Database: Firebase handles scaling automatically

## 💰 Cost

- Vercel: Free tier includes 100GB bandwidth, 100 serverless function invocations
- Firebase: Free tier includes 1GB storage, 50K reads/day
- Very cost-effective for most applications

## 🔄 Updates

To update your app:
1. Push changes to your GitHub repository
2. Vercel automatically redeploys
3. Zero downtime deployments

Your app will be available at: `https://your-project-name.vercel.app`

No more CORS errors! 🎉
