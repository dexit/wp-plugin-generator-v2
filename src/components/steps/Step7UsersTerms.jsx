import React from 'react';
import useStore from '../../store/useStore';
import { WP_FIELD_TYPES } from '../../utils/wp-autocomplete';
import Card from '../common/Card';
import AutocompleteInput from '../common/AutocompleteInput';

export default function Step7UsersTerms() {
  const userFields           = useStore((s) => s.userFields);
  const addUserField         = useStore((s) => s.addUserField);
  const removeUserField      = useStore((s) => s.removeUserField);
  const setUserFieldData     = useStore((s) => s.setUserFieldData);

  const termFieldGroups      = useStore((s) => s.termFieldGroups);
  const addTermFieldGroup    = useStore((s) => s.addTermFieldGroup);
  const removeTermFieldGroup = useStore((s) => s.removeTermFieldGroup);
  const setTermFieldGroupData = useStore((s) => s.setTermFieldGroupData);
  const addTermField         = useStore((s) => s.addTermField);
  const removeTermField      = useStore((s) => s.removeTermField);
  const setTermFieldData     = useStore((s) => s.setTermFieldData);

  const getDefinedTaxonomies = useStore((s) => s.getDefinedTaxonomies);
  const taxonomySuggestions  = getDefinedTaxonomies();

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-users text-primary" />
        <h4 className="mb-0">Users &amp; Terms</h4>
      </div>
      <p className="text-muted small mb-4">
        Add custom fields to user profiles and taxonomy term edit screens.
      </p>

      {/* User Fields */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">User Profile Fields</h5>
            <span className="badge bg-secondary">{userFields.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addUserField}
          >
            <i className="fas fa-plus me-1" />
            Add User Field
          </button>
        </div>

        {userFields.length === 0 && (
          <div className="alert alert-secondary small mb-3">
            No user fields defined yet.
          </div>
        )}

        {userFields.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Key</th>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Section</th>
                  <th>Description</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {userFields.map((field, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={field.key || ''}
                        onChange={(e) => setUserFieldData(i, 'key', e.target.value)}
                        placeholder="em_attended_events"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={field.label || ''}
                        onChange={(e) => setUserFieldData(i, 'label', e.target.value)}
                        placeholder="Attended Events"
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={field.type || 'text'}
                        onChange={(e) => setUserFieldData(i, 'type', e.target.value)}
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
                        value={field.section || ''}
                        onChange={(e) => setUserFieldData(i, 'section', e.target.value)}
                        placeholder="Section heading"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={field.description || ''}
                        onChange={(e) => setUserFieldData(i, 'description', e.target.value)}
                        placeholder="Optional description"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeUserField(i)}
                      >
                        <i className="fas fa-times" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Term Field Groups */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">Taxonomy Term Fields</h5>
            <span className="badge bg-secondary">{termFieldGroups.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addTermFieldGroup}
          >
            <i className="fas fa-plus me-1" />
            Add Term Field Group
          </button>
        </div>
        <p className="text-muted small mb-3">
          Add extra fields to taxonomy term add/edit screens.
        </p>

        {termFieldGroups.length === 0 && (
          <div className="alert alert-secondary small mb-3">
            No term field groups yet.
          </div>
        )}

        {termFieldGroups.map((group, gi) => (
          <Card
            key={gi}
            title={group.taxonomy || `Group #${gi + 1}`}
            onRemove={() => removeTermFieldGroup(gi)}
            defaultOpen={true}
          >
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <AutocompleteInput
                  label="Taxonomy"
                  value={group.taxonomy || ''}
                  onChange={(v) => setTermFieldGroupData(gi, 'taxonomy', v)}
                  suggestions={taxonomySuggestions}
                  placeholder="event_category"
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-2">
              <strong className="small">Fields</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => addTermField(gi)}
              >
                <i className="fas fa-plus me-1" />
                Add Field
              </button>
            </div>

            {(group.fields || []).length > 0 ? (
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
                    {group.fields.map((field, fi) => (
                      <tr key={fi}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.key || ''}
                            onChange={(e) => setTermFieldData(gi, fi, 'key', e.target.value)}
                            placeholder="_cat_color"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.label || ''}
                            onChange={(e) => setTermFieldData(gi, fi, 'label', e.target.value)}
                            placeholder="Category Color"
                          />
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={field.type || 'text'}
                            onChange={(e) => setTermFieldData(gi, fi, 'type', e.target.value)}
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
                            onChange={(e) => setTermFieldData(gi, fi, 'description', e.target.value)}
                            placeholder="Optional description"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeTermField(gi, fi)}
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
          </Card>
        ))}
      </div>
    </div>
  );
}
