/**
 * Options API code generator.
 * Generates a typed Options class for WP 6.9+ / PHP 8.2+.
 */

const toPascalCase = (str) => {
  if (!str) return 'Options';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const phpType = (type) => {
  const map = { number: 'int', checkbox: 'bool', float: 'float' };
  return map[type] || 'string';
};

const defaultCast = (type, def) => {
  if (type === 'number')   return def ? `(int) ${def}` : '0';
  if (type === 'checkbox') return def === '1' || def === true ? 'true' : 'false';
  if (type === 'float')    return def ? `(float) ${def}` : '0.0';
  return def ? `'${def}'` : "''";
};

const makeGetter = (opt, prefix) => {
  const method = 'get_' + opt.key.replace(/-/g, '_');
  const type   = phpType(opt.type);
  const defVal = defaultCast(opt.type, opt.default);
  return `
    /**
     * Get option: ${opt.description || opt.key}
     *
     * @return ${type}
     */
    public function ${method}(): ${type} {
        return (${type}) get_option( '${prefix}${opt.key}', ${defVal} );
    }`;
};

const makeSetter = (opt, prefix) => {
  const method = 'set_' + opt.key.replace(/-/g, '_');
  const type   = phpType(opt.type);
  const auto   = opt.autoload ? 'yes' : 'no';
  return `
    /**
     * Set option: ${opt.description || opt.key}
     *
     * @param ${type} $value
     *
     * @return bool
     */
    public function ${method}( ${type} $value ): bool {
        return update_option( '${prefix}${opt.key}', $value, '${auto}' );
    }`;
};

const makeDeleter = (opt, prefix) => {
  const method = 'delete_' + opt.key.replace(/-/g, '_');
  return `
    /**
     * Delete option: ${opt.description || opt.key}
     *
     * @return bool
     */
    public function ${method}(): bool {
        return delete_option( '${prefix}${opt.key}' );
    }`;
};

export const optionsSnippet = (data, options) => {
  const valid  = (options || []).filter((o) => o.key);
  const prefix = data.functionPrefix ? data.functionPrefix + '_' : '';

  const registerBlock = valid.length
    ? `
    /**
     * Register all options with default values (called on activation).
     */
    public function register_defaults(): void {
${valid.map((o) => `        add_option( '${prefix}${o.key}', ${defaultCast(o.type, o.default)}, '', '${o.autoload ? 'yes' : 'no'}' );`).join("\n")}
    }

    /**
     * Unregister all options (called on uninstall).
     */
    public function unregister_all(): void {
${valid.map((o) => `        delete_option( '${prefix}${o.key}' );`).join("\n")}
    }`
    : `
    public function register_defaults(): void {}
    public function unregister_all(): void {}`;

  const accessors = valid.map((o) => [
    makeGetter(o, prefix),
    makeSetter(o, prefix),
    makeDeleter(o, prefix),
  ].join('')).join("\n");

  return `<?php
/**
 * Plugin Options — typed accessors for the WordPress Options API.
 *
 * @package ${data.baseNamespace}
 */

namespace ${data.baseNamespace};

/**
 * Class Options
 *
 * Usage:
 *   $options = new \\${data.baseNamespace}\\Options();
 *   $value   = $options->get_my_option();
 *   $options->set_my_option( 'new value' );
 */
final class Options {

    /**
     * Shared instance.
     */
    private static ?self $instance = null;

    public static function get_instance(): static {
        if ( null === static::$instance ) {
            static::$instance = new static();
        }
        return static::$instance;
    }
${registerBlock}
${accessors}
}
`;
};
