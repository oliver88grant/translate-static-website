const fs = require('fs-extra');
const path = require('path');

/**
 * Copies specified folders from the original site root to the translated site root
 * @param {string} sourceRoot - The original root folder (e.g., '.')
 * @param {string} targetRoot - The translated root folder (e.g., 'es')
 * @param {string[]} foldersToCopy - List of folder names to copy (e.g., ['src', 'assets'])
 */
async function copyStaticFolders(sourceRoot, targetRoot, foldersToCopy) {
  for (const folder of foldersToCopy) {
    const sourcePath = path.join(sourceRoot, folder);
    const targetPath = path.join(targetRoot, folder);
    const chalk = await import('chalk');

    if (await fs.pathExists(sourcePath)) {
      try {
        await fs.copy(sourcePath, targetPath);
        console.log(chalk.default.green(`✔ Copied '${folder}' to '${targetRoot}/${folder}'`));
      } catch (err) {
        console.log(chalk.default.red(`✖ Failed to copy '${folder}': ${err.message}`));
      }
    } else {
      console.log(chalk.default.yellow(`⚠ Folder '${folder}' does not exist in ${sourceRoot}`));
    }
  }
}

module.exports = {
  copyStaticFolders,
};