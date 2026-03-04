import React from 'react';
import useStore from '../../store/useStore';
import { WP_FIELD_TYPES } from '../../utils/wp-autocomplete';
import Card from '../common/Card';
import TagsInput from '../common/TagsInput';
import SelectInput from '../common/SelectInput';

const CONTEXT_OPTIONS = ['normal', 'side', 'advanced'];
const PRIORITY_OPTIONS = ['default', 'high', 'low'];

export default function Step3MetaBoxes() {
  const metaBoxes            = useStore((s) => s.metaBoxes);
  const addMetaBox           = useStore((s) => s.addMetaBox);
  const removeMetaBox        = useStore((s) => s.removeMetaBox);
  const setMetaBoxData       = useStore((s) => s.setMetaBoxData);
  const addMetaBoxField      = useStore((s) => s.addMetaBoxField);
  const removeMetaBoxField   = useStore((s) => s.removeMetaBoxField);
  const setMetaBoxFieldData  = useStore((s) => s.setMetaBoxFieldData);
  const getDefinedPostTypes  = useStore((s) => s.getDefinedPostTypes);

  const postTypeSuggestions = getDefinedPostTypes();

  const set = (i) => (k) => (v) => setMetaBoxData(i, k, v);

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-table-cells text-primary" />
        <h4 className="mb-0">Meta Boxes</h4>
      </div>
      <p className="text-muted small mb-3">
        Define meta boxes for CPT edit screens. Meta box fields are saved as post meta.
        Use <code>_key</code> for private fields.
      </p>

      {metaBoxes.length === 0 && (
        <div className="alert alert-secondary mb-3 small">
          No meta boxes defined yet. Click <strong>Add Meta Box</strong> below.
        </div>
      )}

      {metaBoxes.map((mb, i) => (
        <Card
          key={i}
          title={mb.title || mb.id || `Meta Box #${i + 1}`}
          badge={mb.id || ''}
          onRemove={() => removeMetaBox(i)}
          defaultOpen={true}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`mb-id-${i}`}>
                  ID (slug) <span className="text-danger">*</span>
                </label>
                <input
                  id={`mb-id-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={mb.id || ''}
                  onChange={(e) => setMetaBoxData(i, 'id', e.target.value)}
                  placeholder="event_details"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`mb-title-${i}`}>
                  Title
                </label>
                <input
                  id={`mb-title-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={mb.title || ''}
                  onChange={(e) => setMetaBoxData(i, 'title', e.target.value)}
                  placeholder="Event Details"
                />
              </div>
            </div>
            <div className="col-md-4">
              <TagsInput
                label="Post Types"
                value={Array.isArray(mb.postTypes) ? mb.postTypes : []}
                onChange={set(i)('postTypes')}
                suggestions={postTypeSuggestions}
                placeholder="post, event..."
              />
            </div>

            <div className="col-md-6">
              <SelectInput
                id={`mb-context-${i}`}
                label="Context"
                value={mb.context || 'normal'}
                onChange={set(i)('context')}
                options={CONTEXT_OPTIONS}
              />
            </div>
            <div className="col-md-6">
              <SelectInput
                id={`mb-priority-${i}`}
                label="Priority"
                value={mb.priority || 'default'}
                onChange={set(i)('priority')}
                options={PRIORITY_OPTIONS}
              />
            </div>

            {/* Fields table */}
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <strong className="small">Fields</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => addMetaBoxField(i)}
                >
                  <i className="fas fa-plus me-1" />
                  Add Field
                </button>
              </div>
              {mb.fields && mb.fields.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Key</th>
                        <th>Label</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th style={{ width: 36 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mb.fields.map((field, fi) => (
                        <tr key={fi}>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={field.key || ''}
                              onChange={(e) => setMetaBoxFieldData(i, fi, 'key', e.target.value)}
                              placeholder="_event_date"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={field.label || ''}
                              onChange={(e) => setMetaBoxFieldData(i, fi, 'label', e.target.value)}
                              placeholder="Event Date"
                            />
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={field.type || 'text'}
                              onChange={(e) => setMetaBoxFieldData(i, fi, 'type', e.target.value)}
                            >
                              {WP_FIELD_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={field.description || ''}
                              onChange={(e) => setMetaBoxFieldData(i, fi, 'description', e.target.value)}
                              placeholder="Optional description"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeMetaBoxField(i, fi)}
                              title="Remove field"
                            >
                              <i className="fas fa-times" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted small mb-0">No fields yet.</p>
              )}
            </div>
          </div>
        </Card>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary mt-2"
        onClick={addMetaBox}
      >
        <i className="fas fa-plus me-2" />
        Add Meta Box
      </button>
    </div>
  );
}
