import React, { useState } from 'react';
import useStore from '../../store/useStore';

/**
 * ValidationWarnings
 * Uses useStore to get getValidationWarnings().
 * Collapsible panel of warnings.
 * Red badge for errors, yellow for warnings.
 */
export default function ValidationWarnings() {
  const getValidationWarnings = useStore((s) => s.getValidationWarnings);
  const warnings = getValidationWarnings();
  const [open, setOpen] = useState(false);

  const errors = warnings.filter((w) => w.level === 'error');
  const warningItems = warnings.filter((w) => w.level === 'warning');

  if (warnings.length === 0) {
    return (
      <div className="wpg-warnings wpg-warnings--clear alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
        <i className="fas fa-check-circle" />
        <span>No warnings — looking good!</span>
      </div>
    );
  }

  return (
    <div className="wpg-warnings mb-3">
      <button
        type="button"
        className="wpg-warnings-toggle btn btn-sm w-100 d-flex align-items-center justify-content-between gap-2"
        style={{
          background: errors.length > 0 ? 'var(--wpg-danger-soft, #fff5f5)' : 'var(--wpg-warning-soft, #fffbeb)',
          border: `1px solid ${errors.length > 0 ? '#f8d7da' : '#ffeaa7'}`,
          borderRadius: 6,
          padding: '8px 12px',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="d-flex align-items-center gap-2">
          <i
            className={`fas ${errors.length > 0 ? 'fa-circle-exclamation text-danger' : 'fa-triangle-exclamation text-warning'}`}
          />
          <strong>
            {errors.length > 0
              ? `${errors.length} error${errors.length > 1 ? 's' : ''}`
              : ''}
            {errors.length > 0 && warningItems.length > 0 ? ', ' : ''}
            {warningItems.length > 0
              ? `${warningItems.length} warning${warningItems.length > 1 ? 's' : ''}`
              : ''}
          </strong>
        </span>
        <span className="d-flex align-items-center gap-2">
          {errors.length > 0 && (
            <span className="badge bg-danger">{errors.length}</span>
          )}
          {warningItems.length > 0 && (
            <span className="badge bg-warning text-dark">{warningItems.length}</span>
          )}
          <i
            className={`fas fa-chevron-${open ? 'up' : 'down'} text-muted`}
          />
        </span>
      </button>
      {open && (
        <div className="wpg-warnings-body mt-1 border rounded p-2 bg-white">
          {warnings.map((w) => (
            <div
              key={w.id}
              className={`wpg-warning-item d-flex align-items-start gap-2 py-2 px-2 rounded mb-1 ${
                w.level === 'error' ? 'bg-danger bg-opacity-10' : 'bg-warning bg-opacity-10'
              }`}
            >
              <span className="wpg-warning-icon mt-1">
                <i
                  className={`fas ${
                    w.level === 'error'
                      ? 'fa-circle-exclamation text-danger'
                      : 'fa-triangle-exclamation text-warning'
                  }`}
                />
              </span>
              <div className="flex-grow-1">
                <div className="wpg-warning-text">
                  <span className="badge bg-secondary me-1 fw-normal">{w.section}</span>
                  {w.message}
                </div>
                {w.fix && (
                  <div className="wpg-warning-fix text-muted small mt-1">
                    <i className="fas fa-lightbulb me-1" />
                    {w.fix}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
