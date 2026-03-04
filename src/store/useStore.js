/**
 * Central Zustand store for WP Plugin Generator.
 *
 * Features:
 *  - Full plugin config state (general, CPTs, settings, REST, blocks, etc.)
 *  - localStorage persistence (auto-save + restore)
 *  - Undo/redo history (50-step stack)
 *  - Import / export as JSON
 *  - Cross-section context helpers (what CPTs exist, etc.)
 *  - Validation (known required settings)
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { temporal } from 'zundo';

// ─── Default state ──────────────────────────────────────────────────────────

export const DEFAULT_STATE = {
  // Wizard
  currentStep: 0,

  // ── General ──────────────────────────────────────────────────────────────
  general: {
    pluginName:      'My Plugin',
    pluginURI:       'https://example.com',
    description:     'A WordPress plugin.',
    version:         '1.0.0',
    author:          'Your Name',
    authorURI:       'https://example.com',
    authorEmail:     'you@example.com',
    license:         'GPL-2.0-or-later',
    licenseURI:      'https://www.gnu.org/licenses/gpl-2.0.html',
    textDomain:      'my-plugin',
    domainPath:      '/languages',
    mainClassName:   'MyPlugin',
    baseNamespace:   'MyPlugin',
    constantPrefix:  'MY_PLUGIN',
    functionPrefix:  'my_plugin',
  },

  // ── Tables (DB) ───────────────────────────────────────────────────────────
  tables: [],

  // ── Main menu ─────────────────────────────────────────────────────────────
  mainMenu: {
    menuTitle:  '',
    pageTitle:  '',
    capability: 'manage_options',
    pageSlug:   '',
  },

  // ── Assets ────────────────────────────────────────────────────────────────
  assets: { css: [], js: [] },

  // ── REST API (original legacy section) ────────────────────────────────────
  restapi: [],

  // ── CPTs ─────────────────────────────────────────────────────────────────
  cpts: [],

  // ── Settings ─────────────────────────────────────────────────────────────
  settingsGroups: [],

  // ── Options ──────────────────────────────────────────────────────────────
  options: [],

  // ── Meta Boxes ────────────────────────────────────────────────────────────
  metaBoxes: [],

  // ── Screen Options ────────────────────────────────────────────────────────
  screenOptions: [],

  // ── REST Callbacks ────────────────────────────────────────────────────────
  restCallbacks: [],

  // ── User Fields ──────────────────────────────────────────────────────────
  userFields: [],

  // ── Term Field Groups ─────────────────────────────────────────────────────
  termFieldGroups: [],

  // ── Quick Edit ────────────────────────────────────────────────────────────
  quickEdits: [],

  // ── Bulk Edit ─────────────────────────────────────────────────────────────
  bulkEdits: [],

  // ── Post REST Fields ──────────────────────────────────────────────────────
  postRestFields: [],

  // ── Emails ───────────────────────────────────────────────────────────────
  emails: [],

  // ── Importers ─────────────────────────────────────────────────────────────
  importers: [],

  // ── Blocks ────────────────────────────────────────────────────────────────
  blocks: [],
};

// ─── Validation helpers ─────────────────────────────────────────────────────

/**
 * Return array of validation warnings for the current state.
 * Each warning: { id, level: 'error'|'warning', section, message, fix }
 *
 * @param {Object} state
 * @returns {Array}
 */
export const validateState = (state) => {
  const warnings = [];
  const g = state.general;

  // General
  if (!g.pluginName) warnings.push({ id: 'gen-name', level: 'error', section: 'General', message: 'Plugin name is required.', fix: 'Add a plugin name in General settings.' });
  if (!g.textDomain) warnings.push({ id: 'gen-td', level: 'error', section: 'General', message: 'Text domain is required for i18n.', fix: 'Set a text domain in General settings.' });
  if (!g.baseNamespace) warnings.push({ id: 'gen-ns', level: 'error', section: 'General', message: 'PHP namespace is required.', fix: 'Set Base Namespace in General settings.' });

  // CPTs: every CPT should have a label
  state.cpts.forEach((cpt, i) => {
    if (!cpt.postType) warnings.push({ id: `cpt-${i}-type`, level: 'error', section: 'CPTs', message: `CPT #${i + 1} is missing a post type key.`, fix: 'Set a lowercase slug (e.g. "event").' });
    if (!cpt.singular) warnings.push({ id: `cpt-${i}-sing`, level: 'warning', section: 'CPTs', message: `CPT #${i + 1} is missing a singular label.`, fix: 'Add a singular name (e.g. "Event").' });
    // Suggest REST endpoint if CPT has rest: true but no REST callback
    if (cpt.showInRest) {
      const hasEndpoint = state.restCallbacks.some((r) => r.route && r.route.includes(cpt.postType));
      if (!hasEndpoint) warnings.push({ id: `cpt-${i}-rest`, level: 'warning', section: 'REST', message: `CPT "${cpt.postType}" is public in REST but has no custom REST endpoint.`, fix: 'Add a REST callback for this post type.' });
    }
  });

  // Settings: every group needs a page slug
  state.settingsGroups.forEach((g, i) => {
    if (!g.pageSlug) warnings.push({ id: `sg-${i}-slug`, level: 'warning', section: 'Settings', message: `Settings group #${i + 1} has no page slug.`, fix: 'Add a page slug to register the settings page.' });
    if (!g.capability) warnings.push({ id: `sg-${i}-cap`, level: 'warning', section: 'Settings', message: `Settings group #${i + 1} has no capability set.`, fix: 'Set a capability (e.g. manage_options).' });
  });

  // Meta boxes: need post types
  state.metaBoxes.forEach((mb, i) => {
    if (!mb.id) warnings.push({ id: `mb-${i}-id`, level: 'error', section: 'Meta Boxes', message: `Meta box #${i + 1} has no ID.`, fix: 'Set a unique ID.' });
    if (!mb.postTypes || mb.postTypes.length === 0) warnings.push({ id: `mb-${i}-pt`, level: 'warning', section: 'Meta Boxes', message: `Meta box "${mb.id || i + 1}" has no post types assigned.`, fix: 'Assign at least one post type.' });
  });

  // REST callbacks: need namespace + route + at least one method
  state.restCallbacks.forEach((r, i) => {
    if (!r.namespace) warnings.push({ id: `rc-${i}-ns`, level: 'error', section: 'REST Callbacks', message: `REST callback #${i + 1} has no namespace.`, fix: `Use your plugin slug, e.g. "${state.general.textDomain}/v1".` });
    if (!r.route) warnings.push({ id: `rc-${i}-route`, level: 'error', section: 'REST Callbacks', message: `REST callback #${i + 1} has no route.`, fix: 'Add a route like "/items".' });
  });

  // Blocks: every block needs a name
  state.blocks.forEach((b, i) => {
    if (!b.name) warnings.push({ id: `bl-${i}-name`, level: 'error', section: 'Blocks', message: `Block #${i + 1} has no slug.`, fix: 'Add a block name slug (e.g. "hero-section").' });
  });

  return warnings;
};

// ─── Context helpers ─────────────────────────────────────────────────────────

/**
 * Get all post type slugs currently defined (built-ins + user CPTs).
 *
 * @param {Object} state
 * @returns {string[]}
 */
export const getDefinedPostTypes = (state) => [
  'post', 'page', 'attachment', 'revision', 'nav_menu_item', 'custom_css', 'customize_changeset',
  ...state.cpts.map((c) => c.postType).filter(Boolean),
];

/**
 * Get all taxonomy slugs currently defined.
 *
 * @param {Object} state
 * @returns {string[]}
 */
export const getDefinedTaxonomies = (state) => [
  'category', 'post_tag', 'nav_menu', 'link_category', 'post_format',
  ...state.cpts.flatMap((c) => (c.taxonomies || '').split(',').map((t) => t.trim())).filter(Boolean),
];

/**
 * Get all settings page slugs.
 *
 * @param {Object} state
 * @returns {string[]}
 */
export const getDefinedSettingsPages = (state) =>
  state.settingsGroups.map((s) => s.pageSlug).filter(Boolean);

// ─── Store ───────────────────────────────────────────────────────────────────

const STORE_KEY = 'wpgen_v2';

const createStore = () =>
  create(
    persist(
      temporal(
        immer((set, get) => ({
          ...DEFAULT_STATE,

          // ── Wizard ─────────────────────────────────────────────────────────
          setStep: (step) => set((s) => { s.currentStep = step; }),
          nextStep: () => set((s) => { s.currentStep = Math.min(s.currentStep + 1, WIZARD_STEPS.length - 1); }),
          prevStep: () => set((s) => { s.currentStep = Math.max(s.currentStep - 1, 0); }),

          // ── General ────────────────────────────────────────────────────────
          setGeneral: (key, value) => set((s) => { s.general[key] = value; }),
          setGeneralBulk: (obj) => set((s) => { Object.assign(s.general, obj); }),

          // ── Main Menu ──────────────────────────────────────────────────────
          setMainMenu: (key, value) => set((s) => { s.mainMenu[key] = value; }),

          // ── Assets ─────────────────────────────────────────────────────────
          setAssets: (assets) => set((s) => { s.assets = assets; }),

          // ── Tables ─────────────────────────────────────────────────────────
          addTable: () => set((s) => { s.tables.push({ name: '', fields: [], restapi: [], settings: {} }); }),
          removeTable: (i) => set((s) => { s.tables.splice(i, 1); }),
          setTableData: (i, key, value) => set((s) => { s.tables[i][key] = value; }),

          // ── REST API (legacy) ──────────────────────────────────────────────
          addRestapi: () => set((s) => { s.restapi.push({ namespace: '', route: '', methods: [], fields: [] }); }),
          removeRestapi: (i) => set((s) => { s.restapi.splice(i, 1); }),
          setRestapiData: (i, key, value) => set((s) => { s.restapi[i][key] = value; }),

          // ── CPTs ───────────────────────────────────────────────────────────
          addCpt: () => set((s) => {
            s.cpts.push({
              postType: '', singular: '', plural: '', description: '',
              menuIcon: 'dashicons-admin-post', menuPosition: '',
              capabilityType: 'post', urlSlug: '', className: '',
              showInRest: true, hasArchive: false, hierarchical: false, isPublic: true,
              supports: ['title', 'editor'], taxonomies: '',
              blockTemplate: false,
            });
          }),
          removeCpt: (i) => set((s) => { s.cpts.splice(i, 1); }),
          setCptData: (i, key, value) => set((s) => { s.cpts[i][key] = value; }),

          // ── Settings ───────────────────────────────────────────────────────
          addSettingsGroup: () => set((s) => {
            s.settingsGroups.push({ groupId: '', title: '', pageSlug: '', capability: 'manage_options', sections: [] });
          }),
          removeSettingsGroup: (i) => set((s) => { s.settingsGroups.splice(i, 1); }),
          setSettingsGroupData: (i, key, value) => set((s) => { s.settingsGroups[i][key] = value; }),
          addSettingsSection: (gi) => set((s) => {
            s.settingsGroups[gi].sections.push({ id: '', title: '', description: '', fields: [] });
          }),
          removeSettingsSection: (gi, si) => set((s) => { s.settingsGroups[gi].sections.splice(si, 1); }),
          setSettingsSectionData: (gi, si, key, value) => set((s) => { s.settingsGroups[gi].sections[si][key] = value; }),
          addSettingsField: (gi, si) => set((s) => {
            s.settingsGroups[gi].sections[si].fields.push({ id: '', label: '', type: 'text', default: '', description: '' });
          }),
          removeSettingsField: (gi, si, fi) => set((s) => { s.settingsGroups[gi].sections[si].fields.splice(fi, 1); }),
          setSettingsFieldData: (gi, si, fi, key, value) => set((s) => { s.settingsGroups[gi].sections[si].fields[fi][key] = value; }),

          // ── Options ────────────────────────────────────────────────────────
          addOption: () => set((s) => { s.options.push({ key: '', type: 'text', default: '', description: '', autoload: true }); }),
          removeOption: (i) => set((s) => { s.options.splice(i, 1); }),
          setOptionData: (i, key, value) => set((s) => { s.options[i][key] = value; }),

          // ── Meta Boxes ─────────────────────────────────────────────────────
          addMetaBox: () => set((s) => {
            s.metaBoxes.push({ id: '', title: '', postTypes: [], context: 'normal', priority: 'default', fields: [] });
          }),
          removeMetaBox: (i) => set((s) => { s.metaBoxes.splice(i, 1); }),
          setMetaBoxData: (i, key, value) => set((s) => { s.metaBoxes[i][key] = value; }),
          addMetaBoxField: (i) => set((s) => {
            s.metaBoxes[i].fields.push({ key: '', label: '', type: 'text', description: '' });
          }),
          removeMetaBoxField: (i, fi) => set((s) => { s.metaBoxes[i].fields.splice(fi, 1); }),
          setMetaBoxFieldData: (i, fi, key, value) => set((s) => { s.metaBoxes[i].fields[fi][key] = value; }),

          // ── Screen Options ─────────────────────────────────────────────────
          addScreenOption: () => set((s) => {
            s.screenOptions.push({ screen: '', option: '', label: '', default: 20, type: 'per_page' });
          }),
          removeScreenOption: (i) => set((s) => { s.screenOptions.splice(i, 1); }),
          setScreenOptionData: (i, key, value) => set((s) => { s.screenOptions[i][key] = value; }),

          // ── REST Callbacks ─────────────────────────────────────────────────
          addRestCallback: () => set((s) => {
            s.restCallbacks.push({
              namespace: '', route: '', className: '',
              methods: ['GET'], capability: 'read', authRequired: true,
            });
          }),
          removeRestCallback: (i) => set((s) => { s.restCallbacks.splice(i, 1); }),
          setRestCallbackData: (i, key, value) => set((s) => { s.restCallbacks[i][key] = value; }),

          // ── User Fields ────────────────────────────────────────────────────
          addUserField: () => set((s) => {
            s.userFields.push({ key: '', label: '', type: 'text', section: '', description: '' });
          }),
          removeUserField: (i) => set((s) => { s.userFields.splice(i, 1); }),
          setUserFieldData: (i, key, value) => set((s) => { s.userFields[i][key] = value; }),

          // ── Term Fields ────────────────────────────────────────────────────
          addTermFieldGroup: () => set((s) => {
            s.termFieldGroups.push({ taxonomy: '', fields: [] });
          }),
          removeTermFieldGroup: (i) => set((s) => { s.termFieldGroups.splice(i, 1); }),
          setTermFieldGroupData: (i, key, value) => set((s) => { s.termFieldGroups[i][key] = value; }),
          addTermField: (gi) => set((s) => {
            s.termFieldGroups[gi].fields.push({ key: '', label: '', type: 'text', description: '' });
          }),
          removeTermField: (gi, fi) => set((s) => { s.termFieldGroups[gi].fields.splice(fi, 1); }),
          setTermFieldData: (gi, fi, key, value) => set((s) => { s.termFieldGroups[gi].fields[fi][key] = value; }),

          // ── Quick Edit ─────────────────────────────────────────────────────
          addQuickEdit: () => set((s) => { s.quickEdits.push({ postType: '', fields: [] }); }),
          removeQuickEdit: (i) => set((s) => { s.quickEdits.splice(i, 1); }),
          setQuickEditData: (i, key, value) => set((s) => { s.quickEdits[i][key] = value; }),
          addQuickEditField: (i) => set((s) => {
            s.quickEdits[i].fields.push({ key: '', label: '', type: 'text' });
          }),
          removeQuickEditField: (i, fi) => set((s) => { s.quickEdits[i].fields.splice(fi, 1); }),
          setQuickEditFieldData: (i, fi, key, value) => set((s) => { s.quickEdits[i].fields[fi][key] = value; }),

          // ── Bulk Edit ──────────────────────────────────────────────────────
          addBulkEdit: () => set((s) => { s.bulkEdits.push({ postType: '', actions: [] }); }),
          removeBulkEdit: (i) => set((s) => { s.bulkEdits.splice(i, 1); }),
          setBulkEditData: (i, key, value) => set((s) => { s.bulkEdits[i][key] = value; }),
          addBulkEditAction: (i) => set((s) => {
            s.bulkEdits[i].actions.push({ slug: '', label: '' });
          }),
          removeBulkEditAction: (i, ai) => set((s) => { s.bulkEdits[i].actions.splice(ai, 1); }),
          setBulkEditActionData: (i, ai, key, value) => set((s) => { s.bulkEdits[i].actions[ai][key] = value; }),

          // ── Post REST Fields ───────────────────────────────────────────────
          addPostRestField: () => set((s) => {
            s.postRestFields.push({ fieldName: '', postTypes: [], type: 'string', description: '', readonly: false });
          }),
          removePostRestField: (i) => set((s) => { s.postRestFields.splice(i, 1); }),
          setPostRestFieldData: (i, key, value) => set((s) => { s.postRestFields[i][key] = value; }),

          // ── Emails ─────────────────────────────────────────────────────────
          addEmail: () => set((s) => {
            s.emails.push({ method: '', subject: '', template: '', recipientType: 'user', html: true, attachments: false });
          }),
          removeEmail: (i) => set((s) => { s.emails.splice(i, 1); }),
          setEmailData: (i, key, value) => set((s) => { s.emails[i][key] = value; }),

          // ── Importers ──────────────────────────────────────────────────────
          addImporter: () => set((s) => {
            s.importers.push({ id: '', name: '', description: '', className: '', fileTypes: '.csv' });
          }),
          removeImporter: (i) => set((s) => { s.importers.splice(i, 1); }),
          setImporterData: (i, key, value) => set((s) => { s.importers[i][key] = value; }),

          // ── Blocks ─────────────────────────────────────────────────────────
          addBlock: () => set((s) => {
            s.blocks.push({
              name: '', title: '', category: 'common', icon: 'block-default',
              description: '', keywords: '',
              dynamic: false,
              supportsAnchor: false, supportsAlign: false, supportsColor: false,
              supportsTypo: false, supportsSpacing: false, supportsClassName: true,
              attributes: [],
            });
          }),
          removeBlock: (i) => set((s) => { s.blocks.splice(i, 1); }),
          setBlockData: (i, key, value) => set((s) => { s.blocks[i][key] = value; }),
          addBlockAttr: (bi) => set((s) => {
            if (!s.blocks[bi].attributes) s.blocks[bi].attributes = [];
            s.blocks[bi].attributes.push({ name: '', type: 'string', default: '' });
          }),
          removeBlockAttr: (bi, ai) => set((s) => { s.blocks[bi].attributes.splice(ai, 1); }),
          setBlockAttrData: (bi, ai, key, value) => set((s) => { s.blocks[bi].attributes[ai][key] = value; }),

          // ── Import / Export ────────────────────────────────────────────────

          /**
           * Export full plugin config as a downloadable JSON string.
           * @returns {string} JSON
           */
          exportConfig: () => {
            const s = get();
            const config = {
              _version: '2.0.0',
              _exported: new Date().toISOString(),
              general: s.general,
              tables: s.tables,
              mainMenu: s.mainMenu,
              assets: s.assets,
              restapi: s.restapi,
              cpts: s.cpts,
              settingsGroups: s.settingsGroups,
              options: s.options,
              metaBoxes: s.metaBoxes,
              screenOptions: s.screenOptions,
              restCallbacks: s.restCallbacks,
              userFields: s.userFields,
              termFieldGroups: s.termFieldGroups,
              quickEdits: s.quickEdits,
              bulkEdits: s.bulkEdits,
              postRestFields: s.postRestFields,
              emails: s.emails,
              importers: s.importers,
              blocks: s.blocks,
            };
            return JSON.stringify(config, null, 2);
          },

          /**
           * Import full plugin config from a JSON string.
           * @param {string} json
           */
          importConfig: (json) => {
            try {
              const parsed = JSON.parse(json);
              set((s) => {
                const keys = Object.keys(DEFAULT_STATE).filter((k) => k !== 'currentStep');
                keys.forEach((k) => {
                  if (parsed[k] !== undefined) s[k] = parsed[k];
                });
              });
            } catch (e) {
              console.error('WPGen: import failed', e);
              throw new Error('Invalid JSON config file.');
            }
          },

          /**
           * Load a preset (e.g. Example Solution).
           * @param {Object} preset
           */
          loadPreset: (preset) => {
            set((s) => {
              const keys = Object.keys(DEFAULT_STATE).filter((k) => k !== 'currentStep');
              keys.forEach((k) => {
                if (preset[k] !== undefined) s[k] = preset[k];
              });
              s.currentStep = 0;
            });
          },

          /**
           * Reset to factory defaults.
           */
          resetAll: () => {
            set(() => ({ ...DEFAULT_STATE }));
          },

          // ── Derived / computed ─────────────────────────────────────────────
          getValidationWarnings: () => validateState(get()),
          getDefinedPostTypes:   () => getDefinedPostTypes(get()),
          getDefinedTaxonomies:  () => getDefinedTaxonomies(get()),
          getDefinedSettingsPages: () => getDefinedSettingsPages(get()),
        })),
        {
          limit: 50,   // 50-step undo/redo history
          partialize: (state) => {
            // Don't track wizard step in history
            const { currentStep, ...rest } = state;
            return rest;
          },
        }
      ),
      {
        name:    STORE_KEY,
        storage: createJSONStorage(() => localStorage),
        // Only persist plugin config, not actions
        partialize: (state) => {
          const { currentStep, ...config } = state;
          return config;
        },
      }
    )
  );

export const WIZARD_STEPS = [
  { id: 'general',      label: 'General',          icon: 'fa-cog',             description: 'Plugin metadata & namespace' },
  { id: 'cpts',         label: 'Post Types',        icon: 'fa-layer-group',     description: 'Custom Post Types & Taxonomies' },
  { id: 'meta-boxes',   label: 'Meta Boxes',        icon: 'fa-table-cells',     description: 'Edit screen meta boxes & fields' },
  { id: 'settings',     label: 'Settings',          icon: 'fa-sliders',         description: 'WP Settings API pages & options' },
  { id: 'rest',         label: 'REST API',          icon: 'fa-plug',            description: 'REST endpoints & post REST fields' },
  { id: 'admin-ui',     label: 'Admin UI',          icon: 'fa-table-list',      description: 'Quick edit, bulk edit, list tables' },
  { id: 'user-terms',   label: 'Users & Terms',     icon: 'fa-users',           description: 'User fields & taxonomy term fields' },
  { id: 'blocks',       label: 'Blocks',            icon: 'fa-puzzle-piece',    description: 'Gutenberg blocks (@wordpress/scripts)' },
  { id: 'emails',       label: 'Emails & Importers',icon: 'fa-envelope',        description: 'Email handlers & WP importers' },
  { id: 'assets',       label: 'Assets & Menu',     icon: 'fa-palette',         description: 'Scripts, styles & admin menu' },
  { id: 'review',       label: 'Review & Generate', icon: 'fa-rocket',          description: 'Validate, preview & download ZIP' },
];

// Singleton
const useStore = createStore();

export default useStore;
