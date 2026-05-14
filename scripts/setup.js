#!/usr/bin/env node
/**
 * Project setup script
 * Run: node scripts/setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 Setting up VaultEXP monorepo...\n');

// Check Node version
const nodeVersion = process.versions.node;
const [major] = nodeVersion.split('.').map(Number);
if (major < 18) {
  console.error('❌ Node.js 18+ is required. Current:', nodeVersion);
  process.exit(1);
}

// Copy .env if not exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created from .env.example');
}

// Install dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

console.log('\n✅ Setup complete!');
console.log('\nNext steps:');
console.log('  1. Update .env with your actual credentials');
console.log('  2. Run: npm run dev');
console.log('  3. Open: http://localhost:3000\n');
