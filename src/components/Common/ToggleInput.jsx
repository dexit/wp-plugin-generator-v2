import React from 'react';

/**
 * ToggleInput
 * Props: { label, value=false, onChange, description='' }
 * Bootstrap form-switch style toggle.
 */
export default function ToggleInput({
  label,
  value = false,
  onChange,
  description = '',
}) {
  const id = `toggle-${label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).slice(2)}`;

  return (
    <div className="wpg-toggle mb-2">
      <div className="form-check form-switch d-flex align-items-start gap-2">
        <input
          className="form-check-input wpg-toggle-input"
          type="checkbox"
          role="switch"
          id={id}
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div>
          <label className="form-check-label wpg-toggle-label" htmlFor={id}>
            {label}
          </label>
          {description && (
            <div className="wpg-toggle-desc text-muted small mt-1">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
