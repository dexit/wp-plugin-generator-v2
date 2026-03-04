import React from 'react';
import useStore from '../../store/useStore';
import { WP_REST_METHODS, WP_CAPABILITIES } from '../../utils/wp-autocomplete';
import { toPascalCase } from '../../utils/helpers';
import Card from '../common/Card';
import AutocompleteInput from '../common/AutocompleteInput';
import TagsInput from '../common/TagsInput';
import ToggleInput from '../common/ToggleInput';
import SelectInput from '../common/SelectInput';

const PHP_TYPES = ['string', 'integer', 'number', 'boolean', 'array', 'object', 'null'];

export default function Step5Rest() {
  const restCallbacks        = useStore((s) => s.restCallbacks);
  const addRestCallback      = useStore((s) => s.addRestCallback);
  const removeRestCallback   = useStore((s) => s.removeRestCallback);
  const setRestCallbackData  = useStore((s) => s.setRestCallbackData);

  const postRestFields       = useStore((s) => s.postRestFields);
  const addPostRestField     = useStore((s) => s.addPostRestField);
  const removePostRestField  = useStore((s) => s.removePostRestField);
  const setPostRestFieldData = useStore((s) => s.setPostRestFieldData);

  const general              = useStore((s) => s.general);
  const getDefinedPostTypes  = useStore((s) => s.getDefinedPostTypes);

  const namespaceSuggestion = general.textDomain ? `${general.textDomain}/v1` : '';
  const namespaceSuggestions = namespaceSuggestion ? [namespaceSuggestion] : [];
  const postTypeSuggestions = getDefinedPostTypes();

  const set = (i) => (k) => (v) => setRestCallbackData(i, k, v);

  const handleRouteChange = (i, route) => {
    setRestCallbackData(i, 'route', route);
    // Auto-fill class name from route
    const cb = restCallbacks[i];
    if (!cb.className || cb.className === toPascalCase(cb.route || '') + '_Controller') {
      const baseName = route.replace(/\/\(\?P.*?\)/g, '').replace(/\//g, '_').replace(/^_/, '');
      setRestCallbackData(i, 'className', toPascalCase(baseName) + '_Controller');
    }
  };

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-plug text-primary" />
        <h4 className="mb-0">REST API</h4>
      </div>
      <p className="text-muted small mb-4">
        Define custom REST API endpoints and register additional REST fields on existing post types.
      </p>

      {/* REST Callbacks */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 mb-3">
          <h5 className="mb-0">REST Callbacks</h5>
          <span className="badge bg-secondary">{restCallbacks.length}</span>
        </div>

        {restCallbacks.length === 0 && (
          <div className="alert alert-secondary small mb-3">
            No REST callbacks defined. Click <strong>Add REST Callback</strong> below.
          </div>
        )}

        {restCallbacks.map((cb, i) => (
          <Card
            key={i}
            title={cb.route || cb.className || `Callback #${i + 1}`}
            badge={cb.namespace || ''}
            onRemove={() => removeRestCallback(i)}
            defaultOpen={true}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <AutocompleteInput
                  label="Namespace"
                  value={cb.namespace || ''}
                  onChange={set(i)('namespace')}
                  suggestions={namespaceSuggestions}
                  placeholder={namespaceSuggestion || 'my-plugin/v1'}
                  help={`Suggest: ${namespaceSuggestion || 'your-text-domain/v1'}`}
                />
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="wpg-label form-label">Route</label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={cb.route || ''}
                    onChange={(e) => handleRouteChange(i, e.target.value)}
                    placeholder="/events"
                  />
                  <div className="form-text">e.g. /events, /events/(?P&lt;id&gt;\d+)</div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="wpg-label form-label">
                    Class Name
                    <span className="badge bg-info text-dark ms-1" style={{ fontSize: '0.65rem' }}>auto</span>
                  </label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={cb.className || ''}
                    onChange={(e) => setRestCallbackData(i, 'className', e.target.value)}
                    placeholder="Events_Controller"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <AutocompleteInput
                  label="Capability"
                  value={cb.capability || ''}
                  onChange={set(i)('capability')}
                  suggestions={WP_CAPABILITIES}
                  placeholder="read"
                />
              </div>

              <div className="col-md-6">
                <TagsInput
                  label="Methods"
                  value={Array.isArray(cb.methods) ? cb.methods : []}
                  onChange={set(i)('methods')}
                  suggestions={WP_REST_METHODS}
                  placeholder="GET, POST..."
                />
              </div>
              <div className="col-md-6">
                <ToggleInput
                  label="Auth Required"
                  value={cb.authRequired}
                  onChange={set(i)('authRequired')}
                  description="Require authentication to access this endpoint"
                />
              </div>
            </div>
          </Card>
        ))}

        <button
          type="button"
          className="btn btn-outline-primary mt-2"
          onClick={addRestCallback}
        >
          <i className="fas fa-plus me-2" />
          Add REST Callback
        </button>
      </div>

      {/* Post REST Fields */}
      <div>
        <div className="d-flex align-items-center gap-2 mb-3">
          <h5 className="mb-0">Post REST Fields</h5>
          <span className="badge bg-secondary">{postRestFields.length}</span>
        </div>
        <p className="text-muted small mb-3">
          Register additional fields on post types in the REST API using{' '}
          <code>register_rest_field()</code>.
        </p>

        {postRestFields.length === 0 && (
          <div className="alert alert-secondary small mb-3">
            No post REST fields. Click <strong>Add Post REST Field</strong> below.
          </div>
        )}

        {postRestFields.map((field, i) => (
          <Card
            key={i}
            title={field.fieldName || `Field #${i + 1}`}
            badge={field.type || ''}
            onRemove={() => removePostRestField(i)}
            defaultOpen={true}
          >
            <div className="row g-3">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="wpg-label form-label">Field Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={field.fieldName || ''}
                    onChange={(e) => setPostRestFieldData(i, 'fieldName', e.target.value)}
                    placeholder="event_date"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <SelectInput
                  label="Type"
                  value={field.type || 'string'}
                  onChange={(v) => setPostRestFieldData(i, 'type', v)}
                  options={PHP_TYPES}
                />
              </div>
              <div className="col-md-4">
                <TagsInput
                  label="Post Types"
                  value={Array.isArray(field.postTypes) ? field.postTypes : []}
                  onChange={(v) => setPostRestFieldData(i, 'postTypes', v)}
                  suggestions={postTypeSuggestions}
                  placeholder="event, post..."
                />
              </div>
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="wpg-label form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={field.description || ''}
                    onChange={(e) => setPostRestFieldData(i, 'description', e.target.value)}
                    placeholder="Brief description of this field"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <ToggleInput
                  label="Read Only"
                  value={field.readonly}
                  onChange={(v) => setPostRestFieldData(i, 'readonly', v)}
                  description="No schema update callback"
                />
              </div>
            </div>
          </Card>
        ))}

        <button
          type="button"
          className="btn btn-outline-secondary mt-2"
          onClick={addPostRestField}
        >
          <i className="fas fa-plus me-2" />
          Add Post REST Field
        </button>
      </div>
    </div>
  );
}
