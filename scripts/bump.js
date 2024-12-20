import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function getCurrentVersion() {
    const configPath = resolve(__dirname, '../config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    return config.version;
}

function bumpVersion() {
    try {
        // Run npm version patch to increment version
        execSync('pnpm version patch --no-git-tag-version');

        // Get the new version from package.json
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        const newVersion = packageJson.version;

        // Update config.json
        const configPath = resolve(__dirname, '../config.json');
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        config.version = newVersion;
        writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

        // Update all configuration files
        require('./update-config');

        // Git operations (local only)
        execSync('git add .');
        execSync(`git commit -m "chore: bump version to ${newVersion}"`);
        execSync(`git tag v${newVersion}`);

        console.log(`✨ Successfully bumped version to ${newVersion}`);
        console.log('\nNext steps:');
        console.log('1. Review the changes');
        console.log('2. Push the changes:');
        console.log('   git push');
        console.log('3. Push the tag to trigger the release:');
        console.log(`   git push origin v${newVersion}`);
        console.log(
            '\n🚀 Once pushed, GitHub Actions will handle the release process',
        );
    } catch (error) {
        console.error('❌ Error during version bump:', error.message);
        process.exit(1);
    }
}

bumpVersion();
