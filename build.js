const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Run Tailwind CSS build
console.log('Building CSS...');
try {
    // Use npm to run the build:css script
    execSync('npm run build:css', { stdio: 'inherit' });
    console.log('CSS build complete!');
} catch (error) {
    console.error('Error building CSS:', error.message);
    console.error('Build failed. Please check your Tailwind CSS installation.');
    process.exit(1);
} 