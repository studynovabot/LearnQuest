# CORS Configuration Guide

This document explains the Cross-Origin Resource Sharing (CORS) configuration for the LearnQuest application.

## Current Configuration

The backend server is configured to accept cross-origin requests from the following domains in production:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://studynovabot.com',
        'https://www.studynovabot.com',
        'https://learnquest.vercel.app',  // Vercel frontend URL
        'https://*.vercel.app',  // All Vercel preview deployments
        /^https:\/\/[^.]+\.vercel\.app$/,
        /^https:\/\/[^.]+\.vercel\.app:[0-9]+$/,
        '*'  // Allow all origins in production for debugging
      ]
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
  credentials: true
};
```

## Troubleshooting CORS Issues

If you're experiencing CORS issues:

1. **Check that your frontend domain is included in the allowed origins**
   - The current configuration allows all Vercel domains (`https://*.vercel.app`)
   - If you're using a custom domain, make sure it's added to the list

2. **Verify that the backend is properly configured**
   - The backend should have the CORS middleware properly set up
   - The CORS configuration should be applied before any route handlers

3. **Check the request headers**
   - Make sure your frontend requests include the appropriate headers
   - The `credentials: include` option should be set for cross-origin requests that need cookies

4. **Inspect the response headers**
   - The backend should respond with the appropriate CORS headers:
     - `Access-Control-Allow-Origin`
     - `Access-Control-Allow-Methods`
     - `Access-Control-Allow-Headers`
     - `Access-Control-Allow-Credentials`

## Modifying the CORS Configuration

If you need to add additional domains to the allowed origins:

1. Open `server/index.ts`
2. Find the `corsOptions` object
3. Add your domain to the `origin` array
4. Rebuild and redeploy the backend

Example:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        // Existing domains...
        'https://your-new-domain.com'  // Add your new domain here
      ]
    : '*',
  // Rest of the configuration...
};
```
