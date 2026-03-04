/**
 * Central Zustand store for WP Plugin Generator.
 *
 * Features:
 *  - Full plugin config state (general, CPTs, settings, REST, blocks, etc.)
 *  - localStorage persistence (auto-save + restore)
 *  - Native undo/redo (50-step closure stacks — no external dependency)
 *  - Import / export as JSON
 *  - Cross-section context helpers (what CPTs exist, etc.)
 *  - Validation (known required settings)
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORE_KEY    = 'wpgen_v2';
const MAX_HISTORY  = 50;

// ─── History stacks (module-scope, outside Zustand state) ────────────────────

let _past   = [];
let _future = [];

const snapshotConfig = (state) => {
  // eslint-disable-next-line no-unused-vars
  const { currentStep, _historySize, ...config } = state;
  return JSON.stringify(config);
};

const restoreConfig = (draft, snap) => {
  const parsed = JSON.parse(snap);
  Object.keys(parsed).forEach((k) => { draft[k] = parsed[k]; });
};

// ─── Default state ────────────────────────────────────────────────────────────

export const DEFAULT_STATE = {
  // Wizard
  currentStep:   0,
  _historySize:  { past: 0, future: 0 },   // mirrors closure stacks for reactive canUndo/canRedo

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

  // ── REST API (legacy / simple) ────────────────────────────────────────────
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

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Return an array of validation warnings for the current state.
 * Each item: { id, level: 'error'|'warning', section, message, fix }
 */
export const validateState = (state) => {
  const warnings = [];
  const g = state.general;

  // General
  if (!g.pluginName)    warnings.push({ id: 'gen-name', level: 'error',   section: 'General', message: 'Plugin name is required.',          fix: 'Add a plugin name in General settings.' });
  if (!g.textDomain)    warnings.push({ id: 'gen-td',   level: 'error',   section: 'General', message: 'Text domain is required for i18n.',  fix: 'Set a text domain in General settings.' });
  if (!g.baseNamespace) warnings.push({ id: 'gen-ns',   level: 'error',   section: 'General', message: 'PHP namespace is required.',         fix: 'Set Base Namespace in General settings.' });
  if (!g.functionPrefix)warnings.push({ id: 'gen-fp',   level: 'warning', section: 'General', message: 'Function prefix is missing.',        fix: 'Set a function prefix (e.g. my_plugin_).' });

  // CPTs: every CPT should have at least one category-like taxonomy
  state.cpts.forEach((cpt, i) => {
    if (!cpt.postType) warnings.push({ id: `cpt-${i}-type`, level: 'error',   section: 'CPTs', message: `CPT #${i + 1} is missing a post type key.`, fix: 'Set a lowercase slug (e.g. "event").' });
    if (!cpt.singular) warnings.push({ id: `cpt-${i}-sing`, level: 'warning', section: 'CPTs', message: `CPT #${i + 1} is missing a singular label.`,  fix: 'Add a singular name (e.g. "Event").' });
    // Suggest REST endpoint
    if (cpt.showInRest) {
      const hasEndpoint = state.restCallbacks.some((r) => r.route && r.route.includes(cpt.postType));
      if (!hasEndpoint) warnings.push({ id: `cpt-${i}-rest`, level: 'warning', section: 'REST', message: `CPT "${cpt.postType}" is public in REST but has no custom REST callback.`, fix: 'Add a REST callback for this post type.' });
    }
    // Suggest meta box
    const hasMeta = state.metaBoxes.some((mb) => Array.isArray(mb.postTypes) && mb.postTypes.includes(cpt.postType));
    if (cpt.postType && !hasMeta) warnings.push({ id: `cpt-${i}-meta`, level: 'warning', section: 'Meta Boxes', message: `CPT "${cpt.postType}" has no meta box.`, fix: 'Add a meta box for this post type in step 3.' });
  });

  // Suggest at least 1 CPT
  if (state.cpts.length === 0) warnings.push({ id: 'no-cpts', level: 'warning', section: 'CPTs', message: 'No Custom Post Types defined.', fix: 'Add at least one CPT in step 2.' });

  // Settings: every group needs a page slug
  state.settingsGroups.forEach((sg, i) => {
    if (!sg.pageSlug)  warnings.push({ id: `sg-${i}-slug`, level: 'warning', section: 'Settings', message: `Settings group #${i + 1} has no page slug.`,  fix: 'Add a page slug to register the settings page.' });
    if (!sg.capability)warnings.push({ id: `sg-${i}-cap`,  level: 'warning', section: 'Settings', message: `Settings group #${i + 1} has no capability.`,  fix: 'Set a capability (e.g. manage_options).' });
  });

  // Meta boxes: need post types
  state.metaBoxes.forEach((mb, i) => {
    if (!mb.id) warnings.push({ id: `mb-${i}-id`, level: 'error',   section: 'Meta Boxes', message: `Meta box #${i + 1} has no ID.`,                         fix: 'Set a unique ID.' });
    if (!mb.postTypes || mb.postTypes.length === 0) warnings.push({ id: `mb-${i}-pt`, level: 'warning', section: 'Meta Boxes', message: `Meta box "${mb.id || i + 1}" has no post types.`, fix: 'Assign at least one post type.' });
  });

  // REST callbacks: namespace + route
  state.restCallbacks.forEach((r, i) => {
    if (!r.namespace) warnings.push({ id: `rc-${i}-ns`,    level: 'error', section: 'REST', message: `REST callback #${i + 1} has no namespace.`, fix: `Use your plugin slug, e.g. "${g.textDomain}/v1".` });
    if (!r.route)     warnings.push({ id: `rc-${i}-route`, level: 'error', section: 'REST', message: `REST callback #${i + 1} has no route.`,      fix: 'Add a route like "/items".' });
  });

  // Blocks
  state.blocks.forEach((b, i) => {
    if (!b.name) warnings.push({ id: `bl-${i}-name`, level: 'error', section: 'Blocks', message: `Block #${i + 1} has no slug.`, fix: 'Add a block name slug (e.g. "hero-section").' });
  });

  return warnings;
};

// ─── Context helpers ──────────────────────────────────────────────────────────

export const getDefinedPostTypes = (state) => [
  'post', 'page', 'attachment', 'revision', 'nav_menu_item',
  ...state.cpts.map((c) => c.postType).filter(Boolean),
];

export const getDefinedTaxonomies = (state) => [
  'category', 'post_tag', 'nav_menu', 'link_category', 'post_format',
  ...state.cpts.flatMap((c) => (c.taxonomies || '').split(',').map((t) => t.trim())).filter(Boolean),
];

export const getDefinedSettingsPages = (state) =>
  state.settingsGroups.map((s) => s.pageSlug).filter(Boolean);

// ─── Wizard steps ─────────────────────────────────────────────────────────────

export const WIZARD_STEPS = [
  { id: 'general',    label: 'General',           icon: 'fa-cog',           description: 'Plugin metadata & namespace' },
  { id: 'cpts',       label: 'Post Types',         icon: 'fa-layer-group',   description: 'Custom Post Types & Taxonomies' },
  { id: 'meta-boxes', label: 'Meta Boxes',         icon: 'fa-table-cells',   description: 'Edit screen meta boxes & fields' },
  { id: 'settings',   label: 'Settings',           icon: 'fa-sliders',       description: 'WP Settings API pages & options' },
  { id: 'rest',       label: 'REST API',           icon: 'fa-plug',          description: 'REST endpoints & post REST fields' },
  { id: 'admin-ui',   label: 'Admin UI',           icon: 'fa-table-list',    description: 'Quick edit, bulk edit, list tables' },
  { id: 'user-terms', label: 'Users & Terms',      icon: 'fa-users',         description: 'User fields & taxonomy term fields' },
  { id: 'blocks',     label: 'Blocks',             icon: 'fa-puzzle-piece',  description: 'Gutenberg blocks (@wordpress/scripts)' },
  { id: 'emails',     label: 'Emails & Importers', icon: 'fa-envelope',      description: 'Email handlers & WP importers' },
  { id: 'assets',     label: 'Assets & Menu',      icon: 'fa-palette',       description: 'Scripts, styles & admin menu' },
  { id: 'review',     label: 'Review & Generate',  icon: 'fa-rocket',        description: 'Validate, preview & download ZIP' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

const useStore = create(
  persist(
    immer((set, get) => {

      // History-aware set: snapshot before mutation, push to _past, clear _future
      const hset = (fn) => {
        _past.push(snapshotConfig(get()));
        if (_past.length > MAX_HISTORY) _past.shift();
        _future = [];
        set((s) => {
          fn(s);
          s._historySize = { past: _past.length, future: _future.length };
        });
      };

      return {
        ...DEFAULT_STATE,

        // ── Undo / Redo ────────────────────────────────────────────────────
        undo: () => {
          if (!_past.length) return;
          _future.push(snapshotConfig(get()));
          if (_future.length > MAX_HISTORY) _future.shift();
          set((s) => {
            restoreConfig(s, _past.pop());
            s._historySize = { past: _past.length, future: _future.length };
          });
        },
        redo: () => {
          if (!_future.length) return;
          _past.push(snapshotConfig(get()));
          if (_past.length > MAX_HISTORY) _past.shift();
          set((s) => {
            restoreConfig(s, _future.pop());
            s._historySize = { past: _past.length, future: _future.length };
          });
        },

        // ── Wizard navigation (NOT tracked in history) ─────────────────────
        setStep:  (step) => set((s) => { s.currentStep = step; }),
        nextStep: () => set((s) => { s.currentStep = Math.min(s.currentStep + 1, WIZARD_STEPS.length - 1); }),
        prevStep: () => set((s) => { s.currentStep = Math.max(s.currentStep - 1, 0); }),

        // ── General ────────────────────────────────────────────────────────
        setGeneral:     (key, value) => hset((s) => { s.general[key] = value; }),
        setGeneralBulk: (obj)        => hset((s) => { Object.assign(s.general, obj); }),

        // ── Main Menu ──────────────────────────────────────────────────────
        setMainMenu: (key, value) => hset((s) => { s.mainMenu[key] = value; }),

        // ── Assets ─────────────────────────────────────────────────────────
        setAssets: (assets) => hset((s) => { s.assets = assets; }),

        // ── Tables ─────────────────────────────────────────────────────────
        addTable:     ()           => hset((s) => { s.tables.push({ name: '', fields: [], restapi: [], settings: {} }); }),
        removeTable:  (i)          => hset((s) => { s.tables.splice(i, 1); }),
        setTableData: (i, k, v)    => hset((s) => { s.tables[i][k] = v; }),

        // ── REST API (legacy) ──────────────────────────────────────────────
        addRestapi:     ()        => hset((s) => { s.restapi.push({ namespace: '', route: '', methods: [], fields: [] }); }),
        removeRestapi:  (i)       => hset((s) => { s.restapi.splice(i, 1); }),
        setRestapiData: (i, k, v) => hset((s) => { s.restapi[i][k] = v; }),

        // ── CPTs ───────────────────────────────────────────────────────────
        addCpt: () => hset((s) => {
          s.cpts.push({
            postType: '', singular: '', plural: '', description: '',
            menuIcon: 'dashicons-admin-post', menuPosition: '',
            capabilityType: 'post', urlSlug: '', className: '',
            showInRest: true, hasArchive: false, hierarchical: false, isPublic: true,
            supports: ['title', 'editor'], taxonomies: '',
            blockTemplate: false,
          });
        }),
        removeCpt:  (i)       => hset((s) => { s.cpts.splice(i, 1); }),
        setCptData: (i, k, v) => hset((s) => { s.cpts[i][k] = v; }),

        // ── Settings ───────────────────────────────────────────────────────
        addSettingsGroup:    ()           => hset((s) => { s.settingsGroups.push({ groupId: '', title: '', pageSlug: '', capability: 'manage_options', sections: [] }); }),
        removeSettingsGroup: (i)          => hset((s) => { s.settingsGroups.splice(i, 1); }),
        setSettingsGroupData:(i, k, v)    => hset((s) => { s.settingsGroups[i][k] = v; }),
        addSettingsSection:  (gi)         => hset((s) => { s.settingsGroups[gi].sections.push({ id: '', title: '', description: '', fields: [] }); }),
        removeSettingsSection:(gi, si)    => hset((s) => { s.settingsGroups[gi].sections.splice(si, 1); }),
        setSettingsSectionData:(gi,si,k,v)=> hset((s) => { s.settingsGroups[gi].sections[si][k] = v; }),
        addSettingsField:    (gi, si)     => hset((s) => { s.settingsGroups[gi].sections[si].fields.push({ id: '', label: '', type: 'text', default: '', description: '' }); }),
        removeSettingsField: (gi,si,fi)   => hset((s) => { s.settingsGroups[gi].sections[si].fields.splice(fi, 1); }),
        setSettingsFieldData:(gi,si,fi,k,v)=>hset((s) => { s.settingsGroups[gi].sections[si].fields[fi][k] = v; }),

        // ── Options ────────────────────────────────────────────────────────
        addOption:    ()        => hset((s) => { s.options.push({ key: '', type: 'text', default: '', description: '', autoload: true }); }),
        removeOption: (i)       => hset((s) => { s.options.splice(i, 1); }),
        setOptionData:(i, k, v) => hset((s) => { s.options[i][k] = v; }),

        // ── Meta Boxes ─────────────────────────────────────────────────────
        addMetaBox:     ()         => hset((s) => { s.metaBoxes.push({ id: '', title: '', postTypes: [], context: 'normal', priority: 'default', fields: [] }); }),
        removeMetaBox:  (i)        => hset((s) => { s.metaBoxes.splice(i, 1); }),
        setMetaBoxData: (i, k, v)  => hset((s) => { s.metaBoxes[i][k] = v; }),
        addMetaBoxField:    (i)    => hset((s) => { s.metaBoxes[i].fields.push({ key: '', label: '', type: 'text', description: '' }); }),
        removeMetaBoxField: (i,fi) => hset((s) => { s.metaBoxes[i].fields.splice(fi, 1); }),
        setMetaBoxFieldData:(i,fi,k,v)=>hset((s) => { s.metaBoxes[i].fields[fi][k] = v; }),

        // ── Screen Options ─────────────────────────────────────────────────
        addScreenOption:    ()        => hset((s) => { s.screenOptions.push({ screen: '', option: '', label: '', default: 20, type: 'per_page' }); }),
        removeScreenOption: (i)       => hset((s) => { s.screenOptions.splice(i, 1); }),
        setScreenOptionData:(i, k, v) => hset((s) => { s.screenOptions[i][k] = v; }),

        // ── REST Callbacks ─────────────────────────────────────────────────
        addRestCallback:    () => hset((s) => {
          s.restCallbacks.push({ namespace: '', route: '', className: '', methods: ['GET'], capability: 'read', authRequired: true });
        }),
        removeRestCallback:   (i)       => hset((s) => { s.restCallbacks.splice(i, 1); }),
        setRestCallbackData:  (i, k, v) => hset((s) => { s.restCallbacks[i][k] = v; }),

        // ── User Fields ────────────────────────────────────────────────────
        addUserField:    ()        => hset((s) => { s.userFields.push({ key: '', label: '', type: 'text', section: '', description: '' }); }),
        removeUserField: (i)       => hset((s) => { s.userFields.splice(i, 1); }),
        setUserFieldData:(i, k, v) => hset((s) => { s.userFields[i][k] = v; }),

        // ── Term Fields ────────────────────────────────────────────────────
        addTermFieldGroup:    ()        => hset((s) => { s.termFieldGroups.push({ taxonomy: '', fields: [] }); }),
        removeTermFieldGroup: (i)       => hset((s) => { s.termFieldGroups.splice(i, 1); }),
        setTermFieldGroupData:(i, k, v) => hset((s) => { s.termFieldGroups[i][k] = v; }),
        addTermField:    (gi)       => hset((s) => { s.termFieldGroups[gi].fields.push({ key: '', label: '', type: 'text', description: '' }); }),
        removeTermField: (gi, fi)   => hset((s) => { s.termFieldGroups[gi].fields.splice(fi, 1); }),
        setTermFieldData:(gi,fi,k,v)=> hset((s) => { s.termFieldGroups[gi].fields[fi][k] = v; }),

        // ── Quick Edit ─────────────────────────────────────────────────────
        addQuickEdit:    ()       => hset((s) => { s.quickEdits.push({ postType: '', fields: [] }); }),
        removeQuickEdit: (i)      => hset((s) => { s.quickEdits.splice(i, 1); }),
        setQuickEditData:(i,k,v)  => hset((s) => { s.quickEdits[i][k] = v; }),
        addQuickEditField:   (i)      => hset((s) => { s.quickEdits[i].fields.push({ key: '', label: '', type: 'text' }); }),
        removeQuickEditField:(i, fi)  => hset((s) => { s.quickEdits[i].fields.splice(fi, 1); }),
        setQuickEditFieldData:(i,fi,k,v)=>hset((s) => { s.quickEdits[i].fields[fi][k] = v; }),

        // ── Bulk Edit ──────────────────────────────────────────────────────
        addBulkEdit:    ()      => hset((s) => { s.bulkEdits.push({ postType: '', actions: [] }); }),
        removeBulkEdit: (i)     => hset((s) => { s.bulkEdits.splice(i, 1); }),
        setBulkEditData:(i,k,v) => hset((s) => { s.bulkEdits[i][k] = v; }),
        addBulkEditAction:    (i)       => hset((s) => { s.bulkEdits[i].actions.push({ slug: '', label: '' }); }),
        removeBulkEditAction: (i, ai)   => hset((s) => { s.bulkEdits[i].actions.splice(ai, 1); }),
        setBulkEditActionData:(i,ai,k,v)=> hset((s) => { s.bulkEdits[i].actions[ai][k] = v; }),

        // ── Post REST Fields ───────────────────────────────────────────────
        addPostRestField:    ()        => hset((s) => { s.postRestFields.push({ fieldName: '', postTypes: [], type: 'string', description: '', readonly: false }); }),
        removePostRestField: (i)       => hset((s) => { s.postRestFields.splice(i, 1); }),
        setPostRestFieldData:(i, k, v) => hset((s) => { s.postRestFields[i][k] = v; }),

        // ── Emails ─────────────────────────────────────────────────────────
        addEmail:    ()       => hset((s) => { s.emails.push({ method: '', subject: '', template: '', recipientType: 'user', html: true, attachments: false }); }),
        removeEmail: (i)      => hset((s) => { s.emails.splice(i, 1); }),
        setEmailData:(i,k,v)  => hset((s) => { s.emails[i][k] = v; }),

        // ── Importers ──────────────────────────────────────────────────────
        addImporter:    ()        => hset((s) => { s.importers.push({ id: '', name: '', description: '', className: '', fileTypes: '.csv' }); }),
        removeImporter: (i)       => hset((s) => { s.importers.splice(i, 1); }),
        setImporterData:(i, k, v) => hset((s) => { s.importers[i][k] = v; }),

        // ── Blocks ─────────────────────────────────────────────────────────
        addBlock: () => hset((s) => {
          s.blocks.push({
            name: '', title: '', category: 'common', icon: 'block-default',
            description: '', keywords: '',
            dynamic: false,
            supportsAnchor: false, supportsAlign: false, supportsColor: false,
            supportsTypo: false, supportsSpacing: false, supportsClassName: true,
            attributes: [],
          });
        }),
        removeBlock:     (i)        => hset((s) => { s.blocks.splice(i, 1); }),
        setBlockData:    (i, k, v)  => hset((s) => { s.blocks[i][k] = v; }),
        addBlockAttr:    (bi)       => hset((s) => { if (!s.blocks[bi].attributes) s.blocks[bi].attributes = []; s.blocks[bi].attributes.push({ name: '', type: 'string', default: '' }); }),
        removeBlockAttr: (bi, ai)   => hset((s) => { s.blocks[bi].attributes.splice(ai, 1); }),
        setBlockAttrData:(bi,ai,k,v)=> hset((s) => { s.blocks[bi].attributes[ai][k] = v; }),

        // ── Import / Export ────────────────────────────────────────────────

        /** Export full plugin config as a downloadable JSON string. */
        exportConfig: () => {
          const s = get();
          const config = {
            _version:  '2.0.0',
            _exported: new Date().toISOString(),
            general: s.general, tables: s.tables, mainMenu: s.mainMenu,
            assets: s.assets, restapi: s.restapi, cpts: s.cpts,
            settingsGroups: s.settingsGroups, options: s.options,
            metaBoxes: s.metaBoxes, screenOptions: s.screenOptions,
            restCallbacks: s.restCallbacks, userFields: s.userFields,
            termFieldGroups: s.termFieldGroups, quickEdits: s.quickEdits,
            bulkEdits: s.bulkEdits, postRestFields: s.postRestFields,
            emails: s.emails, importers: s.importers, blocks: s.blocks,
          };
          return JSON.stringify(config, null, 2);
        },

        /** Import full plugin config from a JSON string. */
        importConfig: (json) => {
          try {
            const parsed = JSON.parse(json);
            hset((s) => {
              const keys = Object.keys(DEFAULT_STATE).filter((k) => !['currentStep', '_historySize'].includes(k));
              keys.forEach((k) => { if (parsed[k] !== undefined) s[k] = parsed[k]; });
            });
          } catch (e) {
            console.error('WPGen: import failed', e);
            throw new Error('Invalid JSON config file.');
          }
        },

        /** Load a preset (e.g. Example Solution). */
        loadPreset: (preset) => {
          hset((s) => {
            const keys = Object.keys(DEFAULT_STATE).filter((k) => !['currentStep', '_historySize'].includes(k));
            keys.forEach((k) => { if (preset[k] !== undefined) s[k] = preset[k]; });
            s.currentStep = 0;
          });
        },

        /** Reset to factory defaults. */
        resetAll: () => {
          _past   = [];
          _future = [];
          set(() => ({ ...DEFAULT_STATE }));
        },

        // ── Derived / computed ─────────────────────────────────────────────
        getValidationWarnings: () => validateState(get()),
        getDefinedPostTypes:   () => getDefinedPostTypes(get()),
        getDefinedTaxonomies:  () => getDefinedTaxonomies(get()),
        getDefinedSettingsPages: () => getDefinedSettingsPages(get()),
      };
    }),
    {
      name:    STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist plugin config (not wizard navigation or functions)
      partialize: (s) => {
        // eslint-disable-next-line no-unused-vars
        const { currentStep, _historySize, ...config } = s;
        return config;
      },
    }
  )
);

export default useStore;
