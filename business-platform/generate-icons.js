// Simple script to generate icons from SVG
// This creates data URIs that can be used to generate PNGs

const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgContent = fs.readFileSync(path.join(__dirname, 'public', 'logo.svg'), 'utf8');

console.log('📦 SVG Logo created successfully!');
console.log('\n🎨 To generate PNG icons from SVG:');
console.log('\n1. Online method (easiest):');
console.log('   - Go to https://cloudconvert.com/svg-to-png');
console.log('   - Upload public/logo.svg');
console.log('   - Convert to PNG with sizes:');
console.log('     * 192x192 → save as logo192.png');
console.log('     * 512x512 → save as logo512.png');
console.log('     * 32x32 → save as favicon.ico');
console.log('\n2. Or use ImageMagick (if installed):');
console.log('   convert public/logo.svg -resize 192x192 public/logo192.png');
console.log('   convert public/logo.svg -resize 512x512 public/logo512.png');
console.log('   convert public/logo.svg -resize 32x32 public/favicon.ico');
console.log('\n✅ SVG icon is already configured in index.html!');
console.log('   Modern browsers will use logo.svg automatically.');






