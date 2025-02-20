const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read dfx.json
const dfxJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../dfx.json'), 'utf8'));

// Get all canister names
const canisterNames = Object.keys(dfxJson.canisters);

// Get network from args or default to local
const network = process.argv[2] || 'local';

// Generate environment variables
let envContent = `VITE_DFX_NETWORK=${network}\n`;

// For each canister, get its ID
canisterNames.forEach(canisterName => {
  try {
    const canisterId = execSync(`dfx canister --network ${network} id ${canisterName}`, {
      encoding: 'utf8'
    }).trim();
    
    // Convert to uppercase for env var name
    const envVarName = `VITE_${canisterName.toUpperCase()}_CANISTER_ID`;
    envContent += `${envVarName}=${canisterId}\n`;
  } catch (error) {
    console.error(`Failed to get canister ID for ${canisterName}:`, error.message);
  }
});

// Write to .env file in frontend directory
const envPath = path.join(__dirname, '../src/frontend/.env');
fs.writeFileSync(envPath, envContent);

console.log('Environment variables generated successfully at:', envPath);
console.log('Contents:');
console.log(envContent);
