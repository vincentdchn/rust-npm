const fs = require('fs');
const path = require('path');

// Lire la version actuelle depuis config.json
const configPath = path.resolve(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Incrémenter la version
const version = config.version.split('.');
version[2] = parseInt(version[2]) + 1;
const newVersion = version.join('.');

// Mettre à jour config.json
config.version = newVersion;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

// Mettre à jour tous les fichiers de configuration
require('./update-config');

console.log(`Version mise à jour vers ${newVersion}`);
