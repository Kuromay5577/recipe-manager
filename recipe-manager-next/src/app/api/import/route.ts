import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { type, content } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server configuration error: Missing GEMINI_API_KEY' },
                { status: 500 }
            );
        }

        let prompt = '';
        let parts: any[] = [];

        if (type === 'text' || type === 'url') {
            let contentToAnalyze = content;

            if (type === 'url') {
                try {
                    const res = await fetch(content, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    if (res.ok) {
                        const html = await res.text();
                        contentToAnalyze = html.substring(0, 100000);
                    }
                } catch (error) {
                    console.error('Failed to fetch URL content:', error);
                }
            }

            prompt = `Extract recipe information from the following ${type === 'url' ? 'web page HTML' : 'text'}. 
      Return ONLY valid JSON with this structure:
      {
        "title": "string",
        "yield": "string",
        "cookingTime": number (minutes),
        "caloriesPerServing": number | null,
        "ingredients": ["string"],
        "instructions": ["string"],
        "categories": ["string"],
        "seasons": ["string"],
        "events": ["string"],
        "imageUrl": "string (URL of the main recipe image found on the page)",
        "notes": "string"
      }
      
      Content:
      ${contentToAnalyze}`;

            parts = [{ text: prompt }];

        } else if (type === 'image') {
            prompt = 'Extract recipe from this image. Return ONLY valid JSON matching the schema: { title, yield, cookingTime, caloriesPerServing, ingredients, instructions, categories, seasons, events, notes }';

            parts = [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: content
                    }
                }
            ];
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.replace(/"/g, '')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    response_mime_type: "application/json"
                }
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API Error:', error);
            return NextResponse.json({ error: 'Failed to analyze recipe' }, { status: 500 });
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        // Clean up JSON if needed (Gemini usually returns clean JSON with response_mime_type set, but safety first)
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const recipeData = JSON.parse(jsonStr);

        return NextResponse.json(recipeData);

    } catch (error) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
