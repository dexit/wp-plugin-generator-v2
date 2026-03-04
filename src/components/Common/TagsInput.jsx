import React, { useState, useRef } from 'react';

/**
 * TagsInput
 * Props: { label, value=[], onChange, suggestions=[], placeholder='Add...', help='' }
 * value is a string array of tags.
 */
export default function TagsInput({
  label,
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Add...',
  help = '',
}) {
  const [inputVal, setInputVal] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const tags = Array.isArray(value) ? value : [];

  const filteredSuggestions = inputVal
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(inputVal.toLowerCase()) &&
          !tags.includes(s)
      )
    : suggestions.filter((s) => !tags.includes(s));

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputVal('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputVal.trim()) {
        addTag(inputVal);
      }
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      if (inputVal.trim()) {
        addTag(inputVal);
      }
    }, 150);
  };

  return (
    <div className="mb-3">
      {label && (
        <label className="wpg-label form-label">{label}</label>
      )}
      <div className="wpg-tags-wrap">
        {tags.map((tag) => (
          <span key={tag} className="wpg-tag">
            {tag}
            <button
              type="button"
              className="wpg-tag-remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <div className="position-relative" style={{ flex: 1, minWidth: 120 }}>
          <input
            ref={inputRef}
            type="text"
            className="wpg-tags-input"
            value={inputVal}
            placeholder={tags.length === 0 ? placeholder : ''}
            onChange={(e) => {
              setInputVal(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="wpg-autocomplete-list list-unstyled mb-0">
              {filteredSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="wpg-autocomplete-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(suggestion);
                    inputRef.current && inputRef.current.focus();
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {help && <div className="wpg-help form-text">{help}</div>}
    </div>
  );
}
