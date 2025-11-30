const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const RECIPES_FILE = path.join(process.cwd(), 'data/recipes.json');
const ENV_FILE = path.join(process.cwd(), '.env.local');
const MODEL = 'gemini-2.5-flash';

// Helper to read env
function getApiKey() {
    try {
        const content = fs.readFileSync(ENV_FILE, 'utf8');
        const match = content.match(/GEMINI_API_KEY=(.*)/);
        return match ? match[1].trim().replace(/"/g, '') : null;
    } catch (e) {
        return null;
    }
}

// Helper to fetch URL content
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });
}

// Helper to call Gemini
function getImageUrlFromGemini(apiKey, html, title) {
    return new Promise((resolve, reject) => {
        const prompt = `Analyze the following HTML content for the recipe titled "${title}". 
    Find the URL of the MAIN recipe image. 
    Return ONLY a JSON object with a single key "imageUrl". 
    If no suitable image is found, return null for the value.
    
    HTML Content (truncated):
    ${html.substring(0, 50000)}`; // Limit context

        const postData = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
        });

        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) return reject(json.error);

                    const text = json.candidates[0].content.parts[0].text;
                    const result = JSON.parse(text);
                    resolve(result.imageUrl);
                } catch (e) {
                    resolve(null); // Fail gracefully
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function main() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('❌ No GEMINI_API_KEY found in .env.local');
        process.exit(1);
    }

    console.log('📖 Reading recipes...');
    const data = JSON.parse(fs.readFileSync(RECIPES_FILE, 'utf8'));
    let updatedCount = 0;

    for (const recipe of data.recipes) {
        if (recipe.sourceUrl && !recipe.imageUrl) {
            console.log(`\n🔍 Processing: ${recipe.title}`);
            console.log(`   Source: ${recipe.sourceUrl}`);

            try {
                console.log('   Fetching page content...');
                const html = await fetchUrl(recipe.sourceUrl);

                console.log('   Asking Gemini for image...');
                const imageUrl = await getImageUrlFromGemini(apiKey, html, recipe.title);

                if (imageUrl) {
                    console.log(`   ✅ Found image: ${imageUrl}`);
                    recipe.imageUrl = imageUrl;
                    updatedCount++;
                } else {
                    console.log('   ⚠️ No image found by AI.');
                }
            } catch (e) {
                console.error(`   ❌ Error: ${e.message}`);
            }

            // Small delay to avoid rate limits
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    if (updatedCount > 0) {
        console.log(`\n💾 Saving ${updatedCount} updated recipes...`);
        fs.writeFileSync(RECIPES_FILE, JSON.stringify(data, null, 2));
        console.log('✨ Done!');
    } else {
        console.log('\n✨ No recipes needed updating (or none had sourceUrl).');
    }
}

main();
