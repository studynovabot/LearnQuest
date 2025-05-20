# LearnQuest Deployment Guide

This guide will help you deploy the LearnQuest application to Render (backend) and Vercel (frontend).

## Prerequisites

- A [Render](https://render.com) account for the backend.
- A [Vercel](https://vercel.com) account for the frontend.
- API keys for Groq and TogetherAI (see `API_KEYS_SETUP.md`).
- Firebase project setup (see `FIREBASE_SETUP.md`).

## Firebase Setup

1. **Create a Firebase Project:**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database

2. **Generate Service Account Key:**
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded JSON file as `serviceAccountKey.json` in the root directory
   - ⚠️ **IMPORTANT:** Never commit this file to version control!

3. **Environment Variables:**
   - Add the Firebase configuration to your `.env` file
   - For deployment, add these variables to your Render dashboard

## Backend Deployment (Render)

1. **Fork or clone this repository.**
2. **Create a new Web Service on Render:**
   - Connect your GitHub repository.
   - Set the build command: `cd server && npm install && npm run build`
   - Set the start command: `cd server && npm start`
   - Add environment variables from `.env.example` in the Render dashboard.
3. **Deploy the service.**

## Frontend Deployment (Vercel)

1. **Fork or clone this repository.**
2. **Create a new project on Vercel:**
   - Connect your GitHub repository.
   - Set the build command: `cd client && npm install && npm run build`
   - Set the output directory: `client/dist`
   - Add the following environment variables:
     - `VITE_NODE_ENV=production`
     - `VITE_BACKEND_URL=https://your-backend-url.onrender.com` (replace with your actual Render backend URL)
3. **Deploy the project.**

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GROQ_API_KEY=your_groq_api_key_here
TOGETHER_AI_API_KEY=your_together_ai_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
PORT=5000
NODE_ENV=production
```

## Split Deployment Architecture

This application uses a split deployment architecture:
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render

For this architecture to work correctly, the frontend needs to know the URL of the backend API. This is configured through the `VITE_BACKEND_URL` environment variable in Vercel.

### CORS Configuration

The backend is configured to accept requests from the frontend domain. If you're experiencing CORS issues, make sure:
1. The backend's CORS configuration includes your Vercel frontend domain
2. The `VITE_BACKEND_URL` in Vercel points to the correct Render backend URL

## Troubleshooting

- If you encounter issues with API keys, refer to `API_KEYS_SETUP.md`.
- For Firebase setup issues, refer to `FIREBASE_SETUP.md`.
- If you get secret scanning errors, make sure you haven't committed any service account keys.
- If you're seeing 404 errors for API endpoints, check that:
  - The backend is deployed and running correctly on Render
  - The `VITE_BACKEND_URL` environment variable is set correctly in Vercel
  - The backend's CORS configuration allows requests from your Vercel domain

## Support

If you need further assistance, please contact the development team.