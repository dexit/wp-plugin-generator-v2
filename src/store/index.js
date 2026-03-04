import Vue from "vue";
import Vuex from "vuex";
import { slug } from "../utils/helpers";
import { buildTreeData } from "../utils/buildtree";
import { CodeBase } from "../codebase/index";

Vue.use(Vuex);

const store = {
  state: {
    // ── File tree ──────────────────────────────────────────────────────────
    fileArchitecture: [],
    filesTree: [
      { id: "root", type: "pluginName", directory: true, name: "plugin_name", parent_id: null },
      { id: "root_assets", type: "assets_dir", directory: true, name: "assets", parent_id: "root" },
      { id: "assets_css", type: "css_dir", directory: true, name: "css", parent_id: "root_assets" },
      { id: "assets_js", type: "js_dir", directory: true, name: "js", parent_id: "root_assets" },
      { id: "assets_images", type: "images_dir", directory: true, name: "images", parent_id: "root_assets" },
      { id: "root_includes", type: "includes_dir", directory: true, name: "includes", parent_id: "root" },
      { id: "includes_admin", type: "admin_dir", directory: true, name: "Admin", parent_id: "root_includes" },
      { id: "includes_admin_views", type: "admin_dir", directory: true, name: "views", parent_id: "includes_admin" },
      {
        id: "includes_admin_file",
        type: "php", file: true, name: "Menu.php", parent_id: "includes_admin",
        value: () => CodeBase.menuCode(store.state.general, store.state.tables, store.state.mainMenu),
      },
      { id: "includes_api", type: "api_dir", directory: true, name: "API", parent_id: "root_includes" },
      { id: "includes_frontend", type: "frontend_dir", directory: true, name: "Frontend", parent_id: "root_includes" },
      {
        id: "frontend_file",
        type: "php", file: true, name: "Shortcode.php", parent_id: "includes_frontend",
        value: () => CodeBase.frontendShortcode(store.state.general),
      },
      { id: "includes_traits", type: "traits_dir", directory: true, name: "Traits", parent_id: "root_includes" },
      {
        id: "traits_file",
        type: "php", file: true, name: "Form_Error.php", parent_id: "includes_traits",
        value: () => CodeBase.formErrorCode(store.state.general),
      },
      {
        id: "traits_request_utils",
        type: "php", file: true, name: "RequestUtils.php", parent_id: "includes_traits",
        value: () => CodeBase.requestUtilsCode(store.state.general),
      },
      { id: "includes_utils", type: "utils_dir", directory: true, name: "Utils", parent_id: "root_includes" },
      {
        id: "utils_db",
        type: "php", file: true, name: "DbUtils.php", parent_id: "includes_utils",
        value: () => CodeBase.dbUtilsCode(store.state.general),
      },
      {
        id: "includes_file_admin",
        type: "php", file: true, name: "Admin.php", parent_id: "root_includes",
        value: () => CodeBase.adminCode(store.state.general, store.state.tables),
      },
      {
        id: "includes_file_api",
        type: "php", file: true, name: "Api.php", parent_id: "root_includes",
        value: () => CodeBase.apiCode(store.state.general, store.state.restapi),
      },
      {
        id: "includes_file_assets",
        type: "php", file: true, name: "Assets.php", parent_id: "root_includes",
        value: () => CodeBase.assetsCode(store.state.general, store.state.assets),
      },
      {
        id: "includes_file_frontend",
        type: "php", file: true, name: "Frontend.php", parent_id: "root_includes",
        value: () => CodeBase.frontendCode(store.state.general),
      },
      {
        id: "includes_file_installer",
        type: "php", file: true, name: "Installer.php", parent_id: "root_includes",
        value: () => CodeBase.installerCode(store.state.general, store.state.tables),
      },
      {
        id: "includes_file_functions",
        type: "php", file: true, name: "functions.php", parent_id: "root_includes",
        value: () => CodeBase.functionsCode(store.state.general, store.state.tables),
      },
      {
        id: "includes_file_options",
        type: "php", file: true, name: "Options.php", parent_id: "root_includes",
        value: () => CodeBase.optionsCode(store.state.general, store.state.options),
      },
      {
        id: "includes_file_emails",
        type: "php", file: true, name: "Emails.php", parent_id: "root_includes",
        value: () => CodeBase.emailCode(store.state.general, store.state.emails),
      },
      // CPT directory
      { id: "includes_cpt", type: "cpt_dir", directory: true, name: "CPT", parent_id: "root_includes" },
      {
        id: "includes_cpt_file",
        type: "php", file: true, name: "PostTypes.php", parent_id: "includes_cpt",
        value: () => CodeBase.cptCode(store.state.general, store.state.cpts),
      },
      // Settings directory
      { id: "includes_settings", type: "settings_dir", directory: true, name: "Settings", parent_id: "root_includes" },
      {
        id: "includes_settings_file",
        type: "php", file: true, name: "Settings.php", parent_id: "includes_settings",
        value: () => CodeBase.settingsCode(store.state.general, store.state.settingsGroups),
      },
      // Meta Boxes directory
      { id: "includes_metaboxes", type: "metaboxes_dir", directory: true, name: "MetaBoxes", parent_id: "includes_admin" },
      {
        id: "includes_metaboxes_file",
        type: "php", file: true, name: "MetaBoxes.php", parent_id: "includes_metaboxes",
        value: () => CodeBase.metaBoxCode(store.state.general, store.state.metaBoxes),
      },
      // Screen Options
      {
        id: "includes_screen_options",
        type: "php", file: true, name: "ScreenOptions.php", parent_id: "includes_admin",
        value: () => CodeBase.screenOptionsCode(store.state.general, store.state.screenOptions),
      },
      // REST Callbacks
      {
        id: "includes_rest_callbacks",
        type: "php", file: true, name: "Endpoints.php", parent_id: "includes_api",
        value: () => CodeBase.restCallbackCode(store.state.general, store.state.restCallbacks),
      },
      // Post REST Fields
      {
        id: "includes_post_rest_fields",
        type: "php", file: true, name: "PostFields.php", parent_id: "includes_api",
        value: () => CodeBase.postRestFieldsCode(store.state.general, store.state.postRestFields),
      },
      // User Fields
      {
        id: "includes_user_fields",
        type: "php", file: true, name: "UserFields.php", parent_id: "root_includes",
        value: () => CodeBase.userFieldsCode(store.state.general, store.state.userFields),
      },
      // Term Fields
      {
        id: "includes_term_fields",
        type: "php", file: true, name: "TermFields.php", parent_id: "root_includes",
        value: () => CodeBase.termFieldsCode(store.state.general, store.state.termFieldGroups),
      },
      // Quick Edit
      {
        id: "includes_quick_edit",
        type: "php", file: true, name: "QuickEdit.php", parent_id: "includes_admin",
        value: () => CodeBase.quickEditCode(store.state.general, store.state.quickEdits),
      },
      // Bulk Edit
      {
        id: "includes_bulk_edit",
        type: "php", file: true, name: "BulkEdit.php", parent_id: "includes_admin",
        value: () => CodeBase.bulkEditCode(store.state.general, store.state.bulkEdits),
      },
      // Import directory
      { id: "includes_import", type: "import_dir", directory: true, name: "Import", parent_id: "root_includes" },
      {
        id: "includes_importer_file",
        type: "php", file: true, name: "Importer.php", parent_id: "includes_import",
        value: () => CodeBase.importerCode(store.state.general, store.state.importers),
      },
      // Blocks
      { id: "root_blocks", type: "blocks_dir", directory: true, name: "blocks", parent_id: "root" },
      { id: "blocks_src", type: "blocks_src_dir", directory: true, name: "src", parent_id: "root_blocks" },
      { id: "blocks_build", type: "blocks_build_dir", directory: true, name: "build", parent_id: "root_blocks" },
      {
        id: "blocks_package_json",
        type: "json", file: true, name: "package.json", parent_id: "root_blocks",
        value: () => CodeBase.blocksPackageJson(store.state.general),
      },
      {
        id: "blocks_webpack_config",
        type: "js", file: true, name: "webpack.config.js", parent_id: "root_blocks",
        value: () => CodeBase.blocksWebpackConfig(store.state.general, store.state.blocks),
      },
      {
        id: "includes_blocks_php",
        type: "php", file: true, name: "Blocks.php", parent_id: "root_includes",
        value: () => CodeBase.blocksPhpCode(store.state.general, store.state.blocks),
      },
      // Root files
      { id: "root_language", type: "lang-dir", directory: true, name: "languages", parent_id: "root" },
      { id: "root_template", type: "template-dir", directory: true, name: "templates", parent_id: "root" },
      { id: "root_template_emails", type: "template_emails_dir", directory: true, name: "emails", parent_id: "root_template" },
      { id: "root_template_example", type: "php", file: true, name: "example.php", parent_id: "root_template", value: () => "<?php\n" },
      { id: "root_gitignore", type: "gitignore", file: true, name: ".gitignore", parent_id: "root", value: () => CodeBase.gitIgnoreCode() },
      { id: "root_editorconfig", type: "editorconfig", file: true, name: ".editorconfig", parent_id: "root", value: () => CodeBase.editorconfigCode() },
      { id: "root_phpcs", type: "phpcs", file: true, name: "phpcs.xml", parent_id: "root", value: () => CodeBase.phpcsCode() },
      { id: "root_eslintignore", type: "eslintignore", file: true, name: ".eslintignore", parent_id: "root", value: () => CodeBase.eslintignoreCode() },
      { id: "root_eslintrc_json", type: "eslintrc.json", file: true, name: ".eslintrc.json", parent_id: "root", value: () => CodeBase.eslintrcCode() },
      { id: "root_prettierrc", type: "prettierrc", file: true, name: ".prettierrc", parent_id: "root", value: () => CodeBase.prettierrcCode() },
      { id: "root_composer", type: "composer", file: true, name: "composer.json", parent_id: "root", value: () => CodeBase.composerCode(store.state.general) },
      { id: "root_index", type: "php", file: true, name: "index.php", parent_id: "root", value: () => "<?php\n//silence is golden" },
      { id: "root_main_plugin_file", type: "main-plugin-php-file", file: true, name: "plugin.php", parent_id: "root", value: () => CodeBase.mainPluginCode(store.state.general) },
      { id: "root_readme_md", type: "readme", file: true, name: "README.md", parent_id: "root", value: () => CodeBase.readmeCode(store.state.general) },
      { id: "root_readme_txt", type: "readme", file: true, name: "readme.txt", parent_id: "root", value: () => CodeBase.readmeCode(store.state.general) },
    ],

    // ── Plugin meta ─────────────────────────────────────────────────────────
    general: {
      pluginName: "", baseNamespace: "", pluginURI: "", description: "", version: "",
      author: "", authorURI: "", authorEmail: "", license: "", licenseURI: "",
      textDomain: "", domainPath: "", mainClassName: "", constantPrefix: "", functionPrefix: "",
    },
    mainMenu: { menuTitle: "", pageTitle: "", capability: "", pageSlug: "" },
    assets:   { css: [], js: [] },
    activeFileCodes: "",
    activeFileName:  "",

    // Original
    tables:  [],
    restapi: [],

    // New features
    cpts:            [],
    settingsGroups:  [],
    options:         [],
    metaBoxes:       [],
    screenOptions:   [],
    restCallbacks:   [],
    userFields:      [],
    termFieldGroups: [],
    quickEdits:      [],
    bulkEdits:       [],
    postRestFields:  [],
    emails:          [],
    importers:       [],
    blocks:          [],
  },

  getters: {
    filesTree:       (s) => s.filesTree,
    general:         (s) => s.general,
    pluginName:      (s) => s.general.pluginName,
    baseNamespace:   (s) => s.general.baseNamespace,
    activeFileName:  (s) => s.activeFileName,
    activeFileCodes: (s) => s.activeFileCodes,
    assets:          (s) => s.assets,
    tables:          (s) => s.tables,
    restapi:         (s) => s.restapi,
    mainMenu:        (s) => s.mainMenu,
    cpts:            (s) => s.cpts,
    settingsGroups:  (s) => s.settingsGroups,
    options:         (s) => s.options,
    metaBoxes:       (s) => s.metaBoxes,
    screenOptions:   (s) => s.screenOptions,
    restCallbacks:   (s) => s.restCallbacks,
    userFields:      (s) => s.userFields,
    termFieldGroups: (s) => s.termFieldGroups,
    quickEdits:      (s) => s.quickEdits,
    bulkEdits:       (s) => s.bulkEdits,
    postRestFields:  (s) => s.postRestFields,
    emails:          (s) => s.emails,
    importers:       (s) => s.importers,
    blocks:          (s) => s.blocks,
  },

  mutations: {
    // ── Original ─────────────────────────────────────────────────────────
    setPluginName(state, payload) {
      const name = slug(payload);
      state.fileArchitecture[0].text = name;
      state.filesTree[0].name = name;
      state.general.pluginName = payload;
      state.filesTree.forEach((item) => {
        if (item.type === "main-plugin-php-file") item.name = `${name}.php`;
      });
    },
    setBaseNamespace(state, payload) { state.general.baseNamespace = payload.replace(/\s/g, "_"); },
    setGeneralData(state, payload)   { state.general[payload.key] = payload.value; },
    setFileArchitecture(state, p)    { state.fileArchitecture = p; },
    setActiveFileName(state, p)      { state.activeFileName = p; },
    setActiveFileCodes(state, p)     { state.activeFileCodes = p; },

    addNewAssets(state, payload) {
      if (payload.type === "css") state.assets.css.push({ handle: "", style: "", dependency: "" });
      if (payload.type === "js")  state.assets.js.push({ handle: "", script: "", dependency: "", in_footer: false });
    },
    setAssetsData(state, payload) {
      Vue.set(state.assets[payload.type][payload.index], payload.key, payload.value);
      if (payload.key === "style" || payload.key === "script") {
        const fileExt = payload.value.split(".").pop();
        if (fileExt === payload.type) {
          store.mutations.addNewFileInFileTree(store.state, {
            id: `assets_${payload.type}_file_${payload.index}`,
            type: payload.type, file: true, replace: true,
            name: payload.value, parent_id: "assets_" + payload.type,
            value: () => "/* wp-generator */\n/* write or paste your code here */\n",
          });
        }
      }
    },

    addNewTable(state)          { state.tables.push({ name: "", settings: {}, fields: [] }); },
    addNewTableField(state, p)  { state.tables[p.index].fields.push({ name: "", type: "", length: 11, nullable: false, primary_key: false, default: "", showInCrudForm: false }); },
    setTableData(state, p)      { Vue.set(state.tables[p.index], p.key, p.value); },
    setTableFieldData(state, p) { Vue.set(state.tables[p.index].fields[p.fieldIndex], p.key, p.value); },
    deleteTableField(state, p)  { Vue.delete(state.tables[p.index].fields, [p.fieldIndex]); },
    deleteTable(state, p)       { Vue.delete(state.tables, [p.index]); },

    addNewFileInFileTree(state, payload) {
      if (typeof payload.replace !== "undefined" && payload.replace) {
        state.filesTree.forEach((obj, index) => { if (obj.parent_id === payload.id) Vue.delete(state.filesTree, index); });
        state.filesTree.forEach((obj, index) => { if (obj.id === payload.id) Vue.delete(state.filesTree, index); });
      }
      if (typeof payload.name !== "undefined") state.filesTree.push(payload);
    },

    addNewRestApi(state, payload) { state.restapi.push({ enabled: payload, schemaFields: [] }); },
    addNewRestApiSchemaField(state, payload) {
      if (typeof payload.new !== "undefined") {
        state.restapi[payload.index].schemaFields.push({ propertyKey: "", type: "", context: "view, edit", format: "", readonly: false, required: false, sanitize: false });
      } else {
        state.restapi[payload.index].schemaFields.push(payload.value);
      }
    },
    setRestApiData(state, payload) {
      if (payload.type !== null && payload.type === "reset") Vue.set(state.restapi, payload.index, payload.value);
      else Vue.set(state.restapi[payload.index], payload.key, payload.value);
    },
    setRestApiSchemaFieldData(state, payload) {
      if (typeof payload.reset !== "undefined" && payload.reset) Vue.set(state.restapi[payload.index], "schemaFields", payload.value);
      else Vue.set(state.restapi[payload.index].schemaFields[payload.fieldIndex], payload.key, payload.value);
    },
    deleteRestApi(state, p)            { Vue.delete(state.restapi, p.index); },
    deleteRestApiSchemaField(state, p) { Vue.delete(state.restapi[p.index].schemaFields, p.fieldIndex); },
    setStateData(state, p)             { Vue.set(state, p.key, p.value); },
    setMainMenuData(state, p)          { Vue.set(state.mainMenu, p.key, p.value); },

    // ── CPTs ─────────────────────────────────────────────────────────────
    addCpt(state) {
      state.cpts.push({ postType: "", className: "", singularLabel: "", pluralLabel: "", slug: "", public: true, publiclyQueryable: true, showInRest: true, hasArchive: false, hierarchical: false, menuPosition: null, menuIcon: "dashicons-admin-post", capabilityType: "post", supports: ["title", "editor", "thumbnail"], taxonomies: [], blockTemplate: false });
    },
    removeCpt(state, { index })          { Vue.delete(state.cpts, index); },
    setCptData(state, { index, key, value }) { Vue.set(state.cpts[index], key, value); },

    // ── Settings ─────────────────────────────────────────────────────────
    addSettingsGroup(state) { state.settingsGroups.push({ groupId: "", groupTitle: "", menuTitle: "", pageSlug: "", className: "", capability: "manage_options", sections: [] }); },
    removeSettingsGroup(state, { index }) { Vue.delete(state.settingsGroups, index); },
    setSettingsGroupData(state, { index, key, value }) { Vue.set(state.settingsGroups[index], key, value); },
    addSettingsSection(state, { groupIndex }) { state.settingsGroups[groupIndex].sections.push({ id: "", title: "", description: "", fields: [] }); },
    removeSettingsSection(state, { groupIndex, sectionIndex }) { Vue.delete(state.settingsGroups[groupIndex].sections, sectionIndex); },
    setSettingsSectionData(state, { groupIndex, sectionIndex, key, value }) { Vue.set(state.settingsGroups[groupIndex].sections[sectionIndex], key, value); },
    addSettingsField(state, { groupIndex, sectionIndex }) { state.settingsGroups[groupIndex].sections[sectionIndex].fields.push({ id: "", title: "", type: "text", default: "", description: "" }); },
    removeSettingsField(state, { groupIndex, sectionIndex, fieldIndex }) { Vue.delete(state.settingsGroups[groupIndex].sections[sectionIndex].fields, fieldIndex); },
    setSettingsFieldData(state, { groupIndex, sectionIndex, fieldIndex, key, value }) { Vue.set(state.settingsGroups[groupIndex].sections[sectionIndex].fields[fieldIndex], key, value); },

    // ── Options ───────────────────────────────────────────────────────────
    addOption(state) { state.options.push({ key: "", type: "text", default: "", description: "", autoload: true }); },
    removeOption(state, { index }) { Vue.delete(state.options, index); },
    setOptionData(state, { index, key, value }) { Vue.set(state.options[index], key, value); },

    // ── Meta Boxes ────────────────────────────────────────────────────────
    addMetaBox(state) { state.metaBoxes.push({ id: "", title: "", className: "", postTypes: ["post"], context: "normal", priority: "default", fields: [] }); },
    removeMetaBox(state, { index }) { Vue.delete(state.metaBoxes, index); },
    setMetaBoxData(state, { index, key, value }) { Vue.set(state.metaBoxes[index], key, value); },
    addMetaBoxField(state, { index }) { state.metaBoxes[index].fields.push({ key: "", label: "", type: "text", description: "" }); },
    removeMetaBoxField(state, { index, fieldIndex }) { Vue.delete(state.metaBoxes[index].fields, fieldIndex); },
    setMetaBoxFieldData(state, { index, fieldIndex, key, value }) { Vue.set(state.metaBoxes[index].fields[fieldIndex], key, value); },

    // ── Screen Options ────────────────────────────────────────────────────
    addScreenOption(state) { state.screenOptions.push({ option: "", label: "", default: 20, postType: "post" }); },
    removeScreenOption(state, { index }) { Vue.delete(state.screenOptions, index); },
    setScreenOptionData(state, { index, key, value }) { Vue.set(state.screenOptions[index], key, value); },

    // ── REST Callbacks ────────────────────────────────────────────────────
    addRestCallback(state) { state.restCallbacks.push({ namespace: "", route: "", className: "", methods: ["GET"], capability: "read", authRequired: false }); },
    removeRestCallback(state, { index }) { Vue.delete(state.restCallbacks, index); },
    setRestCallbackData(state, { index, key, value }) { Vue.set(state.restCallbacks[index], key, value); },

    // ── User Fields ───────────────────────────────────────────────────────
    addUserField(state) { state.userFields.push({ key: "", label: "", type: "text", section: "", description: "" }); },
    removeUserField(state, { index }) { Vue.delete(state.userFields, index); },
    setUserFieldData(state, { index, key, value }) { Vue.set(state.userFields[index], key, value); },

    // ── Term Fields ───────────────────────────────────────────────────────
    addTermFieldGroup(state) { state.termFieldGroups.push({ taxonomy: "", className: "", fields: [] }); },
    removeTermFieldGroup(state, { index }) { Vue.delete(state.termFieldGroups, index); },
    setTermFieldGroupData(state, { index, key, value }) { Vue.set(state.termFieldGroups[index], key, value); },
    addTermField(state, { groupIndex }) { state.termFieldGroups[groupIndex].fields.push({ key: "", label: "", type: "text", description: "" }); },
    removeTermField(state, { groupIndex, fieldIndex }) { Vue.delete(state.termFieldGroups[groupIndex].fields, fieldIndex); },
    setTermFieldData(state, { groupIndex, fieldIndex, key, value }) { Vue.set(state.termFieldGroups[groupIndex].fields[fieldIndex], key, value); },

    // ── Quick Edit ────────────────────────────────────────────────────────
    addQuickEdit(state) { state.quickEdits.push({ postType: "", className: "", fields: [] }); },
    removeQuickEdit(state, { index }) { Vue.delete(state.quickEdits, index); },
    setQuickEditData(state, { index, key, value }) { Vue.set(state.quickEdits[index], key, value); },
    addQuickEditField(state, { index }) { state.quickEdits[index].fields.push({ key: "", label: "", type: "text" }); },
    removeQuickEditField(state, { index, fieldIndex }) { Vue.delete(state.quickEdits[index].fields, fieldIndex); },
    setQuickEditFieldData(state, { index, fieldIndex, key, value }) { Vue.set(state.quickEdits[index].fields[fieldIndex], key, value); },

    // ── Bulk Edit ─────────────────────────────────────────────────────────
    addBulkEdit(state) { state.bulkEdits.push({ postType: "", className: "", actions: [] }); },
    removeBulkEdit(state, { index }) { Vue.delete(state.bulkEdits, index); },
    setBulkEditData(state, { index, key, value }) { Vue.set(state.bulkEdits[index], key, value); },
    addBulkEditAction(state, { index }) { state.bulkEdits[index].actions.push({ action: "", label: "" }); },
    removeBulkEditAction(state, { index, actionIndex }) { Vue.delete(state.bulkEdits[index].actions, actionIndex); },
    setBulkEditActionData(state, { index, actionIndex, key, value }) { Vue.set(state.bulkEdits[index].actions[actionIndex], key, value); },

    // ── Post REST Fields ──────────────────────────────────────────────────
    addPostRestField(state) { state.postRestFields.push({ fieldName: "", postTypes: ["post"], type: "string", description: "", readonly: false }); },
    removePostRestField(state, { index }) { Vue.delete(state.postRestFields, index); },
    setPostRestFieldData(state, { index, key, value }) { Vue.set(state.postRestFields[index], key, value); },

    // ── Emails ────────────────────────────────────────────────────────────
    addEmail(state) { state.emails.push({ key: "", subject: "", fields: [] }); },
    removeEmail(state, { index }) { Vue.delete(state.emails, index); },
    setEmailData(state, { index, key, value }) { Vue.set(state.emails[index], key, value); },

    // ── Importers ─────────────────────────────────────────────────────────
    addImporter(state) { state.importers.push({ id: "", name: "", description: "", className: "", acceptedTypes: ".csv,.xml,.json" }); },
    removeImporter(state, { index }) { Vue.delete(state.importers, index); },
    setImporterData(state, { index, key, value }) { Vue.set(state.importers[index], key, value); },

    // ── Blocks ────────────────────────────────────────────────────────────
    addBlock(state) {
      state.blocks.push({
        name: "",
        title: "",
        category: "common",
        icon: "block-default",
        description: "",
        keywords: "",
        dynamic: false,
        supportsAnchor: false,
        supportsAlign: false,
        supportsColor: false,
        supportsTypo: false,
        supportsSpacing: false,
        supportsClassName: true,
        attributes: [],
      });
    },
    removeBlock(state, { index }) { Vue.delete(state.blocks, index); },
    setBlockData(state, { index, key, value }) { Vue.set(state.blocks[index], key, value); },
    addBlockAttr(state, { blockIndex }) {
      const block = state.blocks[blockIndex];
      if (!block.attributes) Vue.set(block, 'attributes', []);
      block.attributes.push({ name: "", type: "string", default: "" });
    },
    removeBlockAttr(state, { blockIndex, attrIndex }) {
      Vue.delete(state.blocks[blockIndex].attributes, attrIndex);
    },
    setBlockAttrData(state, { blockIndex, attrIndex, key, value }) {
      Vue.set(state.blocks[blockIndex].attributes[attrIndex], key, value);
    },
  },

  actions: {
    // ── Original ─────────────────────────────────────────────────────────
    setPluginName({ commit, dispatch }, p) { commit("setPluginName", p); dispatch("setFileArchitecture", true); },
    setGeneralData({ commit }, p)          { commit("setGeneralData", p); },
    addNewAssets({ commit }, p)            { commit("addNewAssets", p); },
    setAssetsData({ commit, dispatch }, p) { commit("setAssetsData", p); dispatch("setFileArchitecture", true); },
    setActiveFileName({ commit }, p)       { commit("setActiveFileName", p); },
    setActiveFileCodes({ commit }, p)      { commit("setActiveFileCodes", p); },
    setFileArchitecture({ state, commit }, payload) {
      if (payload) commit("setFileArchitecture", buildTreeData(state.filesTree));
    },
    addNewTable({ commit })          { commit("addNewTable"); },
    addNewTableField({ commit }, p)  { commit("addNewTableField", p); },
    setTableData({ commit }, p)      { commit("setTableData", p); },
    setTableFieldData({ commit }, p) { commit("setTableFieldData", p); },
    deleteTableField({ commit }, p)  { commit("deleteTableField", p); },
    deleteTable({ commit, dispatch }, p) { commit("deleteTable", p); dispatch("setFileArchitecture", true); },
    addNewFileInFileTree({ commit, dispatch }, payload) {
      commit("addNewFileInFileTree", payload);
      if (typeof payload.setFileArchitecture === "undefined") dispatch("setFileArchitecture", true);
    },
    deleteCrudViewFile({ dispatch }, payload) {
      ["new", "edit", "view", "list"].forEach((item) => {
        dispatch("addNewFileInFileTree", { id: `includes_crud_admin_view_file_${item}_${payload.index}`, replace: true });
      });
    },
    addNewRestApi({ commit }, p)             { commit("addNewRestApi", p); },
    addNewRestApiSchemaField({ commit }, p)  { commit("addNewRestApiSchemaField", p); },
    setRestApiSchemaFieldData({ commit }, p) { commit("setRestApiSchemaFieldData", p); },
    deleteRestApi({ commit }, p)             { commit("deleteRestApi", p); },
    deleteRestApiSchemaField({ commit }, p)  { commit("deleteRestApiSchemaField", p); },
    setRestApiData({ commit }, p)            { commit("setRestApiData", p); },
    setStateData({ commit, dispatch }, p) { commit("setStateData", p); dispatch("setFileArchitecture", true); },
    setMainMenuData({ commit, dispatch }, p) { commit("setMainMenuData", p); dispatch("setFileArchitecture", true); },

    // ── New features (all trigger file tree rebuild) ───────────────────────
    addCpt({ commit, dispatch })           { commit("addCpt");  dispatch("setFileArchitecture", true); },
    removeCpt({ commit, dispatch }, p)     { commit("removeCpt", p); dispatch("setFileArchitecture", true); },
    setCptData({ commit, dispatch }, p)    { commit("setCptData", p); dispatch("setFileArchitecture", true); },

    addSettingsGroup({ commit, dispatch })                         { commit("addSettingsGroup"); dispatch("setFileArchitecture", true); },
    removeSettingsGroup({ commit, dispatch }, p)                   { commit("removeSettingsGroup", p); dispatch("setFileArchitecture", true); },
    setSettingsGroupData({ commit, dispatch }, p)                  { commit("setSettingsGroupData", p); dispatch("setFileArchitecture", true); },
    addSettingsSection({ commit, dispatch }, p)                    { commit("addSettingsSection", p); dispatch("setFileArchitecture", true); },
    removeSettingsSection({ commit, dispatch }, p)                 { commit("removeSettingsSection", p); dispatch("setFileArchitecture", true); },
    setSettingsSectionData({ commit, dispatch }, p)                { commit("setSettingsSectionData", p); dispatch("setFileArchitecture", true); },
    addSettingsField({ commit, dispatch }, p)                      { commit("addSettingsField", p); dispatch("setFileArchitecture", true); },
    removeSettingsField({ commit, dispatch }, p)                   { commit("removeSettingsField", p); dispatch("setFileArchitecture", true); },
    setSettingsFieldData({ commit, dispatch }, p)                  { commit("setSettingsFieldData", p); dispatch("setFileArchitecture", true); },

    addOption({ commit, dispatch })        { commit("addOption"); dispatch("setFileArchitecture", true); },
    removeOption({ commit, dispatch }, p)  { commit("removeOption", p); dispatch("setFileArchitecture", true); },
    setOptionData({ commit, dispatch }, p) { commit("setOptionData", p); dispatch("setFileArchitecture", true); },

    addMetaBox({ commit, dispatch })             { commit("addMetaBox"); dispatch("setFileArchitecture", true); },
    removeMetaBox({ commit, dispatch }, p)       { commit("removeMetaBox", p); dispatch("setFileArchitecture", true); },
    setMetaBoxData({ commit, dispatch }, p)      { commit("setMetaBoxData", p); dispatch("setFileArchitecture", true); },
    addMetaBoxField({ commit, dispatch }, p)     { commit("addMetaBoxField", p); dispatch("setFileArchitecture", true); },
    removeMetaBoxField({ commit, dispatch }, p)  { commit("removeMetaBoxField", p); dispatch("setFileArchitecture", true); },
    setMetaBoxFieldData({ commit, dispatch }, p) { commit("setMetaBoxFieldData", p); dispatch("setFileArchitecture", true); },

    addScreenOption({ commit, dispatch })        { commit("addScreenOption"); dispatch("setFileArchitecture", true); },
    removeScreenOption({ commit, dispatch }, p)  { commit("removeScreenOption", p); dispatch("setFileArchitecture", true); },
    setScreenOptionData({ commit, dispatch }, p) { commit("setScreenOptionData", p); dispatch("setFileArchitecture", true); },

    addRestCallback({ commit, dispatch })        { commit("addRestCallback"); dispatch("setFileArchitecture", true); },
    removeRestCallback({ commit, dispatch }, p)  { commit("removeRestCallback", p); dispatch("setFileArchitecture", true); },
    setRestCallbackData({ commit, dispatch }, p) { commit("setRestCallbackData", p); dispatch("setFileArchitecture", true); },

    addUserField({ commit, dispatch })           { commit("addUserField"); dispatch("setFileArchitecture", true); },
    removeUserField({ commit, dispatch }, p)     { commit("removeUserField", p); dispatch("setFileArchitecture", true); },
    setUserFieldData({ commit, dispatch }, p)    { commit("setUserFieldData", p); dispatch("setFileArchitecture", true); },

    addTermFieldGroup({ commit, dispatch })          { commit("addTermFieldGroup"); dispatch("setFileArchitecture", true); },
    removeTermFieldGroup({ commit, dispatch }, p)    { commit("removeTermFieldGroup", p); dispatch("setFileArchitecture", true); },
    setTermFieldGroupData({ commit, dispatch }, p)   { commit("setTermFieldGroupData", p); dispatch("setFileArchitecture", true); },
    addTermField({ commit, dispatch }, p)            { commit("addTermField", p); dispatch("setFileArchitecture", true); },
    removeTermField({ commit, dispatch }, p)         { commit("removeTermField", p); dispatch("setFileArchitecture", true); },
    setTermFieldData({ commit, dispatch }, p)        { commit("setTermFieldData", p); dispatch("setFileArchitecture", true); },

    addQuickEdit({ commit, dispatch })              { commit("addQuickEdit"); dispatch("setFileArchitecture", true); },
    removeQuickEdit({ commit, dispatch }, p)        { commit("removeQuickEdit", p); dispatch("setFileArchitecture", true); },
    setQuickEditData({ commit, dispatch }, p)       { commit("setQuickEditData", p); dispatch("setFileArchitecture", true); },
    addQuickEditField({ commit, dispatch }, p)      { commit("addQuickEditField", p); dispatch("setFileArchitecture", true); },
    removeQuickEditField({ commit, dispatch }, p)   { commit("removeQuickEditField", p); dispatch("setFileArchitecture", true); },
    setQuickEditFieldData({ commit, dispatch }, p)  { commit("setQuickEditFieldData", p); dispatch("setFileArchitecture", true); },

    addBulkEdit({ commit, dispatch })               { commit("addBulkEdit"); dispatch("setFileArchitecture", true); },
    removeBulkEdit({ commit, dispatch }, p)         { commit("removeBulkEdit", p); dispatch("setFileArchitecture", true); },
    setBulkEditData({ commit, dispatch }, p)        { commit("setBulkEditData", p); dispatch("setFileArchitecture", true); },
    addBulkEditAction({ commit, dispatch }, p)      { commit("addBulkEditAction", p); dispatch("setFileArchitecture", true); },
    removeBulkEditAction({ commit, dispatch }, p)   { commit("removeBulkEditAction", p); dispatch("setFileArchitecture", true); },
    setBulkEditActionData({ commit, dispatch }, p)  { commit("setBulkEditActionData", p); dispatch("setFileArchitecture", true); },

    addPostRestField({ commit, dispatch })          { commit("addPostRestField"); dispatch("setFileArchitecture", true); },
    removePostRestField({ commit, dispatch }, p)    { commit("removePostRestField", p); dispatch("setFileArchitecture", true); },
    setPostRestFieldData({ commit, dispatch }, p)   { commit("setPostRestFieldData", p); dispatch("setFileArchitecture", true); },

    addEmail({ commit, dispatch })                  { commit("addEmail"); dispatch("setFileArchitecture", true); },
    removeEmail({ commit, dispatch }, p)            { commit("removeEmail", p); dispatch("setFileArchitecture", true); },
    setEmailData({ commit, dispatch }, p)           { commit("setEmailData", p); dispatch("setFileArchitecture", true); },

    addImporter({ commit, dispatch })               { commit("addImporter"); dispatch("setFileArchitecture", true); },
    removeImporter({ commit, dispatch }, p)         { commit("removeImporter", p); dispatch("setFileArchitecture", true); },
    setImporterData({ commit, dispatch }, p)        { commit("setImporterData", p); dispatch("setFileArchitecture", true); },

    // ── Blocks ──────────────────────────────────────────────────────────────
    addBlock({ commit, dispatch })                  { commit("addBlock"); dispatch("setFileArchitecture", true); },
    removeBlock({ commit, dispatch }, p)            { commit("removeBlock", p); dispatch("setFileArchitecture", true); },
    setBlockData({ commit, dispatch }, p)           { commit("setBlockData", p); dispatch("setFileArchitecture", true); },
    addBlockAttr({ commit, dispatch }, p)           { commit("addBlockAttr", p); dispatch("setFileArchitecture", true); },
    removeBlockAttr({ commit, dispatch }, p)        { commit("removeBlockAttr", p); dispatch("setFileArchitecture", true); },
    setBlockAttrData({ commit, dispatch }, p)       { commit("setBlockAttrData", p); dispatch("setFileArchitecture", true); },
  },

  modules: {},
};

export default new Vuex.Store(store);
