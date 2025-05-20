#!/usr/bin/env node
// Script to directly create a fixed index.js file
const fs = require('fs');
const path = require('path');

console.log('Starting direct fix for index.js...');

// Path to the index.js file
const indexPath = path.join(__dirname, 'dist', 'index.js');
const backupPath = path.join(__dirname, 'dist', 'index.js.bak');

// Backup the original file if it exists
if (fs.existsSync(indexPath)) {
  try {
    fs.copyFileSync(indexPath, backupPath);
    console.log(`Backed up original index.js to ${backupPath}`);
  } catch (error) {
    console.error('Error backing up index.js:', error.message);
  }
}

// Create a fixed version of the rate limiter section
const fixedRateLimiterSection = `
// Configure rate limiting
const isProduction = process.env.NODE_ENV === 'production';
const maxRequests = isProduction ? 100 : 1000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxRequests, // limit each IP based on environment
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
`;

try {
  // Read the original file
  let content = '';
  if (fs.existsSync(indexPath)) {
    content = fs.readFileSync(indexPath, 'utf8');
  }

  // Find the rate limiter section and replace it
  if (content.includes('// Configure rate limiting')) {
    const startIndex = content.indexOf('// Configure rate limiting');
    const endIndex = content.indexOf('app.use(limiter);', startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
      // Extract the section to replace
      const sectionToReplace = content.substring(startIndex, endIndex);
      content = content.replace(sectionToReplace, fixedRateLimiterSection);
      console.log('Replaced rate limiter section');
    }
  }

  // Write the fixed content back to the file
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully applied direct fix to index.js');
} catch (error) {
  console.error('Error applying direct fix to index.js:', error.message);
  process.exit(1);
}
