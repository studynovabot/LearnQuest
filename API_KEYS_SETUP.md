# API Keys Setup Guide

This document provides instructions for setting up the required API keys for the LearnQuest application.

## Required API Keys

The application requires the following API keys:

1. **Groq API Key** - Used for the main AI tutor
2. **TogetherAI API Key** - Used for specialized subject tutors

## How to Obtain API Keys

### Groq API Key

1. Visit [Groq's website](https://groq.com/)
2. Sign up for an account or log in
3. Navigate to the API section in your dashboard
4. Create a new API key
5. Copy the API key

### TogetherAI API Key

1. Visit [Together AI's website](https://www.together.ai/)
2. Sign up for an account or log in
3. Navigate to the API section in your dashboard
4. Create a new API key
5. Copy the API key

## Setting Up API Keys in the Application

1. Open the `.env` file in the root directory of the project
2. Update the following lines with your actual API keys:

```
GROQ_API_KEY=your_groq_api_key_here
TOGETHER_AI_API_KEY=your_together_ai_api_key_here
```

3. Save the file
4. Restart the application

## Troubleshooting

If you encounter API authorization errors:

1. Verify that your API keys are correctly copied into the `.env` file
2. Check that your API keys are active and have not expired
3. Ensure you have sufficient credits or quota on your API accounts
4. Check the API endpoints in the `.env` file are correct:

```
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
TOGETHER_AI_API_URL=https://api.together.xyz/v1/completions
```

### Model Availability Issues

If you encounter errors about models not being available:

1. The application is configured to use `togethercomputer/llama-2-7b-chat` which should be available without a dedicated endpoint
2. If you want to use other models like `google/gemma-7b-it` or `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO`, you'll need to:
   - Visit the TogetherAI dashboard
   - Go to the Models section
   - Find the model you want to use
   - Create a dedicated endpoint for that model
   - Start the endpoint (this may incur additional costs)

3. After creating a dedicated endpoint, you can update the models in `server/ai/index.ts`

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