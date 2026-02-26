import React, { useRef, useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../store/useAppStore';
import { getModelById } from '../../config/models';
import { exportToDocx } from '../../services/export-docx';
import { exportToPdf } from '../../services/export-pdf';

export const BriefView: React.FC = () => {
    const {
        brief, config, isStreaming, isLoading, error,
        setStep, keywordProposals, setError
    } = useAppStore();

    const [toast, setToast] = useState<string | null>(null);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingDocx, setExportingDocx] = useState(false);
    const briefRef = useRef<HTMLDivElement>(null);
    const model = getModelById(config.modelId);
    const selectedCount = keywordProposals.filter((kw) => kw.selected).length;

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
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

            {/* Loading / Streaming state */}
            {isLoading && !brief && (
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
