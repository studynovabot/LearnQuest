# API Keys Setup Guide

This document provides instructions for setting up the required API keys for the LearnQuest application.

## Required API Keys

The application requires the following API key:

1. **Groq API Key** - Used for all AI tutors

## How to Obtain API Key

### Groq API Key

1. Visit [Groq's website](https://groq.com/)
2. Sign up for an account or log in
3. Navigate to the API section in your dashboard
4. Create a new API key
5. Copy the API key

## Setting Up API Key in the Application

1. Open the `.env` file in the root directory of the project
2. Update the following line with your actual API key:

```
GROQ_API_KEY=your_groq_api_key_here
```

3. Save the file
4. Restart the application

## Troubleshooting

If you encounter API authorization errors:

1. Verify that your API key is correctly copied into the `.env` file
2. Check that your API key is active and has not expired
3. Ensure you have sufficient credits or quota on your API account
4. Check the API endpoint in the `.env` file is correct:

```
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

### Model Availability Issues

The application is configured to use `llama-3.3-70b-versatile` which is available through Groq's API. This model provides excellent performance for all tutor types.

## Firebase Index Setup

If you encounter an error about missing Firebase indexes, follow these steps:

1. Look for an error message containing a URL like:
   ```
   https://console.firebase.google.com/v1/r/project/studynovabot/firestore/indexes?create_composite=...
   ```

2. Open this URL in your browser
3. Sign in to your Firebase account
4. Create the suggested index
5. Wait for the index to build (this may take a few minutes)

## Support

If you continue to experience issues, please contact the development team for assistance.