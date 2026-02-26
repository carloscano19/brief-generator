import React, { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { generateKeywordsWithSeeds } from '../../services/llm';
import { getModelById } from '../../config/models';
import { AppError } from '../../types';

export const SeedKeywords: React.FC = () => {
    const {
        seedKeywords, addSeedKeyword, removeSeedKeyword,
        config, prevStep, setStep,
        setKeywordProposals, setLoading, setError,
        isLoading, error
    } = useAppStore();

    const [inputValue, setInputValue] = useState('');
    const [shakingChip, setShakingChip] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

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

    return (
        <div className="step-card">
            <h1 className="step-title">Seed Keywords</h1>
            <p className="step-description">
                Enter up to 10 seed keywords that define your article's topic. The AI will expand these
                into 15-20 keyword proposals organized by type.
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

            <div className="form-group">
                <label className="form-label">Keywords</label>
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
                            placeholder={seedKeywords.length === 0 ? 'Type a keyword and press Enter...' : 'Add more...'}
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
                            Analyzing with {model?.label}...
                        </>
                    ) : (
                        <>Generate Keyword Proposals ✦</>
                    )}
                </button>
            </div>
        </div>
    );
};
