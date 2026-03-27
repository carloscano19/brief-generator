import React, { useRef, useState, useCallback, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../store/useAppStore';
import { getModelById } from '../../config/models';
import { exportToDocx } from '../../services/export-docx';
import { exportToPdf } from '../../services/export-pdf';
import { generateBrief } from '../../services/llm';
import { fetchSerpInsight, AhrefsAuthError } from '../../services/ahrefs';
import type { AppError } from '../../types';

export const BriefView: React.FC = () => {
    const {
        brief, config, isStreaming, isLoading, error,
        setStep, keywordProposals, setError,
        serpInsight, setSerpInsight,
        setBrief, setLoading, setStreaming, addToHistory,
    } = useAppStore();

    const [toast, setToast] = useState<string | null>(null);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingDocx, setExportingDocx] = useState(false);
    const [serpLoading, setSerpLoading] = useState(false);
    const [briefStarted, setBriefStarted] = useState(false);
    const briefRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const model = getModelById(config.modelId);
    const selectedCount = keywordProposals.filter((kw) => kw.selected).length;

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ─── On mount: fetch SERP insight then stream brief ─────────────────────
    useEffect(() => {
        // If brief is already set (e.g. loaded from history), do nothing
        if (brief) return;

        let cancelled = false;

        const run = async () => {
            setError(null);
            setLoading(true);
            setStreaming(true);
            setBrief('');

            const primaryKw = keywordProposals.find(kw => kw.isPrimary);
            const secondaryKws = keywordProposals.filter(kw => kw.selected && !kw.isPrimary);

            // 1. Fetch SERP insight if Ahrefs key exists and there's a primary keyword
            let currentSerpInsight = serpInsight;
            if (config.ahrefsApiKey && primaryKw && !serpInsight) {
                setSerpLoading(true);
                try {
                    const insight = await fetchSerpInsight(config.ahrefsApiKey, primaryKw.text, config.ahrefsCountry);
                    if (!cancelled) {
                        setSerpInsight(insight);
                        currentSerpInsight = insight;
                    }
                } catch (err) {
                    if (err instanceof AhrefsAuthError) {
                        // silently ignore, brief still generates without SERP data
                    }
                } finally {
                    if (!cancelled) setSerpLoading(false);
                }
            }

            if (cancelled) return;
            setBriefStarted(true);

            // 2. Generate brief
            abortRef.current = new AbortController();
            try {
                await generateBrief(
                    config,
                    primaryKw?.text || null,
                    secondaryKws.map(k => k.text),
                    (chunk: string) => useAppStore.getState().appendBrief(chunk),
                    abortRef.current.signal,
                    currentSerpInsight
                );

                const finalBrief = useAppStore.getState().brief;
                addToHistory({
                    id: crypto.randomUUID(),
                    title: config.title,
                    model: model?.label || config.modelId,
                    provider: config.provider,
                    language: config.language,
                    timestamp: new Date().toISOString(),
                    content: finalBrief,
                    keywordCount: selectedCount,
                });
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                if (!cancelled) setError(err as AppError);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setStreaming(false);
                }
            }
        };

        run();
        return () => {
            cancelled = true;
            abortRef.current?.abort();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopyMarkdown = async () => {
        try {
            await navigator.clipboard.writeText(brief);
            showToast('✓ Brief copied to clipboard as Markdown');
        } catch {
            showToast('Failed to copy');
        }
    };

    const handleExportDocx = async () => {
        setExportingDocx(true);
        try {
            await exportToDocx(brief, config.title);
            showToast('✓ DOCX file downloaded');
        } catch (err) {
            console.error(err);
            showToast('Failed to export DOCX');
        }
        setExportingDocx(false);
    };

    const handleExportPdf = async () => {
        if (!briefRef.current) return;
        setExportingPdf(true);
        try {
            await exportToPdf(briefRef.current, config.title);
            showToast('✓ PDF file downloaded');
        } catch (err) {
            console.error(err);
            showToast('Failed to export PDF');
        }
        setExportingPdf(false);
    };

    return (
        <>
            {/* Toolbar */}
            <div className="brief-toolbar">
                <div className="brief-toolbar-title">
                    {config.title || 'Generated Brief'}
                </div>
                <div className="brief-toolbar-actions">
                    {!isStreaming && brief && (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={handleCopyMarkdown}
                                aria-label="Copy brief as Markdown"
                            >
                                📋 Copy Markdown
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleExportDocx}
                                disabled={exportingDocx}
                                aria-label="Export brief as DOCX"
                            >
                                {exportingDocx ? <><span className="spinner" style={{ borderTopColor: 'var(--ink-2)' }} /> Exporting...</> : '📄 Export DOCX'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleExportPdf}
                                disabled={exportingPdf}
                                aria-label="Export brief as PDF"
                            >
                                {exportingPdf ? <><span className="spinner" style={{ borderTopColor: 'var(--ink-2)' }} /> Exporting...</> : '📑 Export PDF'}
                            </button>
                            <button className="btn btn-ghost" onClick={() => setStep(3)}>
                                ← Back to Keywords
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Metadata bar */}
            {brief && (
                <div className="brief-meta">
                    <div className="brief-meta-item">
                        🌐 <strong>{config.language}</strong>
                    </div>
                    <div className="brief-meta-item">
                        🤖 <strong>{model?.label}</strong> ({model?.provider})
                    </div>
                    <div className="brief-meta-item">
                        🔑 <strong>{selectedCount} keywords</strong>
                    </div>
                    <div className="brief-meta-item">
                        📅 <strong>{new Date().toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}</strong>
                    </div>
                    {/* SERP Insight badge */}
                    {serpInsight && (serpInsight.avgWords || serpInsight.dominantIntent) && (
                        <div className="brief-meta-item serp-insight-badge">
                            📊 Ahrefs SERP:{' '}
                            {serpInsight.avgWords && <strong>~{serpInsight.avgWords} words avg</strong>}
                            {serpInsight.avgWords && serpInsight.dominantIntent && ' · '}
                            {serpInsight.dominantIntent && <strong>Intent: {serpInsight.dominantIntent}</strong>}
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="error-banner error" role="alert">
                    <span className="error-icon">⚠️</span>
                    <div className="error-text">
                        <div className="error-title">Error generating brief</div>
                        <div className="error-message">{error.message}</div>
                    </div>
                    <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* SERP loading state */}
            {serpLoading && (
                <div className="step-card" style={{ textAlign: 'center', padding: '48px 40px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
                    <div className="spinner" style={{
                        width: '28px', height: '28px', margin: '0 auto 16px',
                        borderColor: 'var(--paper-2)', borderTopColor: 'var(--teal)'
                    }} />
                    <p style={{ color: 'var(--ink-2)', fontWeight: 500 }}>Analyzing SERP data from Ahrefs...</p>
                    <p style={{ color: 'var(--ink-3)', fontSize: '12px', marginTop: '8px' }}>
                        Identifying top competitors and dominant content intent
                    </p>
                </div>
            )}

            {/* Generic loading / Streaming state */}
            {isLoading && !brief && !serpLoading && briefStarted && (
                <div className="step-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '24px', opacity: 0.3 }}>✦</div>
                    <div className="spinner" style={{
                        width: '32px', height: '32px', margin: '0 auto 16px',
                        borderColor: 'var(--paper-2)', borderTopColor: 'var(--teal)'
                    }} />
                    <p style={{ color: 'var(--ink-3)' }}>
                        Generating brief with {model?.label}...
                    </p>
                    <p style={{ color: 'var(--ink-3)', fontSize: '12px', marginTop: '8px' }}>
                        This may take 15-30 seconds
                    </p>
                </div>
            )}

            {/* Brief content */}
            {brief && (
                <div className="brief-content" ref={briefRef}>
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            input: (props) => (
                                <input
                                    {...props}
                                    type="checkbox"
                                    disabled={false}
                                    style={{ accentColor: 'var(--teal)', marginRight: '8px' }}
                                />
                            ),
                        }}
                    >
                        {brief}
                    </Markdown>
                    {isStreaming && <span className="streaming-cursor" />}
                </div>
            )}

            {/* Toast */}
            {toast && <div className="toast">{toast}</div>}
        </>
    );
};
