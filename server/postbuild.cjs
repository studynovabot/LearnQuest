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
    
    // Write the modified content back to the file if changes were made
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in ${filePath}`);
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
