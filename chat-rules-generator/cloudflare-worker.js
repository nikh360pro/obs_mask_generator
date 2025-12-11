/**
 * Cloudflare Worker: Chat Rules Generator
 * Deploy this to Cloudflare Workers
 * 
 * Required:
 * - Environment variable: Github_Token
 * - KV Namespace binding: KV (use existing or create CHAT_RULES_KV)
 */

const MODELS = [
    'Llama-3.2-11B-Vision-Instruct',
    'Mistral-Nemo-2407',
    'Phi-4'
];
const REQUESTS_PER_MODEL = 45;

async function getCurrentModel(env) {
    const data = await env.KV.get('chat_rules_model_state', 'json');
    if (!data) {
        return { modelIndex: 0, requestCount: 0 };
    }
    return data;
}

async function incrementRequestCount(env, currentState) {
    let { modelIndex, requestCount } = currentState;
    requestCount++;

    if (requestCount >= REQUESTS_PER_MODEL) {
        modelIndex = (modelIndex + 1) % MODELS.length;
        requestCount = 0;
    }

    await env.KV.put('chat_rules_model_state', JSON.stringify({ modelIndex, requestCount }));
    return MODELS[modelIndex];
}

function buildPrompt(vibe, strictness, specificBans, ruleCount) {
    const vibeDescriptions = {
        chill: 'relaxed, friendly, laid-back community',
        competitive: 'competitive gaming focused, intense but respectful',
        family: 'family-friendly, all ages welcome, wholesome',
        mature: 'mature audience, adult humor allowed, 18+',
        educational: 'learning-focused, questions encouraged, supportive',
        creative: 'creative and artistic, constructive feedback, supportive'
    };

    const strictnessDescriptions = {
        relaxed: 'minimal rules, trust-based, community self-moderates',
        moderate: 'balanced approach, clear expectations, fair enforcement',
        strict: 'zero tolerance for violations, heavy moderation, clear consequences'
    };

    let prompt = `Generate exactly ${Math.min(parseInt(ruleCount) || 5, 5)} chat rules for a Twitch streamer.

Channel vibe: ${vibeDescriptions[vibe] || vibe}
Moderation style: ${strictnessDescriptions[strictness] || strictness}`;

    if (specificBans && specificBans.trim()) {
        prompt += `\nSpecifically ban these topics: ${specificBans}`;
    }

    prompt += `

Requirements:
- Each rule should be 1-2 sentences
- Be clear and direct
- Match the channel vibe
- Number each rule (1. 2. 3. etc.)
- Do not include explanations, just the rules
- Make rules practical and enforceable

Generate the ${ruleCount} rules now:`;

    return prompt;
}

export default {
    async fetch(request, env) {
        // Handle CORS
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            const { vibe, strictness, specificBans, ruleCount } = await request.json();

            const currentState = await getCurrentModel(env);
            const model = await incrementRequestCount(env, currentState);

            const prompt = buildPrompt(vibe, strictness, specificBans, ruleCount);

            const response = await fetch('https://models.github.ai/inference/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.Github_Token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that generates Twitch chat rules. Only output the numbered rules, nothing else.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            const data = await response.json();
            const rules = data.choices[0]?.message?.content || '';

            return new Response(JSON.stringify({ rules, model }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }
};
