import React from 'react';
import { useAppStore } from '../../store/useAppStore';

const STEPS = [
    { num: 1, label: 'Configuration' },
    { num: 2, label: 'Seed Keywords' },
    { num: 3, label: 'Select Keywords' },
    { num: 4, label: 'Brief' },
];

export const Stepper: React.FC = () => {
    const currentStep = useAppStore((s) => s.currentStep);

    return (
        <div className="stepper" role="list" aria-label="Progress steps">
            {STEPS.map((step, i) => (
                <React.Fragment key={step.num}>
                    <div
                        className={`stepper-step ${step.num === currentStep ? 'active' : ''
                            } ${step.num < currentStep ? 'completed' : ''}`}
                        role="listitem"
                        aria-current={step.num === currentStep ? 'step' : undefined}
                    >
                        <div className="stepper-circle">
                            {step.num < currentStep ? '✓' : step.num}
                        </div>
                        <span>{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div
                            className={`stepper-line ${step.num < currentStep ? 'completed' : ''}`}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
