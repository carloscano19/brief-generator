import React, { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fetchKeywordMetrics, fetchRelatedKeywords, AhrefsAuthError } from '../../services/ahrefs';
import { getModelById } from '../../config/models';
import { VOLUME_LABELS } from '../../types';

type FilterMode = 'none' | 'easy-wins' | 'high-traffic';

export const KeywordSelection: React.FC = () => {
    const {
        keywordProposals, toggleKeyword, setPrimaryKeyword, selectAllKeywords, deselectAllKeywords,
        config, prevStep,
        setBrief, setError, setStep: goToStep, setSerpInsight,
        isLoading, error,
        ahrefsData, ahrefsRelated, isLoadingAhrefs, ahrefsError,
        setAhrefsData, setAhrefsRelated, setLoadingAhrefs, setAhrefsError,
        addSeedKeyword,
    } = useAppStore();

    const abortRef = useRef<AbortController | null>(null);
    const model = getModelById(config.modelId);

    const [filterMode, setFilterMode] = useState<FilterMode>('none');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const selectedCount = keywordProposals.filter((kw) => kw.selected).length;
    const hasAhrefsData = Object.keys(ahrefsData).length > 0;

    // ─── Fetch Ahrefs data on mount if key is set ──────────────────────────────
    useEffect(() => {
        if (!config.ahrefsApiKey || keywordProposals.length === 0) return;

        let cancelled = false;
        const run = async () => {
            setLoadingAhrefs(true);
            setAhrefsError(null);
            try {
                const texts = keywordProposals.map((k) => k.text);
                const metricsData = await fetchKeywordMetrics(config.ahrefsApiKey, texts, config.ahrefsCountry);
                if (!cancelled) setAhrefsData(metricsData);

                const seedsToQuery = useAppStore.getState().seedKeywords.slice(0, 3);
                if (seedsToQuery.length > 0) {
                    const related: string[] = [];
                    for (const seed of seedsToQuery) {
                        const r = await fetchRelatedKeywords(config.ahrefsApiKey, seed, config.ahrefsCountry);
                        related.push(...r);
                    }
                    const unique = [...new Set(related)].filter(
                        (r) => !keywordProposals.some((k) => k.text.toLowerCase() === r.toLowerCase())
                    );
                    if (!cancelled) setAhrefsRelated(unique.slice(0, 12));
                }
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof AhrefsAuthError) {
                        setAhrefsError('Invalid Ahrefs API Key or no credits — using AI estimates instead.');
                    } else {
                        setAhrefsError('Could not load Ahrefs data — using AI estimates instead.');
                    }
                }
            } finally {
                if (!cancelled) setLoadingAhrefs(false);
            }
        };

        run();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Apply filters ──────────────────────────────────────────────────────────
    const visibleProposals = (() => {
        let list = keywordProposals.map((kw, idx) => ({ kw, idx }));
        if (filterMode === 'easy-wins' && hasAhrefsData) {
            list = list.filter(({ kw }) => {
                const d = ahrefsData[kw.text];
                if (!d) return true;
                return d.kd === null || d.kd <= 20;
            });
        }
        if (filterMode === 'high-traffic' && hasAhrefsData) {
            list = [...list].sort((a, b) => {
                const svA = ahrefsData[a.kw.text]?.sv ?? -1;
                const svB = ahrefsData[b.kw.text]?.sv ?? -1;
                return svB - svA;
            });
        }
        return list;
    })();

    // ─── Navigate to Step 4 — BriefView handles generation ────────────────────
    const handleGoToBrief = () => {
        if (abortRef.current) abortRef.current.abort();
        setError(null);
        setBrief('');
        setSerpInsight(null); // reset so BriefView re-fetches SERP
        goToStep(4);
    };

    // ─── KD badge helper ───────────────────────────────────────────────────────
    const kdClass = (kd: number | null) => {
        if (kd === null) return '';
        if (kd <= 20) return 'kd-easy';
        if (kd <= 50) return 'kd-medium';
        return 'kd-hard';
    };

    const formatSv = (sv: number | null) => {
        if (sv === null) return null;
        if (sv >= 1000000) return `${(sv / 1000000).toFixed(1)}M`;
        if (sv >= 1000) return `${(sv / 1000).toFixed(1)}K`;
        return `${sv}`;
    };

    return (
        <>
            {/* Selection toolbar */}
            <div className="selection-toolbar">
                <div className="selection-count">
                    <span className="count-badge">{selectedCount}</span>
                    <span>keywords selected</span>
                    {keywordProposals.length > 0 && (
                        <span style={{ color: 'var(--ink-3)', fontSize: '12px' }}>
                            of {keywordProposals.length} proposals · Generated by {model?.label}
                        </span>
                    )}
                </div>
                <div className="selection-actions">
                    <button className="btn btn-ghost" onClick={selectAllKeywords}>Select All</button>
                    <button className="btn btn-ghost" onClick={deselectAllKeywords}>Deselect All</button>
                </div>
            </div>

            {/* Ahrefs loading state */}
            {isLoadingAhrefs && (
                <div className="loading-ahrefs">
                    <span className="spinner spinner-sm" />
                    <span>Loading market data from Ahrefs...</span>
                </div>
            )}

            {/* Ahrefs error */}
            {ahrefsError && (
                <div className="error-banner ahrefs-warn" role="alert">
                    <span className="error-icon">📊</span>
                    <div className="error-text">
                        <div className="error-message">{ahrefsError}</div>
                    </div>
                    <button className="error-dismiss" onClick={() => setAhrefsError(null)}>✕</button>
                </div>
            )}

            {/* Ahrefs filter bar */}
            {hasAhrefsData && !isLoadingAhrefs && (
                <div className="ahrefs-filter-bar">
                    <span className="ahrefs-filter-label">📊 Ahrefs filters:</span>
                    <button
                        className={`btn btn-filter ${filterMode === 'easy-wins' ? 'active' : ''}`}
                        onClick={() => setFilterMode(filterMode === 'easy-wins' ? 'none' : 'easy-wins')}
                        title="Show only keywords with KD ≤ 20"
                    >
                        🎯 Easy Wins
                    </button>
                    <button
                        className={`btn btn-filter ${filterMode === 'high-traffic' ? 'active' : ''}`}
                        onClick={() => setFilterMode(filterMode === 'high-traffic' ? 'none' : 'high-traffic')}
                        title="Sort by highest search volume"
                    >
                        🚀 High Traffic
                    </button>
                    {filterMode !== 'none' && (
                        <button
                            className="btn btn-ghost"
                            onClick={() => setFilterMode('none')}
                            style={{ fontSize: '12px' }}
                        >
                            ✕ Reset
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="error-banner error" role="alert" aria-live="assertive">
                    <span className="error-icon">⚠️</span>
                    <div className="error-text">
                        <div className="error-title">Error</div>
                        <div className="error-message">{error.message}</div>
                    </div>
                    <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Keywords List */}
            <div className="keyword-list">
                {visibleProposals.map(({ kw, idx }) => {
                    const aData = ahrefsData[kw.text];
                    const sv = aData ? formatSv(aData.sv) : null;
                    const kd = aData ? aData.kd : null;

                    return (
                        <div
                            key={idx}
                            className={`keyword-item ${kw.selected ? 'selected' : ''} ${kw.isPrimary ? 'primary' : ''}`}
                            onClick={() => toggleKeyword(idx)}
                            role="checkbox"
                            aria-checked={kw.selected}
                            aria-label={kw.text}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === ' ') { e.preventDefault(); toggleKeyword(idx); }
                            }}
                        >
                            <div className="keyword-checkbox">
                                {kw.isPrimary ? '⭐' : (kw.selected ? '✓' : '')}
                            </div>

                            <div className="keyword-content" style={{ flex: 1, minWidth: 0 }}>
                                <div className="keyword-text-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span className="keyword-text" style={{ fontWeight: 600, fontSize: '14px' }}>{kw.text}</span>
                                    {kw.isPrimary && <span className="primary-badge">PRIMARY (70%)</span>}
                                </div>
                                <div className="keyword-meta">
                                    {hasAhrefsData && aData ? (
                                        <>
                                            {sv !== null && (
                                                <span className="sv-badge" title="Search Volume / month">
                                                    📈 {sv}/mo
                                                </span>
                                            )}
                                            {kd !== null && (
                                                <span className={`kd-badge ${kdClass(kd)}`} title={`Keyword Difficulty: ${kd}/100`}>
                                                    KD {kd}
                                                </span>
                                            )}
                                            {sv === null && kd === null && (
                                                <span className={`volume-badge ${kw.volume}`}>{VOLUME_LABELS[kw.volume]}</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className={`volume-badge ${kw.volume}`}>
                                            {VOLUME_LABELS[kw.volume]}
                                        </span>
                                    )}
                                </div>
                                {kw.rationale && (
                                    <div className="keyword-rationale">{kw.rationale}</div>
                                )}
                            </div>

                            <div className="keyword-actions" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, marginLeft: '16px' }}>
                                {kw.selected && !kw.isPrimary && (
                                    <button
                                        className="primary-select-btn"
                                        onClick={() => setPrimaryKeyword(idx)}
                                        title="Set as Primary Topic"
                                    >
                                        ⭐ Principal
                                    </button>
                                )}
                                {kw.isPrimary && (
                                    <div className="primary-active-indicator">
                                        🌟 ACTUAL PRINCIPAL
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ahrefs Suggestions */}
            {ahrefsRelated.length > 0 && !isLoadingAhrefs && (
                <div className="ahrefs-suggestions">
                    <button
                        className="ahrefs-suggestions-toggle"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                    >
                        <span>📊 Ahrefs Related Suggestions ({ahrefsRelated.length})</span>
                        <span>{showSuggestions ? '▲' : '▼'}</span>
                    </button>
                    {showSuggestions && (
                        <div className="ahrefs-suggestions-list">
                            <p className="ahrefs-suggestions-hint">
                                These terms have real search volume detected by Ahrefs. Click + to add as seed keywords for expanded proposals.
                            </p>
                            <div className="ahrefs-suggestions-grid">
                                {ahrefsRelated.map((term) => (
                                    <div key={term} className="ahrefs-suggestion-item">
                                        <span className="ahrefs-suggestion-text">{term}</span>
                                        <button
                                            className="ahrefs-suggestion-add"
                                            onClick={() => addSeedKeyword(term)}
                                            title="Add as seed keyword"
                                        >
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="step-footer" style={{
                position: 'sticky', bottom: '16px', background: 'var(--white)',
                padding: '16px 24px', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)', marginTop: 'var(--xl)',
                border: '1px solid var(--paper-2)'
            }}>
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button
                    className="btn btn-primary"
                    disabled={selectedCount === 0 || isLoading}
                    onClick={handleGoToBrief}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner" />
                            Generating Brief...
                        </>
                    ) : (
                        <>Create Brief with {selectedCount} Keywords →</>
                    )}
                </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-3)', marginTop: 'var(--md)' }}>
                {hasAhrefsData
                    ? '📊 Volume and difficulty data powered by Ahrefs.'
                    : '💡 Volume estimates are AI-generated approximations. Add your Ahrefs API key in Step 1 for real data.'}
            </div>
        </>
    );
};
