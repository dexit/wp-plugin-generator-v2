import React from 'react';
import useStore from '../../store/useStore';
import { WP_FIELD_TYPES, WP_CAPABILITIES } from '../../utils/wp-autocomplete';
import Card from '../common/Card';
import AutocompleteInput from '../common/AutocompleteInput';
import ToggleInput from '../common/ToggleInput';

export default function Step4Settings() {
  const settingsGroups         = useStore((s) => s.settingsGroups);
  const addSettingsGroup       = useStore((s) => s.addSettingsGroup);
  const removeSettingsGroup    = useStore((s) => s.removeSettingsGroup);
  const setSettingsGroupData   = useStore((s) => s.setSettingsGroupData);
  const addSettingsSection     = useStore((s) => s.addSettingsSection);
  const removeSettingsSection  = useStore((s) => s.removeSettingsSection);
  const setSettingsSectionData = useStore((s) => s.setSettingsSectionData);
  const addSettingsField       = useStore((s) => s.addSettingsField);
  const removeSettingsField    = useStore((s) => s.removeSettingsField);
  const setSettingsFieldData   = useStore((s) => s.setSettingsFieldData);

  const options     = useStore((s) => s.options);
  const addOption   = useStore((s) => s.addOption);
  const removeOption = useStore((s) => s.removeOption);
  const setOptionData = useStore((s) => s.setOptionData);

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-sliders text-primary" />
        <h4 className="mb-0">Settings Pages</h4>
      </div>
      <p className="text-muted small mb-3">
        Configure WP Settings API pages, sections and fields.
      </p>

      {settingsGroups.map((group, gi) => (
        <Card
          key={gi}
          title={group.title || group.groupId || `Settings Group #${gi + 1}`}
          badge={group.pageSlug || ''}
          onRemove={() => removeSettingsGroup(gi)}
          defaultOpen={true}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label">Group ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={group.groupId || ''}
                  onChange={(e) => setSettingsGroupData(gi, 'groupId', e.target.value)}
                  placeholder="my_plugin_settings"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={group.title || ''}
                  onChange={(e) => setSettingsGroupData(gi, 'title', e.target.value)}
                  placeholder="My Plugin Settings"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label">Page Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={group.pageSlug || ''}
                  onChange={(e) => setSettingsGroupData(gi, 'pageSlug', e.target.value)}
                  placeholder="my-plugin-settings"
                />
              </div>
            </div>
            <div className="col-md-6">
              <AutocompleteInput
                label="Capability"
                value={group.capability || ''}
                onChange={(v) => setSettingsGroupData(gi, 'capability', v)}
                suggestions={WP_CAPABILITIES}
                placeholder="manage_options"
              />
            </div>
          </div>

          {/* Sections */}
          <div className="mt-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <strong className="small">Sections</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => addSettingsSection(gi)}
              >
                <i className="fas fa-plus me-1" />
                Add Section
              </button>
            </div>

            {(group.sections || []).map((section, si) => (
              <div key={si} className="border rounded p-3 mb-3 bg-light">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <strong className="small text-secondary">
                    Section #{si + 1}: {section.title || section.id || '(untitled)'}
                  </strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={() => removeSettingsSection(gi, si)}
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={section.id || ''}
                      onChange={(e) => setSettingsSectionData(gi, si, 'id', e.target.value)}
                      placeholder="Section ID"
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={section.title || ''}
                      onChange={(e) => setSettingsSectionData(gi, si, 'title', e.target.value)}
                      placeholder="Section Title"
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={section.description || ''}
                      onChange={(e) => setSettingsSectionData(gi, si, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                </div>

                {/* Fields */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">Fields</span>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-secondary btn-sm"
                    onClick={() => addSettingsField(gi, si)}
                  >
                    <i className="fas fa-plus me-1" />
                    Field
                  </button>
                </div>
                {(section.fields || []).length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Label</th>
                          <th>Type</th>
                          <th>Default</th>
                          <th>Description</th>
                          <th style={{ width: 36 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.fields.map((field, fi) => (
                          <tr key={fi}>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={field.id || ''}
                                onChange={(e) => setSettingsFieldData(gi, si, fi, 'id', e.target.value)}
                                placeholder="my_option"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={field.label || ''}
                                onChange={(e) => setSettingsFieldData(gi, si, fi, 'label', e.target.value)}
                                placeholder="My Option"
                              />
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={field.type || 'text'}
                                onChange={(e) => setSettingsFieldData(gi, si, fi, 'type', e.target.value)}
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
                                value={field.default || ''}
                                onChange={(e) => setSettingsFieldData(gi, si, fi, 'default', e.target.value)}
                                placeholder="default"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={field.description || ''}
                                onChange={(e) => setSettingsFieldData(gi, si, fi, 'description', e.target.value)}
                                placeholder="Description"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeSettingsField(gi, si, fi)}
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
            ))}

            {(group.sections || []).length === 0 && (
              <p className="text-muted small">No sections yet.</p>
            )}
          </div>
        </Card>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary mt-2"
        onClick={addSettingsGroup}
      >
        <i className="fas fa-plus me-2" />
        Add Settings Group
      </button>

      {/* Options Section */}
      <div className="mt-5">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i className="fas fa-database text-secondary" />
          <h5 className="mb-0">Raw Options</h5>
        </div>
        <p className="text-muted small mb-3">
          Register WordPress options directly with <code>add_option()</code> /
          <code>get_option()</code>.
        </p>

        {options.length > 0 && (
          <div className="table-responsive mb-3">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                  <th>Autoload</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {options.map((opt, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={opt.key || ''}
                        onChange={(e) => setOptionData(i, 'key', e.target.value)}
                        placeholder="my_option_key"
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={opt.type || 'text'}
                        onChange={(e) => setOptionData(i, 'type', e.target.value)}
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
                        value={opt.default || ''}
                        onChange={(e) => setOptionData(i, 'default', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={opt.description || ''}
                        onChange={(e) => setOptionData(i, 'description', e.target.value)}
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!opt.autoload}
                        onChange={(e) => setOptionData(i, 'autoload', e.target.checked)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeOption(i)}
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

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={addOption}
        >
          <i className="fas fa-plus me-2" />
          Add Option
        </button>
      </div>
    </div>
  );
}
