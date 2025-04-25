const path = require('path');
const fs = require('fs-extra');
const { processHtmlFiles } = require('./translate-site');
const { copyStaticFolders } = require('./copyStaticFolders');

const SOURCE_DIR = path.join(__dirname, 'site');  // original site folder
const TARGET_ROOT_FOLDER = "translated-sites"; // root folder for the translated site
const TARGET_LANG = 'ms'; // target language folder (e.g., 'ms' for Malay)

const TARGET_DIR = path.join(__dirname, TARGET_ROOT_FOLDER, TARGET_LANG);


(async () => {
    try {

      const logFilePath = path.join(TARGET_DIR, 'translated-files.json');

        let translatedFiles = [];
        // Load translation log if exists
        if (fs.existsSync(logFilePath)) {
            translatedFiles = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        }

        const options={
            translatedFiles,
            logFilePath
        }

      await processHtmlFiles(SOURCE_DIR, TARGET_DIR, TARGET_LANG, options);
      console.log('✅ Translation completed.');


      // Copy static folders (e.g., src, assets, img) from the original site to the translated site
      const sourceRoot = './site'; // or path to your English site
      const targetRoot = `${TARGET_ROOT_FOLDER}/${TARGET_LANG}`; // or whatever your translated folder is
      const foldersToCopy = ['src'];

      await copyStaticFolders(sourceRoot, targetRoot, foldersToCopy);


    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  })();