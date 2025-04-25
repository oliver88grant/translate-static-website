require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');

const axios = require('axios');


function getHtmlFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
  
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getHtmlFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  
    return files;
}

async function translateHtml(html, targetLang) {
    try {
      const response = await axios.post(
        `${process.env.OPENAI_URL}/v1/chat/completions`,
        {
          model: process.env.OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant that translates HTML websites. Only translate the human-readable content and preserve all tags and attributes.`,
            },
            {
              role: 'user',
              content: `Translate this HTML page into ${targetLang}:\n\n${html}`,
            },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
        const result = response.data.choices[0]?.message?.content?.trim();

        // Check for suspicious/unhelpful response
        if (
            !result ||
            result.toLowerCase().includes("sorry") ||
            result.toLowerCase().includes("i can't") ||
            result.toLowerCase().includes("as an ai") ||
            result.length < 30
        ) {

            const chalk = await import('chalk');
            console.log(chalk.default.red.bold(`[Translation Error] ${filePath}`));
            console.log(chalk.default.red(result));
            throw new Error(`Unhelpful response from OpenAI for file: ${filePath}`);
        }

        return result;

    } catch (err) {
      console.error('Translation failed:', err.response?.data || err.message);
      throw err;
    }
}

async function processHtmlFiles(srcDir, destDir, TARGET_LANG, options) {
    try {

        const { translatedFiles = [], logFilePath } = options;

        const entries = await fs.readdir(srcDir, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);

            const relativePath = path.relative(srcDir, entry.name);
            if (translatedFiles.includes(relativePath)) {
                console.log(`✅ Skipping already translated: ${relativePath}`);
                continue;
            }

            if (entry.isDirectory()) {
                await processHtmlFiles(srcPath, destPath, TARGET_LANG, options);
            } else if (entry.isFile() && path.extname(entry.name) === '.html') {
                const htmlContent = await fs.readFile(srcPath, 'utf-8');
                console.log(`Translating: ${srcPath}`);
                const translatedContent = await translateHtml(htmlContent, TARGET_LANG);
                await fs.ensureDir(path.dirname(destPath));
                await fs.writeFile(destPath, translatedContent, 'utf-8');
                console.log(`Saved: ${destPath}`);

                // Update log
                translatedFiles.push(relativePath);
                fs.writeFileSync(logFilePath, JSON.stringify(translatedFiles, null, 2));
            }
        }
    } catch (error) {
        console.error('Error processing HTML files:', error.message);
        throw error; // Rethrow the error to be handled by the caller
        
    }
  
}


module.exports = {
  translateHtml,
  processHtmlFiles,
};
