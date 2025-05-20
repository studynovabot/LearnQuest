#!/usr/bin/env node
// Script to manually fix the index.js file in case the postbuild script doesn't catch all issues
const fs = require('fs');
const path = require('path');

console.log('Starting manual fix for index.js...');

// Path to the index.js file
const indexPath = path.join(__dirname, 'dist', 'index.js');

// Check if the file exists
if (!fs.existsSync(indexPath)) {
  console.error('index.js file not found at:', indexPath);
  process.exit(1);
}

try {
  // Read the file content
  let content = fs.readFileSync(indexPath, 'utf8');
  let modified = false;

  // DIRECT FIX: Replace the entire file with a known good version
  // This is a drastic measure but ensures we fix all syntax issues

  // First, check for the specific maxRequests syntax error
  if (content.includes("const maxRequests = isProduction ? 100 ;")) {
    console.log("Found the maxRequests syntax error, fixing it...");
    content = content.replace(
      "const maxRequests = isProduction ? 100 ;",
      "const maxRequests = isProduction ? 100 : 1000;"
    );
    modified = true;
  }

  // Fix any ternary operator that's missing the "else" part
  const incompleteConditionals = [
    { regex: /(\w+)\s*=\s*(\w+)\s*\?\s*(\d+)\s*;/g, replacement: '$1 = $2 ? $3 : 1000;' },
    { regex: /(\w+)\s*=\s*(\w+)\s*\?\s*(\d+)\s*,/g, replacement: '$1 = $2 ? $3 : 1000,' },
  ];

  incompleteConditionals.forEach(({ regex, replacement }) => {
    const newContent = content.replace(regex, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      console.log("Fixed incomplete conditional expression");
    }
  });

  // Fix the rate limiter syntax error
  const rateLimiterRegex = /max===\s*['"]production['"]\s*\?\s*(\d+)\s*,/g;
  content = content.replace(rateLimiterRegex, (match, limit) => {
    modified = true;
    return `max: process.env.NODE_ENV === 'production' ? ${limit} : 1000,`;
  });

  // Fix any other syntax errors
  const syntaxErrors = [
    { regex: /(\w+)===\s*['"](\w+)['"]/g, replacement: '$1 === \'$2\'' },
    { regex: /,\s*}/g, replacement: '}' }, // Remove trailing commas in objects
    { regex: /,\s*\]/g, replacement: ']' }, // Remove trailing commas in arrays
  ];

  syntaxErrors.forEach(({ regex, replacement }) => {
    const newContent = content.replace(regex, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      console.log("Fixed general syntax error");
    }
  });

  // Create a completely new rate limiter configuration section
  // This is a more aggressive approach to ensure it's correct
  const rateLimiterSection = `
// Configure rate limiting
const isProduction = process.env.NODE_ENV === 'production';
const maxRequests = isProduction ? 100 : 1000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxRequests, // limit each IP based on environment
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});`;

  // Try to find and replace the rate limiter section
  if (content.includes("// Configure rate limiting")) {
    const startIndex = content.indexOf("// Configure rate limiting");
    const endIndex = content.indexOf("app.use(limiter);", startIndex);

    if (startIndex !== -1 && endIndex !== -1) {
      // Extract the section to replace
      const sectionToReplace = content.substring(startIndex, endIndex);
      content = content.replace(sectionToReplace, rateLimiterSection + "\n\n");
      modified = true;
      console.log("Replaced entire rate limiter section");
    }
  }

  // Write the modified content back to the file if changes were made
  if (modified) {
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Successfully fixed index.js');
  } else {
    console.log('No issues found in index.js');
  }
} catch (error) {
  console.error('Error fixing index.js:', error.message);
  process.exit(1);
}
