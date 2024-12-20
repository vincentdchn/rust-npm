const fs = require('fs');
const path = require('path');

// Read config.json
const config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf8'),
);

// Update package.json
const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'),
);
packageJson.name = config.package_name;
packageJson.version = config.version;
packageJson.description = config.description;
packageJson.repository.url = `git+${config.repository}.git`;
packageJson.homepage = `${config.repository}#readme`;
packageJson.bugs.url = `${config.repository}/issues`;
packageJson.keywords = config.keywords;
packageJson.license = config.license;
fs.writeFileSync(
    path.resolve(__dirname, '../package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
);

// Update Cargo.toml
let cargoToml = fs.readFileSync(
    path.resolve(__dirname, '../Cargo.toml'),
    'utf8',
);
cargoToml = cargoToml.replace(
    /^name = ".*"/m,
    `name = "${config.package_name}"`,
);
cargoToml = cargoToml.replace(
    /^version = ".*"/m,
    `version = "${config.version}"`,
);
cargoToml = cargoToml.replace(
    /^description = ".*"/m,
    `description = "${config.description}"`,
);
cargoToml = cargoToml.replace(
    /^license = ".*"/m,
    `license = "${config.license}"`,
);
cargoToml = cargoToml.replace(
    /^authors = \[.*\]/m,
    `authors = ["${config.author}"]`,
);
cargoToml = cargoToml.replace(
    /^homepage = ".*"/m,
    `homepage = "${config.repository}"`,
);
cargoToml = cargoToml.replace(
    /^repository = ".*"/m,
    `repository = "${config.repository}"`,
);
fs.writeFileSync(path.resolve(__dirname, '../Cargo.toml'), cargoToml);

// Update npm/app/package.json
const npmPackageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../npm/app/package.json'), 'utf8'),
);
npmPackageJson.name = config.package_name;
npmPackageJson.version = config.version;
npmPackageJson.description = config.description;
npmPackageJson.repository.url = `git+${config.repository}`;
npmPackageJson.homepage = `${config.repository}#readme`;
npmPackageJson.bugs.url = config.repository;
npmPackageJson.keywords = config.keywords;
npmPackageJson.license = config.license;

// Update optional dependencies
const platforms = ['linux', 'darwin', 'windows'];
const archs = ['x64', 'arm64'];
npmPackageJson.optionalDependencies = {};
for (const platform of platforms) {
    for (const arch of archs) {
        const depName = `${config.package_name}-${platform}-${arch}`;
        npmPackageJson.optionalDependencies[depName] = config.version;
    }
}

fs.writeFileSync(
    path.resolve(__dirname, '../npm/app/package.json'),
    JSON.stringify(npmPackageJson, null, 2) + '\n',
);

console.log('Configuration updated successfully!');
