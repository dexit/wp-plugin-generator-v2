/**
 * WP Plugin Generator — shared helper utilities.
 *
 * Naming convention helpers:
 *   toSlug()        → 'my-plugin'   (text domain, URL slug)
 *   toLowerSnake()  → 'my_plugin'   (function prefix)
 *   toUpperSnake()  → 'MY_PLUGIN'   (constant prefix)
 *   toPascalCase()  → 'MyPlugin'    (class name, namespace)
 *   autofillFromName() → derives all general fields from a plugin name
 */

// ─── Original helpers (preserved) ────────────────────────────────────────────

/**
 * Make a kebab-case slug from a string value.
 * @param {string} value
 * @param {string} separator defaults to '-'
 * @returns {string}
 */
export const slug = (value, separator = '-') =>
  value.toLowerCase().replace(/[\s_]+/g, separator).replace(/[^a-z0-9-]/g, '');

/**
 * Title-case a string.
 * @param {string} value
 * @returns {string}
 */
export const titleCase = (value) =>
  value.replace(/(^|\s)\S/g, (t) => t.toUpperCase());

// ─── Naming conventions ───────────────────────────────────────────────────────

/**
 * Convert any string to a lowercase-hyphen slug.
 * 'My Cool Plugin' → 'my-cool-plugin'
 * @param {string} value
 * @returns {string}
 */
export const toSlug = (value) =>
  (value || '')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')   // split camelCase
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Convert any string to lower_snake_case.
 * 'My Cool Plugin' → 'my_cool_plugin'
 * @param {string} value
 * @returns {string}
 */
export const toLowerSnake = (value) =>
  (value || '')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

/**
 * Convert any string to UPPER_SNAKE_CASE.
 * 'My Cool Plugin' → 'MY_COOL_PLUGIN'
 * @param {string} value
 * @returns {string}
 */
export const toUpperSnake = (value) => toLowerSnake(value).toUpperCase();

/**
 * Convert any string to PascalCase.
 * 'my cool plugin' → 'MyCoolPlugin'
 * @param {string} value
 * @returns {string}
 */
export const toPascalCase = (value) =>
  (value || '')
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

/**
 * Derive all general plugin fields from a plugin name string.
 * Useful for the "autofill" feature in Step 1.
 *
 * @param {string} name  e.g. 'My Events Plugin'
 * @returns {Object}  partial general state
 */
export const autofillFromName = (name) => {
  if (!name) return {};
  return {
    textDomain:     toSlug(name),
    mainClassName:  toPascalCase(name),
    baseNamespace:  toPascalCase(name),
    constantPrefix: toUpperSnake(name),
    functionPrefix: toLowerSnake(name),
  };
};

/**
 * Derive a CPT class name from a post type slug.
 * 'event' → 'Event_CPT'
 * @param {string} postType
 * @returns {string}
 */
export const cptClassName = (postType) =>
  postType ? `${toPascalCase(postType)}_CPT` : '';

/**
 * Derive a CPT REST route from a post type slug.
 * 'event' → '/events'
 * @param {string} postType
 * @returns {string}
 */
export const cptRestRoute = (postType) =>
  postType ? `/${toSlug(postType)}s` : '';

/**
 * Derive a default REST namespace from text domain.
 * 'my-plugin' → 'my-plugin/v1'
 * @param {string} textDomain
 * @returns {string}
 */
export const defaultRestNamespace = (textDomain) =>
  textDomain ? `${textDomain}/v1` : '';

// ─── Array helpers ────────────────────────────────────────────────────────────

/**
 * Move an item in an array (returns a new array).
 * @param {Array} arr
 * @param {number} from
 * @param {number} to
 * @returns {Array}
 */
export const moveItem = (arr, from, to) => {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Generate a unique ID string.
 * @returns {string}
 */
export const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Download helpers ─────────────────────────────────────────────────────────

/**
 * Trigger a file download in the browser.
 * @param {string} content  File content string
 * @param {string} filename
 * @param {string} [mime]   MIME type
 */
export const downloadText = (content, filename, mime = 'text/plain') => {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
