const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile(filePath, content) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
}

function updateCargoToml(version) {
    const cargoPath = path.join(__dirname, '..', 'Cargo.toml');
    let content = fs.readFileSync(cargoPath, 'utf8');
    content = content.replace(/version = "[^"]+"/g, `version = "${version}"`);
    fs.writeFileSync(cargoPath, content);
}

function bumpVersion(type = 'patch') {
    const rootPackage = readJsonFile(
        path.join(__dirname, '..', 'package.json'),
    );
    const npmAppPackage = readJsonFile(
        path.join(__dirname, '..', 'npm', 'app', 'package.json'),
    );

    const currentVersion = rootPackage.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    let newVersion;
    switch (type.toLowerCase()) {
        case 'major':
            newVersion = `${major + 1}.0.0`;
            break;
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`;
            break;
        case 'patch':
        default:
            newVersion = `${major}.${minor}.${patch + 1}`;
    }

    rootPackage.version = newVersion;
    npmAppPackage.version = newVersion;

    writeJsonFile(path.join(__dirname, '..', 'package.json'), rootPackage);
    writeJsonFile(
        path.join(__dirname, '..', 'npm', 'app', 'package.json'),
        npmAppPackage,
    );
    updateCargoToml(newVersion);

    console.log(`✨ Updated version to ${newVersion}`);

    // Exécuter cargo build
    try {
        console.log('🔨 Running cargo build...');
        execSync('cargo build', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
        });
        console.log('✅ Build completed successfully');
    } catch (error) {
        console.error('❌ Build error:', error.message);
        process.exit(1);
    }
}

const bumpType = process.argv[2] || 'patch';
bumpVersion(bumpType);
