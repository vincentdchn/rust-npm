import { writeFileSync } from 'fs';
import { resolve as _resolve } from 'path';
import { createInterface } from 'readline';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

async function setup() {
    console.log('🚀 Setting up your new Rust-NPM package\n');

    const config = {
        package_name: '',
        version: '1.0.0',
        description: '',
        author: '',
        repository: '',
        license: 'MIT',
        keywords: ['cli', 'rust'],
    };

    // Collect information
    config.package_name = await question('Package name: ');
    config.description = await question('Description: ');
    config.author = await question('Author: ');
    config.repository = await question('Repository URL (without .git): ');

    const keywords = await question('Keywords (comma separated) [cli,rust]: ');
    if (keywords.trim()) {
        config.keywords = keywords.split(',').map((k) => k.trim());
    }

    const license = await question('License [MIT]: ');
    if (license.trim()) {
        config.license = license;
    }

    // Save configuration
    writeFileSync(
        _resolve(__dirname, '../config.json'),
        JSON.stringify(config, null, 2) + '\n',
    );

    // Update all configuration files
    require('./update-config');

    console.log('\n✨ Setup complete! Your project is ready.');
    console.log(`\nNext steps:`);
    console.log(`1. Check the generated configuration files`);
    console.log(`2. Run \`cargo build\` to compile the Rust project`);
    console.log(`3. Use \`pnpm run bump\` to increment version when needed`);

    rl.close();
}

setup().catch(console.error);
