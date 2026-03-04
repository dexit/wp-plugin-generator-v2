import {
  validateFields,
  validateTableSetting,
  validateRestApiSetting,
} from "./fields";
import { mainPluginCode }     from "./main-plugin";
import { assetsCode }         from "./assets";
import { composerCode }       from "./composer";
import { installerCode }      from "./installer";
import { wpCrudFunctions }    from "./curd-php-snippet";
import { dynamicMenuPageHandler } from "./dynamic-menu-page-handler";
import { adminCode }          from "./admin-snippet";
import { listTableCode }      from "./list-table";
import { viewSnippet }        from "./views/index";
import { restapiSnippet }     from "./restapi-snippet";
import { apiSnippetCode }     from "./api-snippet";
import { shortcodeSnippet }   from "./shortcode-snippet";
import { frontendSnippet }    from "./frontend-snippet";
import { menuSnippet }        from "./menu-snippet";
import { formErrorSnippet }   from "./form-error";
import { gitIgnoreCode }      from "./gitignore-snippet";
import { editorconfigCode }   from "./editorconfig-snippet";
import { phpcsCode }          from "./phpcs-snippet";
import { eslintignoreCode }   from "./eslintignore-snippet";
import { eslintrcCode }       from "./eslintrc-snippet";
import { prettierrcCode }     from "./prettierrc-snippet";
import { readmeCode }         from "./readme-snippet";

// ── New generators ────────────────────────────────────────────────────────
import { cptSnippet }            from "./cpt-snippet";
import { settingsSnippet }       from "./settings-snippet";
import { optionsSnippet }        from "./options-snippet";
import { metaBoxSnippet }        from "./meta-box-snippet";
import { screenOptionsSnippet }  from "./screen-options-snippet";
import { restCallbackSnippet }   from "./rest-callback-snippet";
import { userFieldsSnippet }     from "./user-fields-snippet";
import { termFieldsSnippet }     from "./term-fields-snippet";
import { quickEditSnippet }      from "./quick-edit-snippet";
import { bulkEditSnippet }       from "./bulk-edit-snippet";
import { postRestFieldsSnippet } from "./post-rest-fields-snippet";
import { requestUtilsSnippet }   from "./request-utils-snippet";
import { dbUtilsSnippet }        from "./db-utils-snippet";
import { emailSnippet }          from "./email-snippet";
import { importerSnippet }       from "./importer-snippet";
import { allBlockFiles, blocksPhpSnippet, blocksPackageJsonSnippet, blocksWebpackConfigSnippet } from "./blocks-snippet";

export const CodeBase = {
  // ── Original ─────────────────────────────────────────────────────────────
  mainPluginCode: (data) => mainPluginCode(validateFields(data)),
  assetsCode:     (data, assets) => assetsCode(validateFields(data), assets),
  composerCode:   (data) => composerCode(validateFields(data)),
  installerCode:  (data, tables) => installerCode(validateFields(data), tables),
  functionsCode:  (data, tables) => wpCrudFunctions(validateFields(data), tables),
  dynamicMenuPageHandler: (data, table) => dynamicMenuPageHandler(validateFields(data), table),
  adminCode:      (data, tables) => adminCode(validateFields(data), tables),
  listTableCode:  (fileClassName, data, table) => listTableCode(fileClassName, validateFields(data), table),
  adminViewCode:  (viewType, data, table) => viewSnippet(viewType, validateFields(data), table),
  restapiCode: (data, restApiData, settings, singleRestApi = false) => {
    settings = singleRestApi ? settings : validateTableSetting(settings);
    return restapiSnippet(validateFields(data), validateRestApiSetting(restApiData), settings, singleRestApi);
  },
  apiCode:           (data, restapis) => apiSnippetCode(validateFields(data), restapis),
  frontendShortcode: (data) => shortcodeSnippet(validateFields(data)),
  frontendCode:      (data) => frontendSnippet(validateFields(data)),
  menuCode:          (data, tables, mainMenu) => menuSnippet(validateFields(data), tables, mainMenu),
  formErrorCode:     (data) => formErrorSnippet(validateFields(data)),
  gitIgnoreCode:     () => gitIgnoreCode(),
  editorconfigCode:  () => editorconfigCode(),
  phpcsCode:         () => phpcsCode(),
  eslintignoreCode:  () => eslintignoreCode(),
  eslintrcCode:      () => eslintrcCode(),
  prettierrcCode:    () => prettierrcCode(),
  readmeCode:        (data) => readmeCode(validateFields(data)),

  // ── New generators ────────────────────────────────────────────────────────
  cptCode:            (data, cpts)          => cptSnippet(validateFields(data), cpts),
  settingsCode:       (data, groups)        => settingsSnippet(validateFields(data), groups),
  optionsCode:        (data, options)       => optionsSnippet(validateFields(data), options),
  metaBoxCode:        (data, metaBoxes)     => metaBoxSnippet(validateFields(data), metaBoxes),
  screenOptionsCode:  (data, opts)          => screenOptionsSnippet(validateFields(data), opts),
  restCallbackCode:   (data, callbacks)     => restCallbackSnippet(validateFields(data), callbacks),
  userFieldsCode:     (data, fields)        => userFieldsSnippet(validateFields(data), fields),
  termFieldsCode:     (data, groups)        => termFieldsSnippet(validateFields(data), groups),
  quickEditCode:      (data, qe)            => quickEditSnippet(validateFields(data), qe),
  bulkEditCode:       (data, be)            => bulkEditSnippet(validateFields(data), be),
  postRestFieldsCode: (data, fields)        => postRestFieldsSnippet(validateFields(data), fields),
  requestUtilsCode:   (data)               => requestUtilsSnippet(validateFields(data)),
  dbUtilsCode:        (data)               => dbUtilsSnippet(validateFields(data)),
  emailCode:          (data, emails)        => emailSnippet(validateFields(data), emails),
  importerCode:       (data, importers)     => importerSnippet(validateFields(data), importers),

  // ── Blocks ────────────────────────────────────────────────────────────────
  blocksPhpCode:         (data, blocks) => blocksPhpSnippet(validateFields(data), blocks),
  blocksPackageJson:     (data)         => blocksPackageJsonSnippet(validateFields(data)),
  blocksWebpackConfig:   (data, blocks) => blocksWebpackConfigSnippet(validateFields(data), blocks),
  allBlockFiles:         (data, blocks) => allBlockFiles(validateFields(data), blocks),
};
