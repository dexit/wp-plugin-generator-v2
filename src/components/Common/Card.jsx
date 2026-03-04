import React, { useState } from 'react';

/**
 * Card
 * Props: { title, children, badge='', onRemove=null, defaultOpen=true, actions=null }
 * Collapsible card with header (title + badge + remove button).
 */
export default function Card({
  title,
  children,
  badge = '',
  onRemove = null,
  defaultOpen = true,
  actions = null,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="wpg-card mb-3">
      <div className="wpg-card-header d-flex align-items-center gap-2">
        <button
          type="button"
          className="wpg-card-toggle btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 flex-grow-1 text-start"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <i
            className={`fas fa-chevron-right wpg-card-chevron${open ? ' open' : ''}`}
          />
          <span className="wpg-card-title">{title}</span>
          {badge && (
            <span className="badge bg-secondary wpg-card-badge ms-1">
              {badge}
            </span>
          )}
        </button>
        {actions && (
          <div className="wpg-card-actions d-flex align-items-center gap-1">
            {actions}
          </div>
        )}
        {onRemove && (
          <button
            type="button"
            className="wpg-card-remove btn btn-link p-0 text-danger ms-1"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove"
            title="Remove"
          >
            <i className="fas fa-times" />
          </button>
        )}
      </div>
      {open && <div className="wpg-card-body">{children}</div>}
    </div>
  );
}
