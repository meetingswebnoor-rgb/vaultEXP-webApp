#!/usr/bin/env node
/**
 * Clean script — removes all build artifacts and node_modules
 */

const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

console.log('🧹 Cleaning VaultEXP monorepo...\n');

const targets = [
  'node_modules',
  'client/node_modules', 'client/.next', 'client/out',
  'server/node_modules',
  'shared/node_modules', 'shared/dist',
];

targets.forEach((target) => {
  const fullPath = path.join(root, target);
  try {
    execSync(`npx rimraf "${fullPath}"`, { stdio: 'inherit' });
    console.log(`✅ Removed: ${target}`);
  } catch {
    // ignore missing dirs
  }
});

console.log('\n✅ Clean complete!');
