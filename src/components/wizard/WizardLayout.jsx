import React, { useRef, lazy, Suspense } from 'react';
import useStore, { WIZARD_STEPS } from '../../store/useStore';
import StepProgress from './StepProgress';
import ValidationWarnings from './ValidationWarnings';
import exampleSolution from '../../data/exampleSolution';

// Lazy-load step components
const Step1General       = lazy(() => import('../steps/Step1General'));
const Step2PostTypes     = lazy(() => import('../steps/Step2PostTypes'));
const Step3MetaBoxes     = lazy(() => import('../steps/Step3MetaBoxes'));
const Step4Settings      = lazy(() => import('../steps/Step4Settings'));
const Step5Rest          = lazy(() => import('../steps/Step5Rest'));
const Step6AdminUI       = lazy(() => import('../steps/Step6AdminUI'));
const Step7UsersTerms    = lazy(() => import('../steps/Step7UsersTerms'));
const Step8Blocks        = lazy(() => import('../steps/Step8Blocks'));
const Step9EmailsImporters = lazy(() => import('../steps/Step9EmailsImporters'));
const Step10Assets       = lazy(() => import('../steps/Step10Assets'));
const Step11Review       = lazy(() => import('../steps/Step11Review'));

const STEP_COMPONENTS = [
  Step1General,
  Step2PostTypes,
  Step3MetaBoxes,
  Step4Settings,
  Step5Rest,
  Step6AdminUI,
  Step7UsersTerms,
  Step8Blocks,
  Step9EmailsImporters,
  Step10Assets,
  Step11Review,
];

export default function WizardLayout() {
  const currentStep      = useStore((s) => s.currentStep);
  const _historySize     = useStore((s) => s._historySize);
  const setStep          = useStore((s) => s.setStep);
  const nextStep         = useStore((s) => s.nextStep);
  const prevStep         = useStore((s) => s.prevStep);
  const undo             = useStore((s) => s.undo);
  const redo             = useStore((s) => s.redo);
  const exportConfig     = useStore((s) => s.exportConfig);
  const importConfig     = useStore((s) => s.importConfig);
  const loadPreset       = useStore((s) => s.loadPreset);
  const resetAll         = useStore((s) => s.resetAll);

  const fileInputRef = useRef(null);
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const canUndo = _historySize.past > 0;
  const canRedo = _historySize.future > 0;

  const handleExport = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'wp-plugin-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importConfig(ev.target.result);
      } catch (err) {
        alert('Failed to import config: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = '';
  };

  const handleLoadPreset = () => {
    if (window.confirm('Load the Example Solution preset? This will replace your current config.')) {
      loadPreset(exampleSolution);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      resetAll();
    }
  };

  const CurrentStepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="wpg-layout">
      {/* Navbar */}
      <header className="wpg-navbar d-flex align-items-center px-4 gap-3">
        <div className="wpg-brand d-flex align-items-center gap-2 me-auto">
          <i className="fas fa-puzzle-piece wpg-brand-icon" />
          <span className="wpg-brand-text fw-semibold">WP Plugin Generator</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Undo/Redo */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
          >
            <i className="fas fa-undo" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
          >
            <i className="fas fa-redo" />
          </button>

          <div className="vr mx-1" />

          {/* Import */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleImportClick}
            title="Import config JSON"
          >
            <i className="fas fa-upload me-1" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Export */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleExport}
            title="Export config JSON"
          >
            <i className="fas fa-download me-1" />
            Export
          </button>

          {/* Preset */}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={handleLoadPreset}
            title="Load example solution preset"
          >
            <i className="fas fa-magic me-1" />
            Preset
          </button>

          {/* Reset */}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={handleReset}
            title="Reset all settings"
          >
            <i className="fas fa-trash-alt me-1" />
            Reset
          </button>
        </div>
      </header>

      {/* Body (sidebar + main) */}
      <div className="wpg-body d-flex">
        {/* Sidebar */}
        <aside className="wpg-sidebar">
          <StepProgress
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={(idx) => setStep(idx)}
          />
        </aside>

        {/* Main content */}
        <main className="wpg-main flex-grow-1">
          <ValidationWarnings />

          <Suspense
            fallback={
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            }
          >
            {CurrentStepComponent && <CurrentStepComponent />}
          </Suspense>
        </main>
      </div>

      {/* Footer */}
      <footer className="wpg-footer d-flex align-items-center justify-content-between px-4 gap-3">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <i className="fas fa-arrow-left me-1" />
          Back
        </button>

        <span className="wpg-footer-counter text-muted small">
          Step {currentStep + 1} of {WIZARD_STEPS.length} &mdash;{' '}
          <strong>{WIZARD_STEPS[currentStep]?.label}</strong>
        </span>

        {isLastStep ? (
          <button
            type="button"
            className="btn btn-success"
            onClick={() => {
              // Scroll to Generate button in Step11Review
              document.querySelector('.wpg-generate-btn')?.click();
            }}
          >
            <i className="fas fa-rocket me-1" />
            Generate
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={nextStep}
          >
            Next
            <i className="fas fa-arrow-right ms-1" />
          </button>
        )}
      </footer>
    </div>
  );
}
