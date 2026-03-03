import type { AppError, SeedSuggestions } from '../types';
import { buildKeywordPrompt, buildBriefPrompt, buildSeedSuggestionPrompt } from '../config/prompts';
import { getModelById } from '../config/models';
import { parseKeywordResponse } from '../utils/parser';

// ─── OpenAI Provider ───
async function callOpenAI(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    signal?: AbortSignal
): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 4096,
        }),
        signal,
    });
    if (!res.ok) throw await handleApiError(res, 'OpenAI');
    const data = await res.json();
    return data.choices[0].message.content;
}

async function callOpenAIStream(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
): Promise<void> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 4096,
            stream: true,
        }),
        signal,
    });
    if (!res.ok) throw await handleApiError(res, 'OpenAI');

    const reader = res.body?.getReader();
    if (!reader) throw createError('network', 'No response body');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) onChunk(content);
                } catch { /* skip malformed chunks */ }
            }
        }
    }
}

// ─── Google Gemini Provider ───
async function callGemini(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    signal?: AbortSignal
): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
        signal,
    });
    if (!res.ok) throw await handleApiError(res, 'Google');
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGeminiStream(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
): Promise<void> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
        signal,
    });
    if (!res.ok) throw await handleApiError(res, 'Google');

    const reader = res.body?.getReader();
    if (!reader) throw createError('network', 'No response body');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith('data: ')) {
                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) onChunk(text);
                } catch { /* skip */ }
            }
        }
    }
}

// ─── Anthropic Provider (via CORS proxy or direct) ───
async function callAnthropic(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    signal?: AbortSignal
): Promise<string> {
    // Anthropic's API blocks direct browser CORS calls.
    // We try direct call first, and if CORS fails, show a clear error.
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 4096,
            temperature: 0.7,
        }),
        signal,
    });
    if (!res.ok) throw await handleApiError(res, 'Anthropic');
    const data = await res.json();
    return data.content?.[0]?.text || '';
}

async function callAnthropicStream(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
): Promise<void> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 4096,
            temperature: 0.7,
            stream: true,
        }),
        signal,
    });
    if (!res.ok) throw await handleApiError(res, 'Anthropic');

    const reader = res.body?.getReader();
    if (!reader) throw createError('network', 'No response body');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith('data: ')) {
                try {
                    const json = JSON.parse(trimmed.slice(6));
                    if (json.type === 'content_block_delta') {
                        const text = json.delta?.text;
                        if (text) onChunk(text);
                    }
                } catch { /* skip */ }
            }
        }
    }
}

// ─── Error Handling ───
async function handleApiError(res: Response, provider: string): Promise<AppError> {
    const status = res.status;
    if (status === 401 || status === 403) {
        return createError(
            'auth',
            `Your ${provider} API key is invalid or has expired. Verify it's active and correctly copied.`,
            `Go to ${provider} dashboard`,
        );
    }
    if (status === 429) {
        return createError(
            'rate_limit',
            `You've reached the request limit for your ${provider} plan. You can retry in 30 seconds.`,
            `Check your quota`,
        );
    }
    if (status >= 500) {
        return createError(
            'server',
            `The ${provider} AI service is temporarily unavailable. Please try again.`,
        );
    }
    try {
        const body = await res.json();
        return createError('server', body.error?.message || `Error ${status} from ${provider}`);
    } catch {
        return createError('server', `Error ${status} from ${provider}`);
    }
}

function createError(type: AppError['type'], message: string, action?: string): AppError {
    return { type, message, action };
}

// ─── Retry helper ───
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            const appErr = err as AppError;
            if (attempt === maxRetries) throw err;
            if (appErr.type === 'rate_limit' || appErr.type === 'server') {
                await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
            } else {
                throw err;
            }
        }
    }
    throw createError('server', 'Max retries exceeded');
}

// ─── Public API ───
function getCallFn(provider: string) {
    switch (provider) {
        case 'Anthropic': return callAnthropic;
        case 'Google': return callGemini;
        default: return callOpenAI;
    }
}

function getStreamFn(provider: string) {
    switch (provider) {
        case 'Anthropic': return callAnthropicStream;
        case 'Google': return callGeminiStream;
        default: return callOpenAIStream;
    }
}

export async function generateKeywords(
    config: { title: string; language: string; modelId: string; apiKey: string },
    signal?: AbortSignal
) {
    const model = getModelById(config.modelId);
    if (!model) throw createError('validation', 'Invalid model selected');

    const systemPrompt = buildKeywordPrompt(config.title, config.language, []);
    const userMessage = `Generate keyword proposals for the article: "${config.title}"`;
    const callFn = getCallFn(model.provider);

    const rawResponse = await callWithRetry(() =>
        callFn(config.apiKey, model.id, systemPrompt, userMessage, signal)
    );

    try {
        return parseKeywordResponse(rawResponse);
    } catch {
        // Retry with stricter prompt
        const strictPrompt = systemPrompt + '\n\nCRITICAL: You MUST respond ONLY with valid JSON. No text before or after.';
        const retryResponse = await callFn(config.apiKey, model.id, strictPrompt, userMessage, signal);
        return parseKeywordResponse(retryResponse);
    }
}

export async function generateKeywordsWithSeeds(
    config: { title: string; language: string; modelId: string; apiKey: string },
    seedKeywords: string[],
    signal?: AbortSignal
) {
    const model = getModelById(config.modelId);
    if (!model) throw createError('validation', 'Invalid model selected');

    const systemPrompt = buildKeywordPrompt(config.title, config.language, seedKeywords);
    const userMessage = `TITLE: "${config.title}"\nSEED KEYWORDS: ${seedKeywords.join(', ')}\n\nTASK: Using these seeds as a mandatory base, expand to 40 keywords that logically cover the main topic and its semantic variations. Maintain high relevance and "common sense" to satisfy both humans and LLMs.`;
    const callFn = getCallFn(model.provider);

    const rawResponse = await callWithRetry(() =>
        callFn(config.apiKey, model.id, systemPrompt, userMessage, signal)
    );

    try {
        return parseKeywordResponse(rawResponse);
    } catch {
        const strictPrompt = systemPrompt + '\n\nCRITICAL: Respond ONLY with valid JSON. No markdown, no backticks, no text before or after the JSON object.';
        const retryResponse = await callFn(config.apiKey, model.id, strictPrompt, userMessage, signal);
        return parseKeywordResponse(retryResponse);
    }
}

export async function generateBrief(
    config: { title: string; language: string; modelId: string; apiKey: string },
    selectedKeywords: string[],
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
): Promise<void> {
    const model = getModelById(config.modelId);
    if (!model) throw createError('validation', 'Invalid model selected');

    const systemPrompt = buildBriefPrompt(config.title, config.language, selectedKeywords);
    const userMessage = `ARTICLE TITLE: "${config.title}"\nSELECTED KEYWORDS: ${selectedKeywords.join(', ')}\n\nTASK: Generate a high-authority content brief optimized for GEO. Headlines must flow logically and integrations must be natural. Follow the 7 pillars and avoid robotic text. Generate the complete brief now.`;
    const streamFn = getStreamFn(model.provider);

    await streamFn(config.apiKey, model.id, systemPrompt, userMessage, onChunk, signal);
}

export async function suggestSeedKeywords(
    config: { title: string; language: string; modelId: string; apiKey: string },
    signal?: AbortSignal
): Promise<SeedSuggestions> {
    const model = getModelById(config.modelId);
    if (!model) throw createError('validation', 'Invalid model selected');

    const systemPrompt = buildSeedSuggestionPrompt(config.title, config.language);
    const userMessage = `Based on the title "${config.title}", suggest seed keywords.`;
    const callFn = getCallFn(model.provider);

    const rawResponse = await callWithRetry(() =>
        callFn(config.apiKey, model.id, systemPrompt, userMessage, signal)
    );

    const defaultSuggestions: SeedSuggestions = [];
    try {
        const parsed = JSON.parse(rawResponse);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.seeds && Array.isArray(parsed.seeds)) return parsed.seeds;
        return defaultSuggestions;
    } catch {
        const match = rawResponse.match(/\[.*\]/s) || rawResponse.match(/\{.*\}/s);
        if (match) {
            try {
                const parsed = JSON.parse(match[0]);
                if (Array.isArray(parsed)) return parsed;
                if (parsed.seeds && Array.isArray(parsed.seeds)) return parsed.seeds;
            } catch { /* ignore */ }
        }
        return defaultSuggestions;
    }
}
