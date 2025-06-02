// Node.js script to create favicon files
// Run with: node create-favicons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

function drawFavicon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    
    // Draw background circle
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center, center, center - 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw graduation cap
    ctx.fillStyle = '#ffffff';
    
    // Cap base (ellipse)
    ctx.beginPath();
    ctx.ellipse(center, center - size * 0.1, size * 0.25, size * 0.08, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Cap top (trapezoid)
    ctx.beginPath();
    ctx.moveTo(center - size * 0.25, center - size * 0.25);
    ctx.lineTo(center + size * 0.25, center - size * 0.25);
    ctx.lineTo(center + size * 0.19, center - size * 0.44);
    ctx.lineTo(center - size * 0.19, center - size * 0.44);
    ctx.closePath();
    ctx.fill();
    
    // Tassel
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = Math.max(1, size * 0.03);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(center + size * 0.19, center - size * 0.44);
    ctx.lineTo(center + size * 0.31, center - size * 0.56);
    ctx.stroke();
    
    // Tassel end
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(center + size * 0.31, center - size * 0.56, size * 0.03, 0, 2 * Math.PI);
    ctx.fill();
    
    // Book symbol
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const bookWidth = size * 0.19;
    const bookHeight = size * 0.13;
    const bookX = center - bookWidth / 2;
    const bookY = center + size * 0.06;
    
    // Draw rectangle for book
    ctx.fillRect(bookX, bookY, bookWidth, bookHeight);
    
    // Book lines
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = Math.max(0.5, size * 0.01);
    const lineSpacing = bookHeight / 4;
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(bookX + size * 0.02, bookY + lineSpacing * i);
        ctx.lineTo(bookX + bookWidth - size * 0.02, bookY + lineSpacing * i);
        ctx.stroke();
    }
    
    return canvas;
}

// Generate favicon files
const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 96, name: 'favicon-96x96.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 152, name: 'apple-touch-icon-152x152.png' },
    { size: 144, name: 'apple-touch-icon-144x144.png' },
    { size: 120, name: 'apple-touch-icon-120x120.png' },
    { size: 114, name: 'apple-touch-icon-114x114.png' },
    { size: 76, name: 'apple-touch-icon-76x76.png' },
    { size: 72, name: 'apple-touch-icon-72x72.png' },
    { size: 60, name: 'apple-touch-icon-60x60.png' },
    { size: 57, name: 'apple-touch-icon-57x57.png' },
    { size: 70, name: 'mstile-70x70.png' },
    { size: 150, name: 'mstile-150x150.png' },
    { size: 310, name: 'mstile-310x310.png' }
];

console.log('Generating favicon files...');

sizes.forEach(({ size, name }) => {
    try {
        const canvas = drawFavicon(size);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(name, buffer);
        console.log(`✓ Created ${name}`);
    } catch (error) {
        console.error(`✗ Failed to create ${name}:`, error.message);
    }
});

console.log('Favicon generation complete!');
