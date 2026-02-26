import { create } from 'zustand';
import type { AppState, BriefConfig, KeywordProposal, HistoryEntry } from '../types';

const DEFAULT_CONFIG: BriefConfig = {
    title: '',
    language: 'English',
    modelId: 'gpt-4o',
    provider: 'OpenAI',
    apiKey: '',
    saveApiKey: false,
};

function loadHistory(): HistoryEntry[] {
    try {
        const raw = localStorage.getItem('seo-brief:history');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveHistory(history: HistoryEntry[]) {
    localStorage.setItem('seo-brief:history', JSON.stringify(history));
}

function loadSavedConfig(): Partial<BriefConfig> {
    try {
        const raw = localStorage.getItem('seo-brief:config');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function loadSavedApiKeys(): Record<string, string> {
    try {
        const raw = localStorage.getItem('seo-brief:apikeys');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export const useAppStore = create<AppState>((set, get) => ({
    currentStep: 1,
    config: { ...DEFAULT_CONFIG, ...loadSavedConfig() },
    seedKeywords: [],
    keywordProposals: [],
    brief: '',
    history: loadHistory(),
    isLoading: false,
    isStreaming: false,
    error: null,
    showHistory: false,

    setStep: (step) => set({ currentStep: step, error: null }),
    nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 4), error: null })),
    prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1), error: null })),

    updateConfig: (partial) => {
        set((s) => {
            const newConfig = { ...s.config, ...partial };
            // save non-sensitive config
            localStorage.setItem('seo-brief:config', JSON.stringify({
                language: newConfig.language,
                modelId: newConfig.modelId,
                provider: newConfig.provider,
            }));
            // handle API key saving
            if (newConfig.saveApiKey && newConfig.apiKey) {
                const keys = loadSavedApiKeys();
                keys[newConfig.provider] = newConfig.apiKey;
                localStorage.setItem('seo-brief:apikeys', JSON.stringify(keys));
            }
            return { config: newConfig };
        });
    },

    addSeedKeyword: (keyword) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;
        set((s) => {
            if (s.seedKeywords.length >= 10) return s;
            if (s.seedKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())) return s;
            return { seedKeywords: [...s.seedKeywords, trimmed] };
        });
    },

    removeSeedKeyword: (keyword) =>
        set((s) => ({
            seedKeywords: s.seedKeywords.filter((k) => k !== keyword),
        })),

    setKeywordProposals: (proposals) => set({ keywordProposals: proposals }),

    toggleKeyword: (index) =>
        set((s) => ({
            keywordProposals: s.keywordProposals.map((kw, i) =>
                i === index ? { ...kw, selected: !kw.selected } : kw
            ),
        })),

    selectAllKeywords: () =>
        set((s) => ({
            keywordProposals: s.keywordProposals.map((kw) => ({ ...kw, selected: true })),
        })),

    deselectAllKeywords: () =>
        set((s) => ({
            keywordProposals: s.keywordProposals.map((kw) => ({ ...kw, selected: false })),
        })),

    selectGroup: (group) =>
        set((s) => ({
            keywordProposals: s.keywordProposals.map((kw) =>
                kw.group === group ? { ...kw, selected: true } : kw
            ),
        })),

    deselectGroup: (group) =>
        set((s) => ({
            keywordProposals: s.keywordProposals.map((kw) =>
                kw.group === group ? { ...kw, selected: false } : kw
            ),
        })),

    getSelectedKeywords: () => get().keywordProposals.filter((kw) => kw.selected),

    setBrief: (brief) => set({ brief }),
    appendBrief: (chunk) => set((s) => ({ brief: s.brief + chunk })),
    setLoading: (isLoading) => set({ isLoading }),
    setStreaming: (isStreaming) => set({ isStreaming }),
    setError: (error) => set({ error }),

    addToHistory: (entry) =>
        set((s) => {
            let newHistory = [entry, ...s.history];
            if (newHistory.length > 20) {
                newHistory = newHistory.slice(0, 20);
            }
            saveHistory(newHistory);
            return { history: newHistory };
        }),

    removeFromHistory: (id) =>
        set((s) => {
            const newHistory = s.history.filter((h) => h.id !== id);
            saveHistory(newHistory);
            return { history: newHistory };
        }),

    loadFromHistory: (id) => {
        const entry = get().history.find((h) => h.id === id);
        if (entry) {
            set({
                brief: entry.content,
                currentStep: 4,
                showHistory: false,
                config: {
                    ...get().config,
                    title: entry.title,
                    language: entry.language,
                },
            });
        }
    },

    setShowHistory: (show) => set({ showHistory: show }),

    resetSession: () =>
        set({
            currentStep: 1,
            config: { ...DEFAULT_CONFIG, ...loadSavedConfig() },
            seedKeywords: [],
            keywordProposals: [],
            brief: '',
            isLoading: false,
            isStreaming: false,
            error: null,
        }),
}));
