import React, { useState } from 'react';
import useStore from '../../store/useStore';
import ValidationWarnings from '../wizard/ValidationWarnings';

export default function Step11Review() {
  const state               = useStore((s) => s);
  const general             = useStore((s) => s.general);
  const cpts                = useStore((s) => s.cpts);
  const metaBoxes           = useStore((s) => s.metaBoxes);
  const restCallbacks       = useStore((s) => s.restCallbacks);
  const blocks              = useStore((s) => s.blocks);
  const emails              = useStore((s) => s.emails);
  const settingsGroups      = useStore((s) => s.settingsGroups);
  const exportConfig        = useStore((s) => s.exportConfig);
  const getValidationWarnings = useStore((s) => s.getValidationWarnings);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const warnings = getValidationWarnings();
  const hasErrors = warnings.some((w) => w.level === 'error');

  const handleGenerate = async () => {
    if (hasErrors) {
      setError('Please fix all errors before generating.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const [{ CodeBase }, JSZip, { saveAs }] = await Promise.all([
        import('../../codebase/index.js'),
        import('jszip'),
        import('file-saver'),
      ]);

      const ZipConstructor = JSZip.default || JSZip;
      const zip = new ZipConstructor();

      const pluginSlug = general.textDomain || 'my-plugin';

      // Helper to safely call generators
      const safe = (fn) => {
        try { return fn(); }
        catch (e) { console.warn('CodeBase error:', e); return `// Error generating this file: ${e.message}`; }
      };

      // ── Root config / tooling files ────────────────────────────────────────
      zip.file('.gitignore',     safe(() => CodeBase.gitIgnoreCode()));
      zip.file('.editorconfig',  safe(() => CodeBase.editorconfigCode()));
      zip.file('.phpcs.xml',     safe(() => CodeBase.phpcsCode()));
      zip.file('.eslintignore',  safe(() => CodeBase.eslintignoreCode()));
      zip.file('.eslintrc.js',   safe(() => CodeBase.eslintrcCode()));
      zip.file('.prettierrc',    safe(() => CodeBase.prettierrcCode()));
      zip.file('composer.json',  safe(() => CodeBase.composerCode(general)));
      zip.file('README.md',      safe(() => CodeBase.readmeCode(general)));

      // ── Main plugin file ───────────────────────────────────────────────────
      zip.file(`${pluginSlug}.php`, safe(() => CodeBase.mainPluginCode(general)));

      // ── Core includes ──────────────────────────────────────────────────────
      zip.file('includes/class-installer.php',      safe(() => CodeBase.installerCode(general, state.tables)));
      zip.file('includes/class-assets.php',         safe(() => CodeBase.assetsCode(general, state.assets)));
      zip.file('includes/class-menu.php',           safe(() => CodeBase.menuCode(general, state.tables, state.mainMenu)));
      zip.file('includes/class-form-error.php',     safe(() => CodeBase.formErrorCode(general)));
      zip.file('includes/functions.php',            safe(() => CodeBase.functionsCode(general, state.tables)));
      zip.file('includes/class-db-utils.php',       safe(() => CodeBase.dbUtilsCode(general)));
      zip.file('includes/class-request-utils.php',  safe(() => CodeBase.requestUtilsCode(general)));

      // ── Admin ──────────────────────────────────────────────────────────────
      zip.file('admin/class-admin.php',             safe(() => CodeBase.adminCode(general, state.tables)));
      zip.file('admin/class-frontend-shortcode.php',safe(() => CodeBase.frontendShortcode(general)));
      zip.file('admin/class-frontend.php',          safe(() => CodeBase.frontendCode(general)));

      // ── REST API (legacy) ──────────────────────────────────────────────────
      if (state.restapi && state.restapi.length > 0) {
        zip.file('includes/class-rest-api.php',     safe(() => CodeBase.apiCode(general, state.restapi)));
      }

      // ── CPTs ──────────────────────────────────────────────────────────────
      if (cpts.length > 0) {
        zip.file('includes/post-types/class-cpt.php', safe(() => CodeBase.cptCode(general, cpts)));
      }

      // ── Settings ──────────────────────────────────────────────────────────
      if (settingsGroups.length > 0) {
        zip.file('admin/class-settings.php',        safe(() => CodeBase.settingsCode(general, settingsGroups)));
      }

      // ── Options ───────────────────────────────────────────────────────────
      if (state.options && state.options.length > 0) {
        zip.file('includes/class-options.php',      safe(() => CodeBase.optionsCode(general, state.options)));
      }

      // ── Meta Boxes ────────────────────────────────────────────────────────
      if (metaBoxes.length > 0) {
        zip.file('admin/class-meta-boxes.php',      safe(() => CodeBase.metaBoxCode(general, metaBoxes)));
      }

      // ── Screen Options ────────────────────────────────────────────────────
      if (state.screenOptions && state.screenOptions.length > 0) {
        zip.file('admin/class-screen-options.php',  safe(() => CodeBase.screenOptionsCode(general, state.screenOptions)));
      }

      // ── REST Callbacks ────────────────────────────────────────────────────
      if (restCallbacks.length > 0) {
        zip.file('includes/rest/class-rest-callbacks.php', safe(() => CodeBase.restCallbackCode(general, restCallbacks)));
      }

      // ── User Fields ───────────────────────────────────────────────────────
      if (state.userFields && state.userFields.length > 0) {
        zip.file('admin/class-user-fields.php',     safe(() => CodeBase.userFieldsCode(general, state.userFields)));
      }

      // ── Term Fields ───────────────────────────────────────────────────────
      if (state.termFieldGroups && state.termFieldGroups.length > 0) {
        zip.file('admin/class-term-fields.php',     safe(() => CodeBase.termFieldsCode(general, state.termFieldGroups)));
      }

      // ── Quick Edit ────────────────────────────────────────────────────────
      if (state.quickEdits && state.quickEdits.length > 0) {
        zip.file('admin/class-quick-edit.php',      safe(() => CodeBase.quickEditCode(general, state.quickEdits)));
      }

      // ── Bulk Edit ─────────────────────────────────────────────────────────
      if (state.bulkEdits && state.bulkEdits.length > 0) {
        zip.file('admin/class-bulk-edit.php',       safe(() => CodeBase.bulkEditCode(general, state.bulkEdits)));
      }

      // ── Post REST Fields ──────────────────────────────────────────────────
      if (state.postRestFields && state.postRestFields.length > 0) {
        zip.file('includes/rest/class-post-rest-fields.php', safe(() => CodeBase.postRestFieldsCode(general, state.postRestFields)));
      }

      // ── Emails ────────────────────────────────────────────────────────────
      if (emails.length > 0) {
        zip.file('includes/class-emails.php',       safe(() => CodeBase.emailCode(general, emails)));
      }

      // ── Importers ─────────────────────────────────────────────────────────
      if (state.importers && state.importers.length > 0) {
        zip.file('includes/class-importers.php',    safe(() => CodeBase.importerCode(general, state.importers)));
      }

      // ── Blocks ────────────────────────────────────────────────────────────
      if (blocks.length > 0) {
        zip.file('src/blocks/blocks.php',            safe(() => CodeBase.blocksPhpCode(general, blocks)));
        zip.file('package.json',                     safe(() => CodeBase.blocksPackageJson(general)));
        zip.file('webpack.config.js',               safe(() => CodeBase.blocksWebpackConfig(general, blocks)));

        const blockFiles = safe(() => CodeBase.allBlockFiles(general, blocks));
        if (blockFiles && typeof blockFiles === 'object') {
          Object.entries(blockFiles).forEach(([filePath, content]) => {
            zip.file(filePath, content || '');
          });
        }
      }

      // ── DB Tables view files ───────────────────────────────────────────────
      if (state.tables && state.tables.length > 0) {
        state.tables.forEach((table) => {
          if (!table.name) return;
          const className = table.name.replace(/_/g, '-');
          zip.file(`admin/views/list-${className}.php`,  safe(() => CodeBase.adminViewCode('list',  general, table)));
          zip.file(`admin/views/edit-${className}.php`,  safe(() => CodeBase.adminViewCode('edit',  general, table)));
          zip.file(`admin/views/new-${className}.php`,   safe(() => CodeBase.adminViewCode('new',   general, table)));
          zip.file(`admin/class-list-table-${className}.php`, safe(() => CodeBase.listTableCode(className, general, table)));
          zip.file(`admin/class-dynamic-menu-${className}.php`, safe(() => CodeBase.dynamicMenuPageHandler(general, table)));
        });
      }

      // ── Include config JSON ────────────────────────────────────────────────
      zip.file('wp-plugin-config.json', exportConfig());

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${pluginSlug}.zip`);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate plugin: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportConfig = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${general.textDomain || 'wp-plugin'}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-rocket text-primary" />
        <h4 className="mb-0">Review &amp; Generate</h4>
      </div>
      <p className="text-muted small mb-4">
        Review your plugin configuration, then generate and download the ZIP.
      </p>

      {/* Summary stats */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'fa-layer-group',  label: 'Post Types',     count: cpts.length,          color: 'primary' },
          { icon: 'fa-table-cells',  label: 'Meta Boxes',     count: metaBoxes.length,     color: 'info' },
          { icon: 'fa-plug',         label: 'REST Endpoints', count: restCallbacks.length, color: 'success' },
          { icon: 'fa-puzzle-piece', label: 'Blocks',         count: blocks.length,        color: 'warning' },
          { icon: 'fa-envelope',     label: 'Emails',         count: emails.length,        color: 'danger' },
          { icon: 'fa-sliders',      label: 'Settings Groups',count: settingsGroups.length,color: 'secondary' },
        ].map(({ icon, label, count, color }) => (
          <div key={label} className="col-md-2 col-sm-4 col-6">
            <div className={`border border-${color} rounded text-center p-3`}>
              <div className={`text-${color} mb-1`}>
                <i className={`fas ${icon} fa-lg`} />
              </div>
              <div className="fw-bold fs-4">{count}</div>
              <div className="text-muted small">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Plugin info summary */}
      <div className="border rounded p-3 mb-4 bg-light">
        <h6 className="mb-2">
          <i className="fas fa-cog me-2" />
          {general.pluginName || 'Unnamed Plugin'}
          {general.version && (
            <span className="badge bg-secondary ms-2">{general.version}</span>
          )}
        </h6>
        <div className="row g-2 small text-muted">
          <div className="col-md-4">
            <strong>Text Domain:</strong> <code>{general.textDomain}</code>
          </div>
          <div className="col-md-4">
            <strong>Namespace:</strong> <code>{general.baseNamespace}</code>
          </div>
          <div className="col-md-4">
            <strong>Prefix:</strong> <code>{general.functionPrefix}</code>
          </div>
          {general.author && (
            <div className="col-md-4">
              <strong>Author:</strong> {general.author}
            </div>
          )}
          {general.license && (
            <div className="col-md-4">
              <strong>License:</strong> {general.license}
            </div>
          )}
        </div>
      </div>

      {/* Validation warnings panel */}
      <div className="mb-4">
        <h6 className="mb-2">
          <i className="fas fa-clipboard-check me-2" />
          Validation
        </h6>
        <ValidationWarnings />
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
          <i className="fas fa-exclamation-circle" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <button
          type="button"
          className="btn btn-success btn-lg wpg-generate-btn d-flex align-items-center gap-2"
          onClick={handleGenerate}
          disabled={generating || hasErrors}
          title={hasErrors ? 'Fix all errors before generating' : 'Generate and download plugin ZIP'}
        >
          {generating ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Building ZIP...
            </>
          ) : (
            <>
              <i className="fas fa-rocket" />
              Generate &amp; Download ZIP
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={handleExportConfig}
        >
          <i className="fas fa-download" />
          Export Config JSON
        </button>

        {hasErrors && (
          <span className="text-danger small">
            <i className="fas fa-exclamation-triangle me-1" />
            {warnings.filter((w) => w.level === 'error').length} error{warnings.filter((w) => w.level === 'error').length > 1 ? 's' : ''} must be fixed first
          </span>
        )}
      </div>
    </div>
  );
}
