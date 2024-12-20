import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import * as tc from '@actions/tool-cache';
import * as fsp from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

async function run(): Promise<void> {
    try {
        // Get inputs
        const version = core.getInput('version');
        const token = core.getInput('github-token');
        let additionalArgs = core.getInput('args');

        // Initialize octokit
        const octokit = github.getOctokit(token);

        // Determine release to download
        let releaseTag = version;
        if (version === 'latest') {
            const latestRelease = await octokit.rest.repos.getLatestRelease({
                owner: 'vincentdchn',
                repo: 'rust-npm',
            });
            releaseTag = latestRelease.data.tag_name;
        }

        // Get platform and architecture specific details
        const platform = os.platform();
        const arch = os.arch();

        // Map platform and architecture to release asset names
        const platformTargets: Record<string, Record<string, string>> = {
            darwin: {
                arm64: 'aarch64-apple-darwin',
                x64: 'x86_64-apple-darwin',
            },
            win32: {
                arm64: 'aarch64-pc-windows-msvc',
                x64: 'x86_64-pc-windows-msvc',
            },
            linux: {
                arm64: 'aarch64-unknown-linux-gnu',
                x64: 'x86_64-unknown-linux-gnu',
            },
        };

        const platformTarget = platformTargets[platform]?.[arch];
        if (!platformTarget) {
            throw new Error(
                `Unsupported platform (${platform}) or architecture (${arch})`,
            );
        }

        // Construct asset name
        const assetName = `rust-npm-${platformTarget}.zip`;

        // Get release assets
        const release = await octokit.rest.repos.getReleaseByTag({
            owner: 'vincentdchn',
            repo: 'rust-npm',
            tag: releaseTag,
        });

        const asset = release.data.assets.find((a) => a.name === assetName);
        if (!asset) {
            throw new Error(
                `Could not find asset ${assetName} in release ${releaseTag}`,
            );
        }

        // Download the zip file
        core.info(`Downloading Rust NPM ${releaseTag} for ${platformTarget}`);
        const downloadPath = await tc.downloadTool(asset.browser_download_url);

        // Extract the zip file
        core.info('Extracting Rust NPM binary...');
        const extractedPath = await tc.extractZip(downloadPath);

        // Determine binary name based on platform
        const binaryName = platform === 'win32' ? 'rust-npm.exe' : 'rust-npm';
        const binaryPath = path.join(extractedPath, binaryName);

        // Make binary executable on Unix systems
        if (platform !== 'win32') {
            await fsp.chmod(binaryPath, '777');
        }

        // Add to PATH
        core.addPath(extractedPath);

        // Set output
        core.setOutput('rust-npm-path', binaryPath);
        core.info('Rust NPM has been installed successfully');

        // Prepare arguments
        if (!additionalArgs) {
            additionalArgs = (await getArgsFromPackageJson()) || '';
        }
        const args = additionalArgs.split(' ').filter((arg) => arg !== '');

        // Configure output options to preserve colors
        const options: exec.ExecOptions = {
            ignoreReturnCode: true, // We'll handle the return code ourselves
            env: {
                ...process.env,
                FORCE_COLOR: '3', // Force color output
            },
        };

        // Execute Rust NPM
        const exitCode = await exec.exec(binaryPath, args, options);

        // Handle exit code
        if (exitCode !== 0) {
            throw new Error(
                `Rust NPM execution failed with exit code ${exitCode}`,
            );
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed('An unexpected error occurred');
        }
    }
}

async function getArgsFromPackageJson() {
    try {
        const packageJsonFile = await fsp.readFile(
            path.resolve(process.cwd(), 'package.json'),
        );
        const packageJson = JSON.parse(packageJsonFile.toString());

        // Extract args from the `rust-npm` script in package.json, starting after
        // `rust-npm ` and ending before the next `&&` or end of line
        const regexResult = /rust-npm\s([^&&]*)/g.exec(
            packageJson.scripts['rust-npm'],
        );
        if (regexResult && regexResult.length > 1) {
            const args = regexResult[1];
            core.info(
                `Using the arguments "${args}" from the root package.json`,
            );
            return args;
        }
    } catch {
        core.info('Failed to extract args from package.json');
    }
}

run();
