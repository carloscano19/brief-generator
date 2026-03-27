import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LLM_MODELS, getModelById } from '../../config/models';
import { LANGUAGES } from '../../types';
import { validateApiKey } from '../../utils/validators';

export const ConfigForm: React.FC = () => {
    const { config, updateConfig, nextStep } = useAppStore();
    const [showKey, setShowKey] = useState(false);
    const [showAhrefsKey, setShowAhrefsKey] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showAhrefsSaveModal, setShowAhrefsSaveModal] = useState(false);

    const model = getModelById(config.modelId);
    const keyValid = config.apiKey.length > 10 && validateApiKey(config.apiKey, model?.apiKeyPrefix || '');
    const canContinue = config.title.trim().length > 0 && config.apiKey.length > 0;

    const groupedModels = LLM_MODELS.reduce((acc, m) => {
        if (!acc[m.provider]) acc[m.provider] = [];
        acc[m.provider].push(m);
        return acc;
    }, {} as Record<string, typeof LLM_MODELS>);

    const handleModelChange = (modelId: string) => {
        const newModel = getModelById(modelId);
        if (newModel) {
            let savedKey = '';
            try {
                const keys = JSON.parse(localStorage.getItem('seo-brief:apikeys') || '{}');
                savedKey = keys[newModel.provider] || '';
            } catch { /* ignore */ }

            updateConfig({
                modelId,
                provider: newModel.provider,
                apiKey: savedKey,
            });
        }
    };

    const handleSaveKeyToggle = (checked: boolean) => {
        if (checked) {
            setShowSaveModal(true);
        } else {
            updateConfig({ saveApiKey: false });
            try {
                const keys = JSON.parse(localStorage.getItem('seo-brief:apikeys') || '{}');
                delete keys[config.provider];
                localStorage.setItem('seo-brief:apikeys', JSON.stringify(keys));
            } catch { /* ignore */ }
        }
    };

    const handleSaveAhrefsKeyToggle = (checked: boolean) => {
        if (checked) {
            setShowAhrefsSaveModal(true);
        } else {
            updateConfig({ saveAhrefsApiKey: false });
            localStorage.removeItem('seo-brief:ahrefs-key');
        }
    };

    return (
        <div className="step-card">
            <h1 className="step-title">Article Configuration</h1>
            <p className="step-description">
                Define your article's context: title, language, AI model, and API key.
                This information will be used to generate keyword proposals and the content brief.
            </p>

            {/* Title */}
            <div className="form-group">
                <label className="form-label" htmlFor="title">Post Title</label>
                <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Why Did the Corinthians Fan Token Rise 47% After the Supercup?"
                    value={config.title}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    maxLength={120}
                    autoFocus
                />
                <div className={`char-counter ${config.title.length > 100 ? 'warn' : ''} ${config.title.length >= 120 ? 'over' : ''}`}>
                    {config.title.length} / 120
                </div>
            </div>

            {/* Language & Model */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label" htmlFor="language">Language</label>
                    <select
                        id="language"
                        className="form-select"
                        value={config.language}
                        onChange={(e) => updateConfig({ language: e.target.value })}
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    <div className="form-hint">The AI will generate content in this language</div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="model">AI Model</label>
                    <select
                        id="model"
                        className="form-select"
                        value={config.modelId}
                        onChange={(e) => handleModelChange(e.target.value)}
                    >
                        {Object.entries(groupedModels).map(([provider, models]) => (
                            <optgroup key={provider} label={provider}>
                                {models.map((m) => (
                                    <option key={m.id} value={m.id}>{m.label}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <div className="form-hint">
                        {model?.provider} · <a href={model?.docsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)' }}>API docs →</a>
                    </div>
                </div>
            </div>

            {/* LLM API Key */}
            <div className="form-group">
                <label className="form-label" htmlFor="apikey">
                    {model?.provider} API Key
                </label>
                <div className="api-key-wrapper">
                    <input
                        id="apikey"
                        type={showKey ? 'text' : 'password'}
                        className={`form-input ${config.apiKey && (keyValid ? 'valid' : config.apiKey.length > 5 ? 'error' : '')}`}
                        placeholder={`Paste your ${model?.provider} API key here`}
                        value={config.apiKey}
                        onChange={(e) => updateConfig({ apiKey: e.target.value })}
                        style={{ paddingRight: '48px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                        aria-describedby="apikey-hint"
                    />
                    <button
                        className="api-key-toggle"
                        onClick={() => setShowKey(!showKey)}
                        aria-label={showKey ? 'Hide API key' : 'Show API key'}
                        type="button"
                    >
                        {showKey ? '🙈' : '👁'}
                    </button>
                </div>
                {config.apiKey && (
                    <div className={`api-key-badge ${keyValid ? 'valid' : 'invalid'}`}>
                        {keyValid ? '✓ Valid format' : '✕ Invalid format'}
                    </div>
                )}
                <div className="save-key-row">
                    <input
                        type="checkbox"
                        id="save-key"
                        checked={config.saveApiKey}
                        onChange={(e) => handleSaveKeyToggle(e.target.checked)}
                    />
                    <label htmlFor="save-key">Save API key in browser storage</label>
                </div>
                <div className="form-hint" id="apikey-hint">
                    Your API key is sent directly to {model?.provider}'s servers. It is never stored on any server.
                </div>
            </div>

            {/* Ahrefs API Key */}
            <div className="form-group ahrefs-key-section">
                <label className="form-label" htmlFor="ahrefs-apikey">
                    Ahrefs API Key
                    <span className="optional-badge">Optional</span>
                </label>
                <div className="api-key-wrapper">
                    <input
                        id="ahrefs-apikey"
                        type={showAhrefsKey ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Paste your Ahrefs API key for real SEO data"
                        value={config.ahrefsApiKey}
                        onChange={(e) => updateConfig({ ahrefsApiKey: e.target.value })}
                        style={{ paddingRight: '48px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                        aria-describedby="ahrefs-apikey-hint"
                    />
                    <button
                        className="api-key-toggle"
                        onClick={() => setShowAhrefsKey(!showAhrefsKey)}
                        aria-label={showAhrefsKey ? 'Hide Ahrefs API key' : 'Show Ahrefs API key'}
                        type="button"
                    >
                        {showAhrefsKey ? '🙈' : '👁'}
                    </button>
                </div>
                {config.ahrefsApiKey && (
                    <div className="api-key-badge valid">✓ Ahrefs key entered</div>
                )}

                {/* Country Selector */}
                <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '11px', color: 'var(--ink-3)' }}>TARGET COUNTRY (AHREFS)</label>
                    <select
                        className="form-select"
                        value={config.ahrefsCountry}
                        onChange={(e) => updateConfig({ ahrefsCountry: e.target.value })}
                        style={{ paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
                    >
                        <option value="us">United States (US)</option>
                        <option value="gb">United Kingdom (GB)</option>
                        <option value="es">Spain (ES)</option>
                        <option value="mx">Mexico (MX)</option>
                        <option value="ar">Argentina (AR)</option>
                        <option value="co">Colombia (CO)</option>
                        <option value="cl">Chile (CL)</option>
                        <option value="pe">Peru (PE)</option>
                        <option value="fr">France (FR)</option>
                        <option value="de">Germany (DE)</option>
                        <option value="it">Italy (IT)</option>
                        <option value="br">Brazil (BR)</option>
                        <option value="au">Australia (AU)</option>
                        <option value="ca">Canada (CA)</option>
                    </select>
                </div>

                <div className="save-key-row">
                    <input
                        type="checkbox"
                        id="save-ahrefs-key"
                        checked={config.saveAhrefsApiKey}
                        onChange={(e) => handleSaveAhrefsKeyToggle(e.target.checked)}
                    />
                    <label htmlFor="save-ahrefs-key">Save API key in browser storage</label>
                </div>
                <div className="form-hint ahrefs-feature-hint" id="ahrefs-apikey-hint">
                    🔍 Enables real Search Volume (SV) and Keyword Difficulty (KD) data in Step 3, plus SERP insights to enrich the final brief.
                    Without this key, the app uses AI-estimated volume data.
                </div>
            </div>

            {/* CTA */}
            <div className="step-footer">
                <div></div>
                <button
                    className="btn btn-primary"
                    disabled={!canContinue}
                    onClick={nextStep}
                    title={!canContinue ? 'Complete all fields to continue' : ''}
                >
                    Continue: Add Keywords →
                </button>
            </div>

            {/* Save LLM Key Modal */}
            {showSaveModal && (
                <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">⚠️ Save API Key?</h3>
                        <div className="modal-body">
                            Your API key will be saved in this browser's local storage.
                            Anyone with access to this device could potentially access it.
                            <br /><br />
                            <strong>Do not enable this on shared or public devices.</strong>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    updateConfig({ saveApiKey: true });
                                    setShowSaveModal(false);
                                }}
                            >
                                I understand, save anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Ahrefs Key Modal */}
            {showAhrefsSaveModal && (
                <div className="modal-overlay" onClick={() => setShowAhrefsSaveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">⚠️ Save Ahrefs API Key?</h3>
                        <div className="modal-body">
                            Your Ahrefs API key will be saved in this browser's local storage.
                            Anyone with access to this device could potentially access it.
                            <br /><br />
                            <strong>Do not enable this on shared or public devices.</strong>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowAhrefsSaveModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    updateConfig({ saveAhrefsApiKey: true });
                                    setShowAhrefsSaveModal(false);
                                }}
                            >
                                I understand, save anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
