#!/usr/bin/env node
// Script to fix TypeScript namespace declarations in compiled JavaScript
const fs = require('fs');
const path = require('path');

console.log('Starting namespace fix for compiled JavaScript...');

// Function to fix namespace declarations in a JavaScript file
const fixNamespaces = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove TypeScript namespace declarations that shouldn't be in JS
    const namespacePatterns = [
      /declare\s+global\s*\{[\s\S]*?\}/g,
      /namespace\s+\w+\s*\{[\s\S]*?\}/g,
      /interface\s+\w+\s*\{[\s\S]*?\}/g,
      /declare\s+namespace\s+\w+\s*\{[\s\S]*?\}/g
    ];
    
    namespacePatterns.forEach(pattern => {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`Removed namespace declaration from ${filePath}`);
      }
    });
    
    // Remove any remaining TypeScript-specific syntax
    const tsPatterns = [
      /export\s*\{\s*\}\s*;/g, // Remove empty exports
      /^\s*declare\s+.*$/gm,   // Remove declare statements
      /^\s*interface\s+.*$/gm, // Remove interface declarations
      /^\s*namespace\s+.*$/gm  // Remove namespace declarations
    ];
    
    tsPatterns.forEach(pattern => {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Clean up any double newlines created by removals
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    // Write the modified content back to the file if changes were made
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed namespace issues in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
};

// Function to recursively process all JavaScript files in a directory
const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Process files in subdirectories
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      // Process JavaScript files
      fixNamespaces(filePath);
    }
  });
};

// Start processing from the dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  processDirectory(distDir);
  console.log('Namespace fix process completed successfully.');
} else {
  console.error('Dist directory not found. Build may have failed.');
  process.exit(1);
}
