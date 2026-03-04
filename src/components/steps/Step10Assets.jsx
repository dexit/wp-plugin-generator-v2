import React from 'react';
import useStore from '../../store/useStore';
import { WP_CAPABILITIES } from '../../utils/wp-autocomplete';
import AutocompleteInput from '../common/AutocompleteInput';
import ToggleInput from '../common/ToggleInput';

export default function Step10Assets() {
  const mainMenu   = useStore((s) => s.mainMenu);
  const setMainMenu = useStore((s) => s.setMainMenu);
  const assets     = useStore((s) => s.assets);
  const setAssets  = useStore((s) => s.setAssets);

  const css = assets.css || [];
  const js  = assets.js  || [];

  const addCss = () => setAssets({ ...assets, css: [...css, { handle: '', src: '', deps: '', version: '', media: 'all' }] });
  const removeCss = (i) => setAssets({ ...assets, css: css.filter((_, idx) => idx !== i) });
  const setCss = (i, k, v) => {
    const next = css.map((item, idx) => idx === i ? { ...item, [k]: v } : item);
    setAssets({ ...assets, css: next });
  };

  const addJs = () => setAssets({ ...assets, js: [...js, { handle: '', src: '', deps: '', version: '', in_footer: true }] });
  const removeJs = (i) => setAssets({ ...assets, js: js.filter((_, idx) => idx !== i) });
  const setJs = (i, k, v) => {
    const next = js.map((item, idx) => idx === i ? { ...item, [k]: v } : item);
    setAssets({ ...assets, js: next });
  };

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-palette text-primary" />
        <h4 className="mb-0">Assets &amp; Menu</h4>
      </div>
      <p className="text-muted small mb-4">
        Configure the admin menu entry and enqueue CSS/JS assets.
      </p>

      {/* Admin Menu */}
      <div className="mb-5">
        <h5 className="mb-3">Admin Menu</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="wpg-label form-label" htmlFor="menu-title">
                Menu Title
              </label>
              <input
                id="menu-title"
                type="text"
                className="wpg-input form-control"
                value={mainMenu.menuTitle || ''}
                onChange={(e) => setMainMenu('menuTitle', e.target.value)}
                placeholder="My Plugin"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="wpg-label form-label" htmlFor="page-title">
                Page Title
              </label>
              <input
                id="page-title"
                type="text"
                className="wpg-input form-control"
                value={mainMenu.pageTitle || ''}
                onChange={(e) => setMainMenu('pageTitle', e.target.value)}
                placeholder="My Plugin Settings"
              />
            </div>
          </div>
          <div className="col-md-6">
            <AutocompleteInput
              id="menu-capability"
              label="Capability"
              value={mainMenu.capability || ''}
              onChange={(v) => setMainMenu('capability', v)}
              suggestions={WP_CAPABILITIES}
              placeholder="manage_options"
            />
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="wpg-label form-label" htmlFor="menu-slug">
                Page Slug
              </label>
              <input
                id="menu-slug"
                type="text"
                className="wpg-input form-control"
                value={mainMenu.pageSlug || ''}
                onChange={(e) => setMainMenu('pageSlug', e.target.value)}
                placeholder="my-plugin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Assets */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">CSS Assets</h5>
            <span className="badge bg-secondary">{css.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addCss}
          >
            <i className="fas fa-plus me-1" />
            Add CSS
          </button>
        </div>

        {css.length === 0 && (
          <p className="text-muted small">No CSS assets defined.</p>
        )}

        {css.map((item, i) => (
          <div key={i} className="border rounded p-3 mb-2 bg-light">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge bg-primary">{item.handle || `css-${i + 1}`}</span>
              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0"
                onClick={() => removeCss(i)}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="row g-2">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.handle || ''}
                  onChange={(e) => setCss(i, 'handle', e.target.value)}
                  placeholder="Handle (slug)"
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.src || ''}
                  onChange={(e) => setCss(i, 'src', e.target.value)}
                  placeholder="URL or plugin-relative path"
                />
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.deps || ''}
                  onChange={(e) => setCss(i, 'deps', e.target.value)}
                  placeholder="Deps (comma)"
                />
              </div>
              <div className="col-md-1">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.version || ''}
                  onChange={(e) => setCss(i, 'version', e.target.value)}
                  placeholder="Ver"
                />
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.media || 'all'}
                  onChange={(e) => setCss(i, 'media', e.target.value)}
                  placeholder="Media"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* JS Assets */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">JS Assets</h5>
            <span className="badge bg-secondary">{js.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addJs}
          >
            <i className="fas fa-plus me-1" />
            Add JS
          </button>
        </div>

        {js.length === 0 && (
          <p className="text-muted small">No JS assets defined.</p>
        )}

        {js.map((item, i) => (
          <div key={i} className="border rounded p-3 mb-2 bg-light">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge bg-warning text-dark">{item.handle || `js-${i + 1}`}</span>
              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0"
                onClick={() => removeJs(i)}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.handle || ''}
                  onChange={(e) => setJs(i, 'handle', e.target.value)}
                  placeholder="Handle (slug)"
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.src || ''}
                  onChange={(e) => setJs(i, 'src', e.target.value)}
                  placeholder="URL or plugin-relative path"
                />
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.deps || ''}
                  onChange={(e) => setJs(i, 'deps', e.target.value)}
                  placeholder="Deps (comma)"
                />
              </div>
              <div className="col-md-1">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.version || ''}
                  onChange={(e) => setJs(i, 'version', e.target.value)}
                  placeholder="Ver"
                />
              </div>
              <div className="col-md-2">
                <ToggleInput
                  label="In Footer"
                  value={item.in_footer}
                  onChange={(v) => setJs(i, 'in_footer', v)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
