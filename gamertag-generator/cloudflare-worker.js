/**
 * Cloudflare Worker - AI Gamertag Generator API
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to workers.cloudflare.com → Create Worker
 * 2. Paste this entire code
 * 3. Go to Settings → Variables → Add:
 *    - Name: GITHUB_TOKEN
 *    - Value: your GitHub token
 *    - Click "Encrypt"
 * 4. Deploy
 * 5. Copy your Worker URL and paste it in script.js
 */

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        // Only allow POST
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            const { style, keywords, platform } = await request.json();

            // Build prompt
            const styleDescriptions = {
                cool: 'cool, badass, and intimidating',
                funny: 'funny, silly, and humorous',
                dark: 'dark, edgy, and mysterious',
                cute: 'cute, aesthetic, and soft',
                pro: 'professional, competitive, and short'
            };

            const styleDesc = styleDescriptions[style] || 'cool';
            const keywordPart = keywords ? ` incorporating the word "${keywords}"` : '';
            const platformPart = platform !== 'any' ? ` suitable for ${platform}` : '';

            const prompt = `Generate 5 unique ${styleDesc} gaming usernames/gamertags${keywordPart}${platformPart}. 
Rules:
- Each name should be 4-16 characters
- Use letters, numbers, underscores only
- Make them memorable and unique
- No spaces
- Just output the names, one per line, no numbering or explanations`;

            // Call GitHub AI API
            const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.Github_Token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a creative gaming name generator. Generate only the names, nothing else.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 200,
                    temperature: 0.9
                })
            });

            const data = await response.json();

            return new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }
    }
};
