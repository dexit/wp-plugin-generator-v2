import React from 'react';
import useStore from '../../store/useStore';
import { WP_FIELD_TYPES } from '../../utils/wp-autocomplete';
import Card from '../common/Card';
import AutocompleteInput from '../common/AutocompleteInput';
import SelectInput from '../common/SelectInput';

const SCREEN_OPTION_TYPES = ['per_page', 'columns'];

export default function Step6AdminUI() {
  const quickEdits            = useStore((s) => s.quickEdits);
  const addQuickEdit          = useStore((s) => s.addQuickEdit);
  const removeQuickEdit       = useStore((s) => s.removeQuickEdit);
  const setQuickEditData      = useStore((s) => s.setQuickEditData);
  const addQuickEditField     = useStore((s) => s.addQuickEditField);
  const removeQuickEditField  = useStore((s) => s.removeQuickEditField);
  const setQuickEditFieldData = useStore((s) => s.setQuickEditFieldData);

  const bulkEdits             = useStore((s) => s.bulkEdits);
  const addBulkEdit           = useStore((s) => s.addBulkEdit);
  const removeBulkEdit        = useStore((s) => s.removeBulkEdit);
  const setBulkEditData       = useStore((s) => s.setBulkEditData);
  const addBulkEditAction     = useStore((s) => s.addBulkEditAction);
  const removeBulkEditAction  = useStore((s) => s.removeBulkEditAction);
  const setBulkEditActionData = useStore((s) => s.setBulkEditActionData);

  const tables        = useStore((s) => s.tables);
  const addTable      = useStore((s) => s.addTable);
  const removeTable   = useStore((s) => s.removeTable);
  const setTableData  = useStore((s) => s.setTableData);

  const screenOptions      = useStore((s) => s.screenOptions);
  const addScreenOption    = useStore((s) => s.addScreenOption);
  const removeScreenOption = useStore((s) => s.removeScreenOption);
  const setScreenOptionData = useStore((s) => s.setScreenOptionData);

  const getDefinedPostTypes = useStore((s) => s.getDefinedPostTypes);
  const postTypeSuggestions = getDefinedPostTypes();

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-table-list text-primary" />
        <h4 className="mb-0">Admin UI</h4>
      </div>
      <p className="text-muted small mb-4">
        Configure quick edit, bulk edit actions, database tables, and screen options.
      </p>

      {/* Quick Edit */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">Quick Edit</h5>
            <span className="badge bg-secondary">{quickEdits.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addQuickEdit}
          >
            <i className="fas fa-plus me-1" />
            Add Quick Edit
          </button>
        </div>

        {quickEdits.map((qe, i) => (
          <Card
            key={i}
            title={qe.postType || `Quick Edit #${i + 1}`}
            onRemove={() => removeQuickEdit(i)}
            defaultOpen={true}
          >
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <AutocompleteInput
                  label="Post Type"
                  value={qe.postType || ''}
                  onChange={(v) => setQuickEditData(i, 'postType', v)}
                  suggestions={postTypeSuggestions}
                  placeholder="event"
                />
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <strong className="small">Fields</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => addQuickEditField(i)}
              >
                <i className="fas fa-plus me-1" />
                Add Field
              </button>
            </div>
            {(qe.fields || []).length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr><th>Key</th><th>Label</th><th>Type</th><th style={{ width: 36 }}></th></tr>
                  </thead>
                  <tbody>
                    {qe.fields.map((field, fi) => (
                      <tr key={fi}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.key || ''}
                            onChange={(e) => setQuickEditFieldData(i, fi, 'key', e.target.value)}
                            placeholder="_event_date"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.label || ''}
                            onChange={(e) => setQuickEditFieldData(i, fi, 'label', e.target.value)}
                            placeholder="Event Date"
                          />
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={field.type || 'text'}
                            onChange={(e) => setQuickEditFieldData(i, fi, 'type', e.target.value)}
                          >
                            {WP_FIELD_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeQuickEditField(i, fi)}
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

      {/* Bulk Edit */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">Bulk Edit</h5>
            <span className="badge bg-secondary">{bulkEdits.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addBulkEdit}
          >
            <i className="fas fa-plus me-1" />
            Add Bulk Edit
          </button>
        </div>

        {bulkEdits.map((be, i) => (
          <Card
            key={i}
            title={be.postType || `Bulk Edit #${i + 1}`}
            onRemove={() => removeBulkEdit(i)}
            defaultOpen={true}
          >
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <AutocompleteInput
                  label="Post Type"
                  value={be.postType || ''}
                  onChange={(v) => setBulkEditData(i, 'postType', v)}
                  suggestions={postTypeSuggestions}
                  placeholder="event"
                />
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <strong className="small">Actions</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => addBulkEditAction(i)}
              >
                <i className="fas fa-plus me-1" />
                Add Action
              </button>
            </div>
            {(be.actions || []).length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr><th>Slug</th><th>Label</th><th style={{ width: 36 }}></th></tr>
                  </thead>
                  <tbody>
                    {be.actions.map((action, ai) => (
                      <tr key={ai}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={action.slug || ''}
                            onChange={(e) => setBulkEditActionData(i, ai, 'slug', e.target.value)}
                            placeholder="mark_featured"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={action.label || ''}
                            onChange={(e) => setBulkEditActionData(i, ai, 'label', e.target.value)}
                            placeholder="Mark as Featured"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeBulkEditAction(i, ai)}
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
              <p className="text-muted small mb-0">No actions yet.</p>
            )}
          </Card>
        ))}
      </div>

      {/* DB Tables */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">DB Tables</h5>
            <span className="badge bg-secondary">{tables.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addTable}
          >
            <i className="fas fa-plus me-1" />
            Add Table
          </button>
        </div>
        <p className="text-muted small mb-3">
          Custom database tables created on plugin activation.
        </p>

        {tables.map((table, i) => (
          <Card
            key={i}
            title={table.name || `Table #${i + 1}`}
            onRemove={() => removeTable(i)}
            defaultOpen={true}
          >
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small">Table Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={table.name || ''}
                    onChange={(e) => setTableData(i, 'name', e.target.value)}
                    placeholder="my_events"
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <strong className="small">Fields</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  const fields = [...(table.fields || []), { name: '', type: 'VARCHAR', length: '255', null: false, default: '' }];
                  setTableData(i, 'fields', fields);
                }}
              >
                <i className="fas fa-plus me-1" />
                Add Field
              </button>
            </div>
            {(table.fields || []).length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr><th>Name</th><th>Type</th><th>Length</th><th>Null</th><th>Default</th><th style={{ width: 36 }}></th></tr>
                  </thead>
                  <tbody>
                    {table.fields.map((field, fi) => (
                      <tr key={fi}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.name || ''}
                            onChange={(e) => {
                              const fields = [...table.fields];
                              fields[fi] = { ...fields[fi], name: e.target.value };
                              setTableData(i, 'fields', fields);
                            }}
                            placeholder="field_name"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.type || ''}
                            onChange={(e) => {
                              const fields = [...table.fields];
                              fields[fi] = { ...fields[fi], type: e.target.value };
                              setTableData(i, 'fields', fields);
                            }}
                            placeholder="VARCHAR"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.length || ''}
                            onChange={(e) => {
                              const fields = [...table.fields];
                              fields[fi] = { ...fields[fi], length: e.target.value };
                              setTableData(i, 'fields', fields);
                            }}
                            placeholder="255"
                            style={{ width: 60 }}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={!!field.null}
                            onChange={(e) => {
                              const fields = [...table.fields];
                              fields[fi] = { ...fields[fi], null: e.target.checked };
                              setTableData(i, 'fields', fields);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.default || ''}
                            onChange={(e) => {
                              const fields = [...table.fields];
                              fields[fi] = { ...fields[fi], default: e.target.value };
                              setTableData(i, 'fields', fields);
                            }}
                            placeholder="NULL"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              const fields = [...table.fields];
                              fields.splice(fi, 1);
                              setTableData(i, 'fields', fields);
                            }}
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
              <p className="text-muted small mb-0">No fields yet. An auto-increment ID will be added automatically.</p>
            )}
          </Card>
        ))}
      </div>

      {/* Screen Options */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">Screen Options</h5>
            <span className="badge bg-secondary">{screenOptions.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={addScreenOption}
          >
            <i className="fas fa-plus me-1" />
            Add Screen Option
          </button>
        </div>

        {screenOptions.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr><th>Screen ID</th><th>Option Key</th><th>Label</th><th>Default</th><th>Type</th><th style={{ width: 36 }}></th></tr>
              </thead>
              <tbody>
                {screenOptions.map((so, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={so.screen || ''}
                        onChange={(e) => setScreenOptionData(i, 'screen', e.target.value)}
                        placeholder="edit-event"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={so.option || ''}
                        onChange={(e) => setScreenOptionData(i, 'option', e.target.value)}
                        placeholder="em_per_page"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={so.label || ''}
                        onChange={(e) => setScreenOptionData(i, 'label', e.target.value)}
                        placeholder="Events per page"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={so.default || 20}
                        onChange={(e) => setScreenOptionData(i, 'default', parseInt(e.target.value, 10))}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={so.type || 'per_page'}
                        onChange={(e) => setScreenOptionData(i, 'type', e.target.value)}
                      >
                        {SCREEN_OPTION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeScreenOption(i)}
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
        {screenOptions.length === 0 && (
          <p className="text-muted small">No screen options yet.</p>
        )}
      </div>
    </div>
  );
}
