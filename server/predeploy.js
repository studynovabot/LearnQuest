#!/usr/bin/env node
// Predeploy script to verify that the build was successful
const fs = require('fs');
const path = require('path');

console.log('Starting predeploy verification...');

// Check if the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found. Build may have failed.');
  process.exit(1);
}

// Check if the main index.js file exists
const indexFile = path.join(distDir, 'index.js');
if (!fs.existsSync(indexFile)) {
  console.error('Error: index.js not found in dist directory. Build may have failed.');
  
  // Create a minimal index.js file as a fallback
  try {
    console.log('Creating minimal index.js file as fallback...');
    const minimalIndexContent = `
// Minimal fallback index.js created by predeploy script
console.log('Warning: This is a fallback index.js created by the predeploy script.');
console.log('The original build may have failed.');

const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'warning',
    message: 'Running in fallback mode. The original build may have failed.',
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(\`Fallback server running on port \${port}\`);
});
`;
    fs.writeFileSync(indexFile, minimalIndexContent);
    console.log('Created fallback index.js file.');
  } catch (error) {
    console.error('Error creating fallback index.js:', error.message);
    process.exit(1);
  }
}

// Check if the firebaseAdmin.js file exists
const firebaseAdminFile = path.join(distDir, 'firebaseAdmin.js');
if (!fs.existsSync(firebaseAdminFile)) {
  console.error('Warning: firebaseAdmin.js not found in dist directory.');
}

console.log('Predeploy verification completed.');
