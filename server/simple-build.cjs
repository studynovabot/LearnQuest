#!/usr/bin/env node
// Simple build script that uses TypeScript compiler
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting simple build process...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Try to run TypeScript compiler
try {
  console.log('Attempting to run TypeScript compiler...');

  // First, try to install typescript if it's not available
  try {
    execSync('npm install typescript --save-dev', { stdio: 'pipe' });
  } catch (e) {
    // Ignore if already installed
  }

  // Try different paths for tsc
  const tscCommands = [
    'npx tsc',
    './node_modules/.bin/tsc',
    'node ./node_modules/typescript/bin/tsc'
  ];

  let tscSuccess = false;
  for (const tscCommand of tscCommands) {
    try {
      console.log(`Trying: ${tscCommand}`);
      execSync(tscCommand, { stdio: 'inherit' });
      console.log('TypeScript compilation successful!');
      tscSuccess = true;
      break;
    } catch (err) {
      console.log(`Failed with ${tscCommand}, trying next...`);
    }
  }

  if (tscSuccess) {
    console.log('Build completed successfully with TypeScript compiler.');
    process.exit(0);
  } else {
    throw new Error('All TypeScript compiler attempts failed');
  }
} catch (error) {
  console.error('TypeScript compilation failed completely.');
  console.error('Error details:', error.message);
  process.exit(1);
}

// This script now only uses the TypeScript compiler
// No fallback copying needed since we ensure TypeScript is available
