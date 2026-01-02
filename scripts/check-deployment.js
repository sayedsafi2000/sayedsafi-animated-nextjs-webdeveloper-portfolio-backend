/**
 * Script to verify all analytics files exist before deployment
 * Run: node scripts/check-deployment.js
 */

import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const requiredFiles = [
  // Routes
  'routes/track.js',
  'routes/leads.js',
  'routes/analytics.js',
  // Models
  'models/Visit.js',
  'models/Event.js',
  'models/Lead.js',
  // Utils
  'utils/geolocation.js',
  'utils/session.js',
  // Server
  'server.js'
];

console.log('🔍 Checking required files for analytics system...\n');

let allExist = true;
const missing = [];
const existing = [];

requiredFiles.forEach(file => {
  const fullPath = join(rootDir, file);
  if (existsSync(fullPath)) {
    existing.push(file);
    console.log(`✅ ${file}`);
  } else {
    missing.push(file);
    console.log(`❌ ${file} - MISSING!`);
    allExist = false;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Found: ${existing.length}/${requiredFiles.length}`);
console.log(`   ❌ Missing: ${missing.length}/${requiredFiles.length}`);

if (allExist) {
  console.log(`\n✅ All files exist! Ready for deployment.`);
  console.log(`\n📦 Next steps:`);
  console.log(`   1. Commit all changes: git add . && git commit -m "Add analytics system"`);
  console.log(`   2. Push to production: git push`);
  console.log(`   3. Restart backend server`);
  console.log(`   4. Test: curl https://backend.sayedsafi.me/api/track/test`);
  process.exit(0);
} else {
  console.log(`\n❌ Missing files detected! Please create them before deploying.`);
  process.exit(1);
}

