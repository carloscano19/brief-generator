import type { LLMModel } from '../types';

export const LLM_MODELS: LLMModel[] = [
    // Anthropic
    {
        provider: 'Anthropic',
        label: 'Claude Opus 4',
        id: 'claude-opus-4-5',
        apiKeyPrefix: 'sk-ant-',
        docsUrl: 'https://docs.anthropic.com',
    },
    {
        provider: 'Anthropic',
        label: 'Claude Sonnet 4.5',
        id: 'claude-sonnet-4-5',
        apiKeyPrefix: 'sk-ant-',
        docsUrl: 'https://docs.anthropic.com',
    },
    {
        provider: 'Anthropic',
        label: 'Claude Haiku 4.5',
        id: 'claude-haiku-4-5-20251001',
        apiKeyPrefix: 'sk-ant-',
        docsUrl: 'https://docs.anthropic.com',
    },
    // OpenAI
    {
        provider: 'OpenAI',
        label: 'GPT-4o',
        id: 'gpt-4o',
        apiKeyPrefix: 'sk-',
        docsUrl: 'https://platform.openai.com/docs',
    },
    {
        provider: 'OpenAI',
        label: 'GPT-4o Mini',
        id: 'gpt-4o-mini',
        apiKeyPrefix: 'sk-',
        docsUrl: 'https://platform.openai.com/docs',
    },
    {
        provider: 'OpenAI',
        label: 'GPT-4 Turbo',
        id: 'gpt-4-turbo',
        apiKeyPrefix: 'sk-',
        docsUrl: 'https://platform.openai.com/docs',
    },
    // Google
    {
        provider: 'Google',
        label: 'Gemini 1.5 Pro',
        id: 'gemini-1.5-pro',
        apiKeyPrefix: 'AIza',
        docsUrl: 'https://ai.google.dev/docs',
    },
    {
        provider: 'Google',
        label: 'Gemini 1.5 Flash',
        id: 'gemini-1.5-flash',
        apiKeyPrefix: 'AIza',
        docsUrl: 'https://ai.google.dev/docs',
    },
];

export function getModelById(id: string): LLMModel | undefined {
    return LLM_MODELS.find((m) => m.id === id);
}

export function getModelsByProvider(provider: string): LLMModel[] {
    return LLM_MODELS.filter((m) => m.provider === provider);
}

export function getProviders(): string[] {
    return [...new Set(LLM_MODELS.map((m) => m.provider))];
}
