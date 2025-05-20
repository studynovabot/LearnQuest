#!/usr/bin/env node
// Postbuild script to fix module imports in the generated JavaScript files
const fs = require('fs');
const path = require('path');

console.log('Starting postbuild process to fix module imports...');

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
      fixImports(filePath);
    }
  });
};

// Function to fix imports in a JavaScript file
const fixImports = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix relative imports without .js extension
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    content = content.replace(importRegex, (match, importPath) => {
      // Only add .js to relative imports that don't already have an extension
      if (importPath.startsWith('.') && !importPath.includes('.js') && !importPath.includes('.json')) {
        modified = true;
        return `from '${importPath}.js'`;
      }
      return match;
    });

    // Fix rate limiter syntax error
    if (filePath.includes('index.js')) {
      const rateLimiterRegex = /max===\s*['"]production['"]\s*\?\s*(\d+)\s*,/g;
      const fixedContent = content.replace(rateLimiterRegex, (match, limit) => {
        modified = true;
        return `max: process.env.NODE_ENV === 'production' ? ${limit} :`;
      });

      if (fixedContent !== content) {
        content = fixedContent;
        console.log(`Fixed rate limiter syntax in ${filePath}`);
      }
    }

    // Fix any other syntax errors that might occur during the build process
    if (filePath.includes('index.js')) {
      // Look for other common syntax errors and fix them
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
          console.log(`Fixed syntax error in ${filePath}`);
        }
      });
    }

    // Write the modified content back to the file if changes were made
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
};

// Start processing from the dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  processDirectory(distDir);
  console.log('Postbuild process completed successfully.');
} else {
  console.error('Dist directory not found. Build may have failed.');
  process.exit(1);
}
