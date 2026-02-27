import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { generateKeywordsWithSeeds, suggestSeedKeywords } from '../../services/llm';
import { getModelById } from '../../config/models';
import type { AppError } from '../../types';

export const SeedKeywords: React.FC = () => {
    const {
        seedKeywords, addSeedKeyword, removeSeedKeyword,
        suggestedSeedKeywords, setSuggestedSeeds,
        config, prevStep, setStep,
        setKeywordProposals, setLoading, setError,
        isLoading, error
    } = useAppStore();

    const [inputValue, setInputValue] = useState('');
    const [shakingChip, setShakingChip] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Fetch suggestions on mount
    useEffect(() => {
        if (!suggestedSeedKeywords && !isSuggesting && config.title) {
            const fetchSuggestions = async () => {
                setIsSuggesting(true);
                try {
                    const suggestions = await suggestSeedKeywords(config);
                    setSuggestedSeeds(suggestions);
                } catch (err) {
                    console.error('Failed to fetch seed suggestions:', err);
                } finally {
                    setIsSuggesting(false);
                }
            };
            fetchSuggestions();
        }
    }, [config, suggestedSeedKeywords, isSuggesting, setSuggestedSeeds]);

    const addKeyword = useCallback((text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        if (seedKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
            setShakingChip(trimmed.toLowerCase());
            setTimeout(() => setShakingChip(null), 300);
            return;
        }
        addSeedKeyword(trimmed);
        setInputValue('');
    }, [seedKeywords, addSeedKeyword]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addKeyword(inputValue);
        }
        if (e.key === 'Backspace' && !inputValue && seedKeywords.length > 0) {
            removeSeedKeyword(seedKeywords[seedKeywords.length - 1]);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const parts = text.split(/[,;\n]+/);
        parts.forEach((part) => addKeyword(part));
    };

    const handleGenerate = async () => {
        setError(null);
        setLoading(true);
        abortRef.current = new AbortController();

        try {
            const proposals = await generateKeywordsWithSeeds(
                config,
                seedKeywords,
                abortRef.current.signal
            );
            setKeywordProposals(proposals);
            setStep(3);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            setError(err as AppError);
        } finally {
            setLoading(false);
        }
    };

    const model = getModelById(config.modelId);
    const maxReached = seedKeywords.length >= 10;

    const categories = [
        { id: 'short', label: 'Short-tail', icon: '🎯' },
        { id: 'long', label: 'Long-tail', icon: '📏' },
        { id: 'questions', label: 'Questions', icon: '❓' },
        { id: 'entities', label: 'Entities', icon: '🧠' },
    ] as const;

    return (
        <div className="step-card">
            <h1 className="step-title">Seed Keywords</h1>
            <p className="step-description">
                Enter up to 10 seed keywords. You can type them manually or pick from the AI-powered suggestions below.
            </p>

            {error && (
                <div className="error-banner error" role="alert">
                    <span className="error-icon">🔑</span>
                    <div className="error-text">
                        <div className="error-title">
                            {error.type === 'auth' ? 'Invalid API Key' : 'Error'}
                        </div>
                        <div className="error-message">{error.message}</div>
                        {error.action && (
                            <span className="error-action" onClick={() => window.open(error.actionUrl)}>
                                {error.action} →
                            </span>
                        )}
                    </div>
                    <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            <div className="suggestions-container">
                <div className="suggestions-header">
                    <label className="form-label">Suggested by AI</label>
                    {isSuggesting && <span className="loading-dots">analyzing title...</span>}
                </div>

                <div className="suggestions-tabs">
                    {categories.map((cat) => (
                        <div key={cat.id} className="suggestion-group">
                            <h4 className="suggestion-group-title">
                                <span>{cat.icon}</span> {cat.label}
                            </h4>
                            <div className="suggested-chips">
                                {suggestedSeedKeywords && suggestedSeedKeywords[cat.id]?.length > 0 ? (
                                    suggestedSeedKeywords[cat.id].map((tag) => {
                                        const isAdded = seedKeywords.some(k => k.toLowerCase() === tag.toLowerCase());
                                        return (
                                            <button
                                                key={tag}
                                                className={`suggest-chip ${isAdded ? 'added' : ''}`}
                                                onClick={() => !isAdded && addKeyword(tag)}
                                                disabled={isAdded || maxReached}
                                            >
                                                {isAdded ? '✓' : '+'} {tag}
                                            </button>
                                        );
                                    })
                                ) : !isSuggesting ? (
                                    <span className="no-suggestions">No suggestions</span>
                                ) : (
                                    <div className="skeleton-chips">
                                        {[1, 2, 3].map(i => <div key={i} className="skeleton-chip" />)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Your Keywords</label>
                <div
                    className="chip-area"
                    onClick={() => inputRef.current?.focus()}
                    role="list"
                    aria-label="Seed keywords"
                >
                    {seedKeywords.map((kw) => (
                        <span
                            key={kw}
                            className={`chip ${shakingChip === kw.toLowerCase() ? 'shake' : ''}`}
                            role="listitem"
                        >
                            {kw}
                            <button
                                className="chip-remove"
                                onClick={(e) => { e.stopPropagation(); removeSeedKeyword(kw); }}
                                aria-label={`Remove ${kw}`}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                    {!maxReached && (
                        <input
                            ref={inputRef}
                            className="chip-input"
                            placeholder={seedKeywords.length === 0 ? 'Type or pick a suggestion...' : 'Add more...'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            disabled={maxReached}
                            maxLength={100}
                        />
                    )}
                </div>
                <div className="chip-count">
                    {seedKeywords.length} / 10 keywords
                    {maxReached && <span style={{ color: 'var(--amber)' }}> · Maximum reached</span>}
                </div>
            </div>

            <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button
                    className="btn btn-primary"
                    disabled={seedKeywords.length === 0 || isLoading}
                    onClick={handleGenerate}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner" />
                            Expanding keywords with {model?.label}...
                        </>
                    ) : (
                        <>Expand to 40 Keywords ✦</>
                    )}
                </button>
            </div>
        </div>
    );
};
