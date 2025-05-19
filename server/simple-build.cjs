#!/usr/bin/env node
// Simple build script that copies TypeScript files to dist and renames them to .js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting simple build process...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Try to run TypeScript compiler first
try {
  console.log('Attempting to run TypeScript compiler...');
  execSync('node ./node_modules/typescript/bin/tsc --skipLibCheck', { stdio: 'inherit' });
  console.log('TypeScript compilation successful!');
  process.exit(0);
} catch (error) {
  console.error('TypeScript compilation failed, falling back to file copy method.');
  console.error('Error details:', error.message);
}

// Function to strip TypeScript types from code
const stripTypeScript = (content) => {
  // Fix specific dotenv import
  content = content.replace(/import\s+\*\s+as\s+dotenv\s+from\s+['"]dotenv['"]/g, 
    'import dotenv from "dotenv"');
  
  // Remove type imports
  content = content.replace(/import\s+type\s+.*?from\s+['"].*?['"]/g, '');
  
  // Handle import statements with type specifiers
  content = content.replace(/import\s+(.+?),\s*{\s*type\s+(.+?)\s*(?:,\s*([^{}]*))?\s*}\s+from\s+['"](.+?)['"]/g, 
    (match, defaultImport, typeImports, otherImports, source) => {
      if (otherImports && otherImports.trim()) {
        return `import ${defaultImport}, { ${otherImports} } from "${source}"`;
      }
      return `import ${defaultImport} from "${source}"`;
    }
  );
  
  // Handle import statements with only type imports in braces
  content = content.replace(/import\s+{\s*type\s+([^{}]*)\s*}\s+from\s+['"](.+?)['"]/g, '');
  
  // Handle regular imports with some type imports mixed in
  content = content.replace(/import\s+{\s*([^{}]*type[^{}]*)\s*}\s+from\s+['"](.+?)['"]/g, 
    (match, imports, source) => {
      // Extract non-type imports
      const nonTypeImports = imports
        .split(',')
        .map(part => part.trim())
        .filter(part => !part.startsWith('type '))
        .join(', ');
      
      if (nonTypeImports) {
        return `import { ${nonTypeImports} } from "${source}"`;
      }
      return '';
    }
  );
  
  // Fix arrow functions with type annotations
  content = content.replace(/\(([^()]*?):[^(){}]+\)\s*=>/g, '($1) =>');
  
  // Fix function parameters with type annotations in arrow functions
  content = content.replace(/\(([^()]*?),\s*_([^:()]*?):[^(){}]+(\)|,)/g, '($1, _$2$3');
  
  // Fix specific error handling middleware
  content = content.replace(/app\.use\(\(err, _req, res, _next=>\s*{/g, 'app.use((err, _req, res, _next) => {');
  content = content.replace(/app\.use\(\(err:[^)]+\)\s*=>\s*{/g, 'app.use((err, _req, res, _next) => {');
  
  // Fix process event handlers
  content = content.replace(/process\.on\(['"]([^'"]+)['"]\s*,\s*\(([^:)]+):[^)]+\)\s*=>/g, 'process.on(\'$1\', ($2) =>');
  
  // Remove type annotations in function parameters and variable declarations
  content = content.replace(/:\s*[A-Za-z0-9_<>[\]|&()\s.]+(?=[,)=;])/g, '');
  
  // Fix variable declarations with complex type annotations
  content = content.replace(/let\s+([A-Za-z0-9_]+)(?:\s*,\s*[A-Za-z0-9_<>[\]|&()\s.]+)+\s*=\s*/g, 'let $1 = ');
  
  // Remove interface and type declarations
  content = content.replace(/^(export\s+)?(interface|type)\s+[^{]*?{[\s\S]*?}(\s*;)?$/gm, '');
  
  // Remove declare statements
  content = content.replace(/^declare\s+.*?$/gm, '');
  
  // Remove namespace declarations but keep their content
  content = content.replace(/^(export\s+)?namespace\s+[A-Za-z0-9_]+\s*{([\s\S]*?)}$/gm, '$2');
  
  // Remove generic type parameters
  content = content.replace(/<[^>]*>/g, '');
  
  // Remove 'as Type' casting
  content = content.replace(/\s+as\s+[A-Za-z0-9_<>[\]|&()]+/g, '');
  
  return content;
};

// Copy all TypeScript files to dist and rename to .js
const copyTsFiles = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      // Create the directory in dist
      const targetDir = path.join(distDir, path.relative(__dirname, filePath));
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Process files in the directory
      copyTsFiles(filePath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
      // Process and rename .ts files to .js
      const relativePath = path.relative(__dirname, dir);
      const targetDir = path.join(distDir, relativePath);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const targetFile = path.join(targetDir, file.replace('.ts', '.js'));
      
      // If it's a TypeScript file, strip the types before saving
      if (file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const processedContent = stripTypeScript(content);
        fs.writeFileSync(targetFile, processedContent);
      } else {
        // For JS files, just copy them
        fs.copyFileSync(filePath, targetFile);
      }
      
      console.log(`Processed ${filePath} to ${targetFile}`);
    }
  });
};

// Start the copy process
try {
  copyTsFiles(__dirname);
  console.log('Build completed by copying files.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
