/**
 * Cloudflare Worker - Channel Point Ideas Generator API
 * With Model Rotation to avoid rate limits
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to workers.cloudflare.com → Create Worker
 * 2. Paste this entire code
 * 3. Go to Settings → Variables → Add:
 *    - Name: Github_Token
 *    - Value: your GitHub token
 *    - Click "Encrypt"
 * 4. Create KV Namespace (or reuse existing):
 *    - Go to Workers & Pages → KV
 *    - Create namespace: "GAMERTAG_KV" (or use existing)
 *    - Go to Worker Settings → Variables → KV Namespace Bindings
 *    - Add: Variable name = "KV", KV namespace = "GAMERTAG_KV"
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
            const { game, vibe, rewardType, keywords } = await request.json();

            // Get current model based on request count
            const model = await getCurrentModel(env);

            // Game display names
            const gameNames = {
                'just-chatting': 'Just Chatting / IRL',
                'valorant': 'Valorant',
                'fortnite': 'Fortnite',
                'minecraft': 'Minecraft',
                'league-of-legends': 'League of Legends',
                'apex-legends': 'Apex Legends',
                'gta': 'GTA V / GTA Online',
                'call-of-duty': 'Call of Duty',
                'horror': 'Horror Games',
                'variety': 'Variety / Multiple Games'
            };

            // Vibe descriptions
            const vibeDescriptions = {
                'funny': 'funny, silly, and meme-worthy',
                'competitive': 'competitive, tryhard, and skill-focused',
                'cozy': 'cozy, relaxed, and chill',
                'chaotic': 'chaotic, wild, and unpredictable',
                'wholesome': 'wholesome, friendly, and positive'
            };

            // Reward type focus
            const rewardFocus = {
                'streamer-actions': 'things the streamer must DO (actions, challenges, impressions, voice changes)',
                'game-challenges': 'in-game challenges and restrictions (handicaps, weapon limits, character picks)',
                'chat-perks': 'perks for the redeemer (VIP, shoutouts, name a character, highlight message)',
                'sound-effects': 'sound effects and visual changes (play sounds, change lights, use filters)',
                'mixed': 'a mix of streamer actions, game challenges, and fun perks'
            };

            const gameName = gameNames[game] || game;
            const vibeDesc = vibeDescriptions[vibe] || 'entertaining';
            const focus = rewardFocus[rewardType] || 'various fun rewards';
            const keywordPart = keywords ? ` Try to incorporate these themes: "${keywords}".` : '';

            const prompt = `Generate 5 unique Twitch channel point reward ideas for a ${gameName} streamer with a ${vibeDesc} stream style.

Focus on: ${focus}${keywordPart}

For each reward, provide:
1. A short, catchy reward NAME (2-5 words)
2. A brief DESCRIPTION (1 sentence explaining what happens)
3. Suggested POINT COST (realistic: 100-50000 based on difficulty)

Format EXACTLY like this (one per line):
NAME | DESCRIPTION | POINTS

Examples:
Pistol Only Round | Streamer must use only pistols for the next round | 2000
Hydration Check | Streamer takes a drink of water on camera | 100
Pick My Character | Viewer chooses what character the streamer plays next game | 5000

Now generate 5 creative rewards:`;

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
                        { role: 'system', content: 'You are a creative Twitch channel reward designer. Generate unique, fun channel point rewards. Output ONLY in the exact format requested: NAME | DESCRIPTION | POINTS. No extra text.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 500,
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
    return `count_${today.getUTCFullYear()}_${today.getUTCMonth()}_${today.getUTCDate()}`;
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
