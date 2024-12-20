# Rust-NPM Package Template

This repository provides a template for creating NPM packages with Rust, allowing you to leverage Rust's performance and safety features while distributing your package through NPM.

## 🚀 Features

-   Seamless integration between Rust and Node.js
-   Automated setup process
-   Version management system
-   Pre-configured project structure
-   NPM package distribution ready
-   Automatic configuration of Cargo.toml and package.json

## 📦 Prerequisites

-   Node.js (v20 or higher)
-   Rust (latest stable version)
-   Cargo (comes with Rust)
-   pnpm

## 🛠 Getting Started

1. Clone this repository:

```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Run the setup script:

```bash
npm run setup
```

During setup, you'll be prompted to provide:

-   Package name
-   Description
-   Author information
-   Repository URL
-   Keywords (default: cli, rust)
-   License (default: MIT)

> **Note**: You don't need to manually edit `Cargo.toml` or `package.json` files. The setup script automatically configures both files based on your inputs, ensuring perfect synchronization between Rust and Node.js configurations.

## 📝 Project Structure

```
.
├── src/           # Rust source code
├── scripts/       # JavaScript setup and utility scripts
├── config.json    # Project configuration
├── Cargo.toml     # Rust dependencies and configuration (auto-generated)
└── package.json   # NPM package configuration (auto-generated)
```

## 🔄 Version Management & Release Process

1. Bump the version of your package:

```bash
pnpm run bump
```

This will:

-   Increment the version in all necessary files
-   Update both Rust and NPM configurations
-   Create a git commit with the changes
-   Create a local git tag

2. Review the changes and when ready:

```bash
# Push the commits
git push

# Push the tag to trigger the release
git push origin v[version]
```

> **Note**: Pushing a tag will automatically trigger the GitHub Actions release workflow.

## 🚀 CI/CD with GitHub Actions

This template comes with automated workflows for building, testing, and publishing your package:

### Automated Builds

The build workflow is triggered on:

-   Every push to main branch
-   Pull requests to main branch
-   Manual trigger

The workflow:

1. Builds the Rust binary
2. Runs tests
3. Ensures code quality
4. Creates build artifacts

### Publishing Process

The publish workflow is triggered when:

-   A new tag matching the pattern `vx.x.x` is pushed
-   Example: `v1.0.0`, `v2.1.3`

The workflow automatically:

1. Builds the package for all supported platforms
2. Runs the test suite
3. Publishes to NPM with your configured credentials
4. Creates a GitHub release with built artifacts

### Setting Up CI/CD

1. Add your NPM token to GitHub repository secrets:

    - Go to your repository Settings > Secrets
    - Add a new secret named `NPM_TOKEN`
    - Paste your NPM access token

2. Enable GitHub Actions:
    - Go to your repository Settings > Actions
    - Ensure Actions are enabled for your repository

> **Note**: The build and publish processes are fully automated through GitHub Actions. Publishing is triggered by pushing a tag in the format `vx.x.x`.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
