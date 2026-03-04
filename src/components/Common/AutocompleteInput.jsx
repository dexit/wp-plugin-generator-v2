import React, { useState, useRef, useEffect } from 'react';

/**
 * AutocompleteInput
 * Props: { id, label, value, onChange, suggestions=[], placeholder='', help='', required=false }
 */
export default function AutocompleteInput({
  id,
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = '',
  help = '',
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = value
    ? suggestions.filter((s) =>
        s.toLowerCase().includes((value || '').toLowerCase())
      )
    : suggestions;

  const visible = open && filtered.length > 0;

  const select = (suggestion) => {
    onChange(suggestion);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!visible) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setOpen(true);
        return;
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        select(filtered[activeIndex]);
      } else {
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.wpg-autocomplete-item');
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="wpg-autocomplete mb-3">
      {label && (
        <label className="wpg-label form-label" htmlFor={id}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div className="position-relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="wpg-input form-control"
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          required={required}
        />
        {visible && (
          <ul
            ref={listRef}
            className="wpg-autocomplete-list list-unstyled mb-0"
            role="listbox"
          >
            {filtered.map((suggestion, idx) => (
              <li
                key={suggestion}
                className={`wpg-autocomplete-item${activeIndex === idx ? ' active' : ''}`}
                role="option"
                aria-selected={activeIndex === idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(suggestion);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      {help && <div className="wpg-help form-text">{help}</div>}
    </div>
  );
}
