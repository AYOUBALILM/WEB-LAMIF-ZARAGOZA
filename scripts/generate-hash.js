#!/usr/bin/env node
// ========================================
// LA MIF — Password Hash Generator
// Run: node scripts/generate-hash.js YOUR_PASSWORD
// Outputs LAMIF_ADMIN_USERNAME, LAMIF_ADMIN_PASSWORD_HASH, LAMIF_ADMIN_SALT
// ========================================

const { pbkdf2Sync, randomBytes } = require('crypto');

const password = process.argv[2];
if (!password) {
    console.error('Usage: node scripts/generate-hash.js YOUR_PASSWORD');
    process.exit(1);
}

const salt = randomBytes(32).toString('hex');
const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

console.log('');
console.log('=== Set these as Netlify Environment Variables ===');
console.log('');
console.log('LAMIF_ADMIN_USERNAME=admin');
console.log('LAMIF_ADMIN_PASSWORD_HASH=' + hash);
console.log('LAMIF_ADMIN_SALT=' + salt);
console.log('');
console.log('=== Done ===');
