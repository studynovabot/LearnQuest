#!/usr/bin/env node

/**
 * Deployment script for LearnQuest to Vercel
 * This script ensures proper deployment of both frontend and backend
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting LearnQuest deployment to Vercel...\n');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
  console.log('✅ Vercel CLI installed');
}

// Check if we're logged in to Vercel
try {
  execSync('vercel whoami', { stdio: 'ignore' });
  console.log('✅ Logged in to Vercel');
} catch (error) {
  console.log('❌ Not logged in to Vercel. Please run: vercel login');
  process.exit(1);
}

// Build the frontend
console.log('\n📦 Building frontend...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend built successfully');
} catch (error) {
  console.log('❌ Frontend build failed');
  process.exit(1);
}

// Check environment variables
console.log('\n🔑 Checking environment variables...');
const requiredEnvVars = [
  'GROQ_API_KEY',
  'TOGETHER_AI_API_KEY',
  'OPENROUTER_API_KEY',
  'FIREWORKS_API_KEY',
  'DEEPINFRA_API_KEY'
];

const missingVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nPlease set these in your Vercel project settings or .env file');
} else {
  console.log('✅ All required environment variables are set');
}

// Deploy to Vercel
console.log('\n🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('\n✅ Deployment successful!');
  console.log('\n🎉 Your AI tutors should now work perfectly on Vercel!');
  console.log('\nNext steps:');
  console.log('1. Test the AI tutors in your deployed app');
  console.log('2. Check the Vercel dashboard for any errors');
  console.log('3. Monitor the serverless function logs');
} catch (error) {
  console.log('❌ Deployment failed');
  process.exit(1);
}