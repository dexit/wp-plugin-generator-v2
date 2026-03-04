import React from 'react';

/**
 * StepProgress
 * Props: { steps, currentStep, onStepClick }
 * Renders sidebar step list.
 */
export default function StepProgress({ steps, currentStep, onStepClick }) {
  return (
    <nav className="wpg-step-nav">
      <ol className="list-unstyled mb-0">
        {steps.map((step, index) => {
          const isDone = currentStep > index;
          const isActive = currentStep === index;

          return (
            <li
              key={step.id}
              className={`wpg-step-item${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
              onClick={() => onStepClick && onStepClick(index)}
              style={{ cursor: onStepClick ? 'pointer' : 'default' }}
            >
              <div className="wpg-step-num">
                {isDone ? (
                  <i className="fas fa-check" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="wpg-step-content">
                <div className="wpg-step-label">
                  <i className={`fas ${step.icon} me-1`} />
                  {step.label}
                </div>
                {step.description && (
                  <div className="wpg-step-desc">{step.description}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
