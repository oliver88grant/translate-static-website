require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');

// --- Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_MODEL = 'gemini-pro'; // Use the appropriate model name

const GEMINI_MODEL = 'gemini-2.5-pro-exp-03-25'; // Use the appropriate model name

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

// --- Demo HTML Content ---
const sourceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Page</title>
    <style>
        body { font-family: sans-serif; }
        strong { color: blue; }
        code { background-color: #f0f0f0; padding: 2px 4px; }
    </style>
</head>
<body>
    <h1>Welcome to My Website!</h1>
    <p>This is a paragraph demonstrating HTML translation. It includes <strong>important text</strong> and some inline elements.</p>
    <div>
        <p>Here is another section. Let's see how it handles <a href="#links">links</a>.</p>
        <img src="image.png" alt="A sample image description">
    </div>
    <footer>
        <p>Contact us for more information.</p>
        <code>This code snippet should NOT be translated.</code>
    </footer>
    <script>
        // This script content should also be ignored.
        console.log('Hello from the script!');
    </script>
</body>
</html>
`;

const targetLanguage = 'Spanish'; // e.g., 'French', 'German', 'Spanish', 'Japanese'

// --- Prompt Engineering ---
// This is the most critical part for HTML translation with a general LLM
const createPrompt = (htmlContent, lang) => {
    return `
Translate the user-visible text content within the following HTML document from English to ${lang}.

**IMPORTANT INSTRUCTIONS:**
1.  **ONLY translate the text content** that a user would typically see rendered on the web page (text within tags like <p>, <h1>, <a>, <span>, <li>, table cells, etc., and attribute values like 'alt' or 'title' if they are user-facing).
2.  **DO NOT translate HTML tags** themselves (e.g., <p>, <div>, <strong>, <img>). Keep them exactly as they are.
3.  **DO NOT translate HTML attributes** (e.g., class, id, href, src, style). Keep them exactly as they are.
4.  **DO NOT translate content within <script>, <style>, or <code> tags.**
5.  **Preserve the original HTML structure** perfectly. The output MUST be valid HTML.
6.  Ensure correct handling of HTML entities (e.g., &amp;, &lt;, &gt;). If the source text has them, the translated text should use them appropriately if needed.

**HTML to translate:**
\`\`\`html
${htmlContent}
\`\`\`

**Translated HTML (${lang}):**
`; // Let Gemini complete starting from here
};

// --- Translation Function ---
async function translateHtmlWithGemini(html, targetLang) {
    if (!API_KEY) {
        console.error('Error: GEMINI_API_KEY not found in environment variables.');
        return null;
    }

    const prompt = createPrompt(html, targetLang);

    const requestData = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        // Optional: Add safety settings and generation config if needed
        // safetySettings: [ ... ],
        // generationConfig: { ... }
    };

    console.log(`--- Sending request to Gemini (${GEMINI_MODEL}) ---`);
    try {
        const response = await axios.post(API_URL, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('--- Received response from Gemini ---');

        // Defensive checking of the response structure
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            const candidate = response.data.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                let translatedHtml = candidate.content.parts[0].text;

                // Sometimes the model might wrap the output in ```html ... ```, try to remove it
                translatedHtml = translatedHtml.trim();
                if (translatedHtml.startsWith('```html')) {
                    translatedHtml = translatedHtml.substring(7);
                }
                if (translatedHtml.endsWith('```')) {
                    translatedHtml = translatedHtml.substring(0, translatedHtml.length - 3);
                }
                 return translatedHtml.trim(); // Return the extracted text
            } else {
                 // Log finish reason if available
                 if (candidate.finishReason) {
                     console.error(`Translation failed or was blocked. Finish Reason: ${candidate.finishReason}`);
                     if(candidate.safetyRatings) console.error("Safety Ratings:", JSON.stringify(candidate.safetyRatings, null, 2));
                 } else {
                    console.error('Error: Gemini response structure unexpected (missing content or parts).');
                    console.error("Full Candidate:", JSON.stringify(candidate, null, 2));
                 }
                return null;
            }
        } else {
            console.error('Error: Gemini response structure unexpected (missing candidates).');
             console.error("Full Response:", JSON.stringify(response.data, null, 2));
            return null;
        }

    } catch (error) {
        console.error('--- Error calling Gemini API ---');
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error Request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error Message:', error.message);
        }
        return null;
    }
}

// --- Run the translation ---
(async () => {
    console.log('--- Original HTML ---');
    console.log(sourceHtml);
    console.log('\n--- Translating to', targetLanguage, '---');

    const translatedHtmlResult = await translateHtmlWithGemini(sourceHtml, targetLanguage);

    if (translatedHtmlResult) {
        console.log('\n--- Translated HTML ---');
        console.log(translatedHtmlResult);
    } else {
        console.log('\n--- Translation failed ---');
    }
})();