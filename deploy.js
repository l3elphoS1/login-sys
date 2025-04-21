const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and log the output
function runCommand(command) {
    console.log(`Running: ${command}`);
    try {
        const output = execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`Error running command: ${command}`);
        console.error(error.message);
        return false;
    }
}

// Main deployment function
async function deploy() {
    console.log('Starting deployment process...');
    
    // 1. Build the CSS
    console.log('\n1. Building CSS...');
    if (!runCommand('npm run build:css')) {
        console.error('CSS build failed. Aborting deployment.');
        return;
    }
    
    // 2. Git add all changes
    console.log('\n2. Adding changes to git...');
    if (!runCommand('git add .')) {
        console.error('Git add failed. Aborting deployment.');
        return;
    }
    
    // 3. Git commit
    console.log('\n3. Committing changes...');
    if (!runCommand('git commit -m "Fix CORS and JSON parsing issues"')) {
        console.error('Git commit failed. Aborting deployment.');
        return;
    }
    
    // 4. Git push
    console.log('\n4. Pushing to remote repository...');
    if (!runCommand('git push')) {
        console.error('Git push failed. Aborting deployment.');
        return;
    }
    
    console.log('\nDeployment completed successfully!');
    console.log('Your changes will be deployed to Render automatically.');
    console.log('Please check the Render dashboard for deployment status.');
}

// Run the deployment
deploy(); 