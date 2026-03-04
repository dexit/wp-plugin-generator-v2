import React from 'react';

/**
 * SelectInput
 * Props: { id, label, value, onChange, options=[], help='', placeholder='Select...' }
 * options can be string[] or { value, label }[]
 */
export default function SelectInput({
  id,
  label,
  value,
  onChange,
  options = [],
  help = '',
  placeholder = 'Select...',
}) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className="mb-3">
      {label && (
        <label className="wpg-label form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <select
        id={id}
        className="wpg-select form-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {help && <div className="wpg-help form-text">{help}</div>}
    </div>
  );
}
