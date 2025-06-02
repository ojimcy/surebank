/**
 * Enhanced cleanup script for node_modules
 * Removes test files, documentation, examples, and other unnecessary files
 * to reduce the Lambda package size
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clean up
const cleanupDirs = [
  'node_modules/**/test',
  'node_modules/**/tests',
  'node_modules/**/example',
  'node_modules/**/examples',
  'node_modules/**/docs',
  'node_modules/**/.github',
  'node_modules/**/coverage',
  'node_modules/**/__tests__',
  'node_modules/**/__mocks__',
  'node_modules/**/benchmark',
  'node_modules/**/fixtures',
];

// File patterns to remove
const cleanupFiles = [
  'node_modules/**/*.md',
  'node_modules/**/*.ts',
  'node_modules/**/*.map',
  'node_modules/**/*.min.js.map',
  'node_modules/**/LICENSE',
  'node_modules/**/license',
  'node_modules/**/CHANGELOG*',
  'node_modules/**/AUTHORS*',
  'node_modules/**/.npmignore',
  'node_modules/**/.travis.yml',
  'node_modules/**/.eslintrc*',
  'node_modules/**/.prettierrc*',
  'node_modules/**/tsconfig.json',
  'node_modules/**/jest.config.js',
];

// Specific large packages to optimize further
const heavyPackages = ['@aws-sdk', 'ethers', 'mongoose', 'swagger-ui-express', 'aws-sdk'];

// AWS SDK modules to keep (only needed services)
const awsSdkModulesToKeep = ['client-s3', 'client-secrets-manager', 'client-ses', 's3-request-presigner'];

console.log('Starting enhanced dependency cleanup...');
console.log(`Initial node_modules size: ${getDirectorySize('node_modules')}`);

// Remove directories
cleanupDirs.forEach((dir) => {
  try {
    console.log(`Removing directories matching: ${dir}`);
    execSync(`find . -type d -path "${dir}" -exec rm -rf {} \\; 2>/dev/null || true`, { stdio: 'inherit' });
  } catch (error) {
    // Ignore errors
  }
});

// Remove files
cleanupFiles.forEach((pattern) => {
  try {
    console.log(`Removing files matching: ${pattern}`);
    execSync(`find . -type f -path "${pattern}" -delete 2>/dev/null || true`, { stdio: 'inherit' });
  } catch (error) {
    // Ignore errors
  }
});

// Special handling for AWS SDK (only keep needed services)
const awsSdkPath = path.join('node_modules', '@aws-sdk');
if (fs.existsSync(awsSdkPath)) {
  console.log('Optimizing @aws-sdk...');

  try {
    const dirs = fs
      .readdirSync(awsSdkPath)
      .filter((dir) => !awsSdkModulesToKeep.includes(dir) && fs.statSync(path.join(awsSdkPath, dir)).isDirectory());

    dirs.forEach((dir) => {
      const dirPath = path.join(awsSdkPath, dir);
      console.log(`Removing unnecessary AWS SDK module: ${dir}`);
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
      } catch (err) {
        console.error(`Error removing ${dirPath}:`, err.message);
      }
    });
  } catch (err) {
    console.error('Error processing AWS SDK directory:', err.message);
  }
}

console.log(`Final node_modules size: ${getDirectorySize('node_modules')}`);
console.log('Dependency cleanup completed!');

// Helper function to get directory size
function getDirectorySize(dirPath) {
  try {
    const output = execSync(`du -sh ${dirPath}`, { encoding: 'utf8' });
    return output.trim().split('\t')[0];
  } catch (error) {
    return 'unknown';
  }
}
