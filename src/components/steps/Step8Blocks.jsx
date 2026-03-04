import React from 'react';
import useStore from '../../store/useStore';
import { WP_DASHICONS } from '../../utils/wp-autocomplete';
import Card from '../common/Card';
import AutocompleteInput from '../common/AutocompleteInput';
import TagsInput from '../common/TagsInput';
import ToggleInput from '../common/ToggleInput';
import SelectInput from '../common/SelectInput';

const BLOCK_CATEGORIES = [
  { value: 'common', label: 'Common' },
  { value: 'text', label: 'Text' },
  { value: 'media', label: 'Media' },
  { value: 'design', label: 'Design' },
  { value: 'widgets', label: 'Widgets' },
  { value: 'theme', label: 'Theme' },
  { value: 'embed', label: 'Embed' },
];

const ATTR_TYPES = ['string', 'number', 'boolean', 'array', 'object'];

export default function Step8Blocks() {
  const blocks          = useStore((s) => s.blocks);
  const addBlock        = useStore((s) => s.addBlock);
  const removeBlock     = useStore((s) => s.removeBlock);
  const setBlockData    = useStore((s) => s.setBlockData);
  const addBlockAttr    = useStore((s) => s.addBlockAttr);
  const removeBlockAttr = useStore((s) => s.removeBlockAttr);
  const setBlockAttrData = useStore((s) => s.setBlockAttrData);

  const set = (i) => (k) => (v) => setBlockData(i, k, v);

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-puzzle-piece text-primary" />
        <h4 className="mb-0">Gutenberg Blocks</h4>
      </div>

      <div className="alert alert-info d-flex align-items-start gap-2 mb-4 py-2">
        <i className="fas fa-info-circle mt-1" />
        <div className="small">
          Blocks are built with <code>@wordpress/scripts</code>. Each block gets its own
          directory under <code>src/blocks/</code> with <code>block.json</code>,{' '}
          <code>index.js</code>, <code>edit.js</code>, and <code>save.js</code> (or a
          PHP render callback for dynamic blocks).
        </div>
      </div>

      {blocks.length === 0 && (
        <div className="alert alert-secondary small mb-3">
          No blocks defined yet. Click <strong>Add Block</strong> below.
        </div>
      )}

      {blocks.map((block, i) => (
        <Card
          key={i}
          title={block.title || block.name || `Block #${i + 1}`}
          badge={block.category || ''}
          onRemove={() => removeBlock(i)}
          defaultOpen={true}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`block-name-${i}`}>
                  Slug (name) <span className="text-danger">*</span>
                </label>
                <input
                  id={`block-name-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={block.name || ''}
                  onChange={(e) => set(i)('name')(e.target.value)}
                  placeholder="event-card"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`block-title-${i}`}>
                  Title
                </label>
                <input
                  id={`block-title-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={block.title || ''}
                  onChange={(e) => set(i)('title')(e.target.value)}
                  placeholder="Event Card"
                />
              </div>
            </div>
            <div className="col-md-4">
              <SelectInput
                id={`block-cat-${i}`}
                label="Category"
                value={block.category || 'common'}
                onChange={set(i)('category')}
                options={BLOCK_CATEGORIES}
              />
            </div>

            <div className="col-md-6">
              <AutocompleteInput
                id={`block-icon-${i}`}
                label="Icon"
                value={block.icon || ''}
                onChange={set(i)('icon')}
                suggestions={WP_DASHICONS}
                placeholder="dashicons-calendar-alt"
              />
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="wpg-label form-label">Description</label>
                <input
                  type="text"
                  className="wpg-input form-control"
                  value={block.description || ''}
                  onChange={(e) => set(i)('description')(e.target.value)}
                  placeholder="Displays a single event card."
                />
              </div>
            </div>

            <div className="col-md-6">
              <TagsInput
                label="Keywords"
                value={
                  typeof block.keywords === 'string'
                    ? block.keywords.split(',').map((k) => k.trim()).filter(Boolean)
                    : (Array.isArray(block.keywords) ? block.keywords : [])
                }
                onChange={(tags) => set(i)('keywords')(tags.join(', '))}
                placeholder="event, card..."
              />
            </div>
            <div className="col-md-6">
              <div className="pt-2">
                <ToggleInput
                  label="Dynamic Block"
                  value={block.dynamic}
                  onChange={set(i)('dynamic')}
                  description="Rendered server-side via PHP callback"
                />
              </div>
            </div>

            {/* Supports */}
            <div className="col-12">
              <label className="wpg-label form-label d-block mb-2">Supports</label>
              <div className="row g-2">
                {[
                  { key: 'supportsAnchor',    label: 'Anchor' },
                  { key: 'supportsAlign',     label: 'Align' },
                  { key: 'supportsColor',     label: 'Color' },
                  { key: 'supportsTypo',      label: 'Typography' },
                  { key: 'supportsSpacing',   label: 'Spacing' },
                  { key: 'supportsClassName', label: 'Class Name' },
                ].map(({ key, label }) => (
                  <div key={key} className="col-md-2 col-sm-4 col-6">
                    <ToggleInput
                      label={label}
                      value={block[key]}
                      onChange={set(i)(key)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Attributes */}
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <strong className="small">Attributes</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => addBlockAttr(i)}
                >
                  <i className="fas fa-plus me-1" />
                  Add Attribute
                </button>
              </div>
              {(block.attributes || []).length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th style={{ width: 36 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {block.attributes.map((attr, ai) => (
                        <tr key={ai}>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={attr.name || ''}
                              onChange={(e) => setBlockAttrData(i, ai, 'name', e.target.value)}
                              placeholder="eventId"
                            />
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={attr.type || 'string'}
                              onChange={(e) => setBlockAttrData(i, ai, 'type', e.target.value)}
                            >
                              {ATTR_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={attr.default || ''}
                              onChange={(e) => setBlockAttrData(i, ai, 'default', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeBlockAttr(i, ai)}
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
                <p className="text-muted small mb-0">No attributes yet.</p>
              )}
            </div>
          </div>
        </Card>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary mt-2"
        onClick={addBlock}
      >
        <i className="fas fa-plus me-2" />
        Add Block
      </button>
    </div>
  );
}
