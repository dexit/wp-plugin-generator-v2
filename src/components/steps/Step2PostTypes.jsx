import React from 'react';
import useStore from '../../store/useStore';
import { toSlug, toPascalCase } from '../../utils/helpers';
import { WP_DASHICONS, WP_POST_SUPPORTS } from '../../utils/wp-autocomplete';
import Card from '../common/Card';
import AutocompleteInput from '../common/AutocompleteInput';
import TagsInput from '../common/TagsInput';
import ToggleInput from '../common/ToggleInput';
import SelectInput from '../common/SelectInput';

const CAPABILITY_TYPE_OPTIONS = ['post', 'page'];

export default function Step2PostTypes() {
  const cpts                 = useStore((s) => s.cpts);
  const addCpt               = useStore((s) => s.addCpt);
  const removeCpt            = useStore((s) => s.removeCpt);
  const setCptData           = useStore((s) => s.setCptData);
  const getDefinedTaxonomies = useStore((s) => s.getDefinedTaxonomies);

  const definedTaxonomies = getDefinedTaxonomies();
  const taxonomySuggestions = [
    'category', 'post_tag',
    ...definedTaxonomies.filter((t) => !['category', 'post_tag', 'nav_menu', 'link_category', 'post_format'].includes(t)),
  ];

  const set = (i) => (key) => (val) => setCptData(i, key, val);

  const handleSingularChange = (i, singular) => {
    const slug = toSlug(singular);
    const className = toPascalCase(singular) + '_CPT';
    setCptData(i, 'singular', singular);
    if (!cpts[i].postType || cpts[i].postType === toSlug(cpts[i].singular || '')) {
      setCptData(i, 'postType', slug);
    }
    if (!cpts[i].urlSlug || cpts[i].urlSlug === toSlug(cpts[i].singular || '') + 's') {
      setCptData(i, 'urlSlug', slug + 's');
    }
    if (!cpts[i].plural || cpts[i].plural === (cpts[i].singular || '') + 's') {
      setCptData(i, 'plural', singular + 's');
    }
    if (!cpts[i].className || cpts[i].className === toPascalCase(cpts[i].singular || '') + '_CPT') {
      setCptData(i, 'className', className);
    }
  };

  const handlePostTypeChange = (i, val) => {
    setCptData(i, 'postType', toSlug(val));
  };

  const handleTaxonomiesChange = (i, tags) => {
    setCptData(i, 'taxonomies', tags.join(','));
  };

  const getTaxonomyTags = (cpt) => {
    if (!cpt.taxonomies) return [];
    return cpt.taxonomies.split(',').map((t) => t.trim()).filter(Boolean);
  };

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-layer-group text-primary" />
        <h4 className="mb-0">Custom Post Types</h4>
      </div>
      <p className="text-muted small mb-3">
        Define Custom Post Types (CPTs) for your plugin.
        Taxonomy suggestions include category/post_tag + any you have already defined.
      </p>

      {cpts.length === 0 && (
        <div className="alert alert-info d-flex align-items-start gap-3 mb-4">
          <i className="fas fa-info-circle mt-1 text-info" />
          <div>
            <strong>No post types yet.</strong>
            <div className="small mt-1">
              Click <em>Add Post Type</em> below to create your first CPT, or load the{' '}
              <strong>Preset</strong> from the toolbar for a full example.
            </div>
          </div>
        </div>
      )}

      {cpts.map((cpt, i) => (
        <Card
          key={i}
          title={cpt.singular || cpt.postType || `Post Type #${i + 1}`}
          badge={cpt.postType || ''}
          onRemove={() => removeCpt(i)}
          defaultOpen={true}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`cpt-singular-${i}`}>
                  Singular Label <span className="text-danger">*</span>
                </label>
                <input
                  id={`cpt-singular-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={cpt.singular || ''}
                  onChange={(e) => handleSingularChange(i, e.target.value)}
                  placeholder="Event"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`cpt-plural-${i}`}>
                  Plural Label
                </label>
                <input
                  id={`cpt-plural-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={cpt.plural || ''}
                  onChange={(e) => set(i)('plural')(e.target.value)}
                  placeholder="Events"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`cpt-posttype-${i}`}>
                  Post Type Slug <span className="text-danger">*</span>
                </label>
                <input
                  id={`cpt-posttype-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={cpt.postType || ''}
                  onChange={(e) => handlePostTypeChange(i, e.target.value)}
                  placeholder="event"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`cpt-desc-${i}`}>
                  Description
                </label>
                <textarea
                  id={`cpt-desc-${i}`}
                  className="wpg-input form-control"
                  value={cpt.description || ''}
                  onChange={(e) => set(i)('description')(e.target.value)}
                  rows={2}
                  placeholder="What this post type represents."
                />
              </div>
            </div>

            <div className="col-md-6">
              <AutocompleteInput
                id={`cpt-icon-${i}`}
                label="Menu Icon"
                value={cpt.menuIcon || ''}
                onChange={set(i)('menuIcon')}
                suggestions={WP_DASHICONS}
                placeholder="dashicons-admin-post"
              />
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`cpt-menupos-${i}`}>
                  Menu Position
                </label>
                <input
                  id={`cpt-menupos-${i}`}
                  type="number"
                  className="wpg-input form-control"
                  value={cpt.menuPosition || ''}
                  onChange={(e) => set(i)('menuPosition')(e.target.value)}
                  placeholder="5"
                  min={1}
                />
              </div>
            </div>
            <div className="col-md-3">
              <SelectInput
                id={`cpt-captype-${i}`}
                label="Capability Type"
                value={cpt.capabilityType || 'post'}
                onChange={set(i)('capabilityType')}
                options={CAPABILITY_TYPE_OPTIONS}
              />
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`cpt-urlslug-${i}`}>
                  URL Slug
                  <span className="badge bg-info text-dark ms-1" style={{ fontSize: '0.65rem' }}>auto</span>
                </label>
                <input
                  id={`cpt-urlslug-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={cpt.urlSlug || ''}
                  onChange={(e) => set(i)('urlSlug')(e.target.value)}
                  placeholder="events"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="wpg-label form-label" htmlFor={`cpt-classname-${i}`}>
                  Class Name
                  <span className="badge bg-info text-dark ms-1" style={{ fontSize: '0.65rem' }}>auto</span>
                </label>
                <input
                  id={`cpt-classname-${i}`}
                  type="text"
                  className="wpg-input form-control"
                  value={cpt.className || ''}
                  onChange={(e) => set(i)('className')(e.target.value)}
                  placeholder="Event_CPT"
                />
              </div>
            </div>

            <div className="col-md-6">
              <TagsInput
                label="Supports"
                value={Array.isArray(cpt.supports) ? cpt.supports : (cpt.supports ? cpt.supports.split(',').map(s => s.trim()) : [])}
                onChange={set(i)('supports')}
                suggestions={WP_POST_SUPPORTS}
                placeholder="title, editor..."
              />
            </div>
            <div className="col-md-6">
              <TagsInput
                label="Taxonomies"
                value={getTaxonomyTags(cpt)}
                onChange={(tags) => handleTaxonomiesChange(i, tags)}
                suggestions={taxonomySuggestions}
                placeholder="category, post_tag..."
                help="Suggestions from category/post_tag + any you've already defined"
              />
            </div>

            <div className="col-12">
              <div className="row g-2">
                <div className="col-md-3">
                  <ToggleInput label="Show in REST" value={cpt.showInRest} onChange={set(i)('showInRest')} />
                </div>
                <div className="col-md-3">
                  <ToggleInput label="Has Archive" value={cpt.hasArchive} onChange={set(i)('hasArchive')} />
                </div>
                <div className="col-md-3">
                  <ToggleInput label="Hierarchical" value={cpt.hierarchical} onChange={set(i)('hierarchical')} />
                </div>
                <div className="col-md-3">
                  <ToggleInput label="Is Public" value={cpt.isPublic} onChange={set(i)('isPublic')} />
                </div>
                <div className="col-md-3">
                  <ToggleInput label="Block Template" value={cpt.blockTemplate} onChange={set(i)('blockTemplate')} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary mt-2"
        onClick={addCpt}
      >
        <i className="fas fa-plus me-2" />
        Add Post Type
      </button>
    </div>
  );
}
