#!/usr/bin/env node

/**
 * Script pour générer un secret aléatoire pour BETTER_AUTH_SECRET
 * Usage: node scripts/generate-auth-secret.js
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Secret généré pour BETTER_AUTH_SECRET:');
console.log('\n' + secret + '\n');
console.log('Ajoutez cette ligne dans votre fichier .env.local :');
console.log(`BETTER_AUTH_SECRET=${secret}\n`);
