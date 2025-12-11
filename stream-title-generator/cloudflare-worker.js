/**
 * Cloudflare Worker - AI Stream Title Generator API
 * With Model Rotation to avoid rate limits
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to workers.cloudflare.com → Create Worker
 * 2. Paste this entire code
 * 3. Go to Settings → Variables → Add:
 *    - Name: Github_Token
 *    - Value: your GitHub token
 *    - Click "Encrypt"
 * 4. Create KV Namespace:
 *    - Go to Workers & Pages → KV
 *    - Create namespace: "STREAM_TITLE_KV"
 *    - Go to Worker Settings → Variables → KV Namespace Bindings
 *    - Add: Variable name = "KV", KV namespace = "STREAM_TITLE_KV"
 * 5. Deploy
 */

// Models to rotate (Low tier = 150 requests/day each)
const MODELS = [
    'Llama-3.2-11B-Vision-Instruct',
    'Mistral-Nemo-2407',
    'Phi-4'
];

const REQUESTS_PER_MODEL = 45; // Switch model after 45 requests (safety margin)

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
            const { game, vibe, keywords } = await request.json();

            // Get current model based on request count
            const model = await getCurrentModel(env);

            // Build prompt
            const vibeDescriptions = {
                chill: 'relaxed and chill',
                hype: 'hype and energetic',
                funny: 'funny and meme-worthy',
                tryhard: 'competitive and tryhard',
                cozy: 'cozy and wholesome',
                chaotic: 'chaotic and unhinged'
            };

            const vibeDesc = vibeDescriptions[vibe] || 'engaging';
            const keywordPart = keywords ? ` Include these themes/words if possible: "${keywords}".` : '';

            const prompt = `Generate 5 unique, catchy stream titles for streaming "${game}" with a ${vibeDesc} vibe.${keywordPart}

Rules:
- Each title should be under 100 characters
- Make them engaging and click-worthy
- Include 1-2 relevant emojis per title
- Mix different styles: questions, statements, challenges
- Don't use generic phrases like "Come hang out" alone
- Just output the titles, one per line, no numbering`;

            // Call GitHub AI API
            const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.Github_Token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are a creative stream title generator for Twitch and YouTube streamers. Generate catchy, engaging titles that make viewers want to click. Be creative and unique.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 300,
                    temperature: 0.9
                })
            });

            const data = await response.json();

            // Increment request count after successful call
            await incrementRequestCount(env);

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

// Get today's date key
function getTodayKey() {
    const today = new Date();
    return `stream_title_${today.getUTCFullYear()}_${today.getUTCMonth()}_${today.getUTCDate()}`;
}

// Get current model based on request count
async function getCurrentModel(env) {
    // If KV is not configured, use first model
    if (!env.KV) {
        return MODELS[0];
    }

    const key = getTodayKey();
    const count = parseInt(await env.KV.get(key)) || 0;

    // Calculate which model to use
    const modelIndex = Math.floor(count / REQUESTS_PER_MODEL) % MODELS.length;
    return MODELS[modelIndex];
}

// Increment daily request count
async function incrementRequestCount(env) {
    // If KV is not configured, skip
    if (!env.KV) {
        return;
    }

    const key = getTodayKey();
    const count = parseInt(await env.KV.get(key)) || 0;

    // Store with 24-hour expiration
    await env.KV.put(key, String(count + 1), { expirationTtl: 86400 });
}
