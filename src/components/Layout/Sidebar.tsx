import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getModelById } from '../../config/models';

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

const STEPS = [
    { num: 1, label: 'Configuration' },
    { num: 2, label: 'Seed Keywords' },
    { num: 3, label: 'Select Keywords' },
    { num: 4, label: 'Brief' },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose }) => {
    const { currentStep, setStep, setShowHistory, resetSession, config } = useAppStore();
    const model = getModelById(config.modelId);

    return (
        <aside className={`sidebar${mobileOpen ? ' sidebar-mobile-open' : ''}`} id="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">✦</div>
                <span>Brief Generator</span>
            </div>
            <div className="sidebar-subtitle">SEO &amp; GEO Optimization</div>

            <nav className="sidebar-nav">
                {STEPS.map((step) => (
                    <button
                        key={step.num}
                        className={`sidebar-nav-item ${step.num === currentStep ? 'active' : ''} ${step.num < currentStep ? 'completed' : ''}`}
                        onClick={() => {
                            if (step.num <= currentStep) setStep(step.num);
                            if (onClose) onClose();
                        }}
                        disabled={step.num > currentStep}
                    >
                        <span className="step-number">
                            {step.num < currentStep ? '✓' : step.num}
                        </span>
                        {step.label}
                    </button>
                ))}
            </nav>

            <hr className="sidebar-divider" />

            <button
                className="sidebar-history-btn"
                onClick={() => {
                    setShowHistory(true);
                    if (onClose) onClose();
                }}
            >
                📋 Brief History
            </button>

            {model && (
                <div style={{ padding: '12px 16px', fontSize: '11px', color: '#6B7F93' }}>
                    <div style={{ marginBottom: '4px' }}>Model</div>
                    <div style={{ color: '#0FA394', fontWeight: 600, fontSize: '12px' }}>
                        {model.label}
                    </div>
                    <div style={{ fontSize: '10px', marginTop: '2px' }}>{model.provider}</div>
                </div>
            )}

            <button className="sidebar-new-btn" onClick={() => {
                resetSession();
                if (onClose) onClose();
            }}>
                + New Brief
            </button>
        </aside>
    );
};
