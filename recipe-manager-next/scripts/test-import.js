const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim().replace(/"/g, ''); // Sanitize
    }
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1);
}

if (!apiKey) {
    console.error('No GEMINI_API_KEY found');
    process.exit(1);
}

// Test Data
const prompt = "Extract recipe from this text: 1 cup flour, 2 eggs. Mix and bake.";
const model = "gemini-2.5-flash"; // The one currently in the code

const postData = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
        response_mime_type: "application/json"
    }
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

console.log(`Testing model: ${model}`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(postData);
req.end();
