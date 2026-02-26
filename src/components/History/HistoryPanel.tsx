import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const HistoryPanel: React.FC = () => {
    const { history, loadFromHistory, removeFromHistory, setShowHistory } = useAppStore();
    const [search, setSearch] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const filtered = search
        ? history.filter((h) =>
            h.title.toLowerCase().includes(search.toLowerCase())
        )
        : history;

    const copyBrief = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
        } catch { /* ignore */ }
    };

    return (
        <>
            <div className="sidebar-overlay visible" onClick={() => setShowHistory(false)} />
            <div className="history-panel">
                <div className="history-header">
                    <h2>📋 Brief History</h2>
                    <button className="btn-icon" onClick={() => setShowHistory(false)} aria-label="Close history">
                        ✕
                    </button>
                </div>

                <div className="history-search">
                    <input
                        className="form-input"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="history-list">
                    {filtered.length === 0 ? (
                        <div className="history-empty">
                            <div className="history-empty-icon">📝</div>
                            <p>{history.length === 0 ? 'No briefs generated yet' : 'No results found'}</p>
                        </div>
                    ) : (
                        filtered.map((entry) => (
                            <div key={entry.id} className="history-item">
                                <div
                                    className="history-item-title"
                                    onClick={() => loadFromHistory(entry.id)}
                                >
                                    {entry.title}
                                </div>
                                <div className="history-item-meta">
                                    <span>{entry.provider} · {entry.model}</span>
                                    <span>{entry.language}</span>
                                    <span>
                                        {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="history-item-actions">
                                    <button
                                        className="btn btn-ghost"
                                        style={{ fontSize: '11px' }}
                                        onClick={() => loadFromHistory(entry.id)}
                                    >
                                        ↩ Open
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ fontSize: '11px' }}
                                        onClick={() => copyBrief(entry.content)}
                                    >
                                        📋 Copy
                                    </button>
                                    {confirmDelete === entry.id ? (
                                        <button
                                            className="btn btn-danger"
                                            style={{ fontSize: '11px' }}
                                            onClick={() => {
                                                removeFromHistory(entry.id);
                                                setConfirmDelete(null);
                                            }}
                                        >
                                            Confirm delete?
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-ghost"
                                            style={{ fontSize: '11px' }}
                                            onClick={() => setConfirmDelete(entry.id)}
                                        >
                                            🗑
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};
