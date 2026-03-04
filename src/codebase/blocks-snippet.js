/**
 * WP Blocks code generator.
 *
 * Generates:
 *  - block.json (block metadata)
 *  - Blocks.php  (register_block_type via PHP 8.2+ class)
 *  - blocks/src/block-name/index.js (editor JS with @wordpress/blocks)
 *  - blocks/src/block-name/editor.css
 *  - blocks/src/block-name/style.css
 *  - blocks/package.json (@wordpress/scripts toolchain)
 *  - blocks/webpack.config.js (optional override)
 *
 * @since 1.0.0
 */

// ─── Helpers ───────────────────────────────────────────────────────────────

const toPascalCase = (str) =>
  str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toUpperCase());

const toCamelCase = (str) =>
  str.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase());

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// ─── block.json ────────────────────────────────────────────────────────────

/**
 * Generate a block.json metadata file for a single block.
 *
 * @param {Object} data  - Plugin general data.
 * @param {Object} block - Block configuration object.
 * @returns {string}
 */
export const blockJsonSnippet = (data, block) => {
  const namespace = toSlug(data.textDomain || 'myplugin');
  const blockSlug  = toSlug(block.name || 'my-block');
  const className  = toPascalCase(blockSlug);

  const attrs = (block.attributes || []).reduce((acc, attr) => {
    acc[attr.name] = {
      type: attr.type || 'string',
      ...(attr.default !== '' && attr.default !== undefined
        ? { default: attr.type === 'boolean' ? attr.default === 'true' : attr.default }
        : {}),
    };
    return acc;
  }, {});

  const supports = {
    html: false,
    ...(block.supportsAlign     ? { align: true }           : {}),
    ...(block.supportsAnchor    ? { anchor: true }          : {}),
    ...(block.supportsClassName ? { customClassName: true } : {}),
    ...(block.supportsColor     ? { color: { background: true, text: true } } : {}),
    ...(block.supportsTypo      ? { typography: { fontSize: true, lineHeight: true } } : {}),
    ...(block.supportsSpacing   ? { spacing: { margin: true, padding: true } } : {}),
  };

  const meta = {
    $schema:    'https://schemas.wp.org/trunk/block.json',
    apiVersion: 3,
    name:       `${namespace}/${blockSlug}`,
    version:    data.version || '1.0.0',
    title:      block.title  || className,
    category:   block.category || 'common',
    icon:       block.icon   || 'block-default',
    description: block.description || '',
    keywords:   block.keywords ? block.keywords.split(',').map((k) => k.trim()) : [],
    textdomain: namespace,
    editorScript: 'file:./index.js',
    editorStyle:  'file:./editor.css',
    style:        'file:./style.css',
    ...(block.dynamic ? { render: 'file:./render.php' } : {}),
    supports,
    ...(Object.keys(attrs).length ? { attributes: attrs } : {}),
  };

  return JSON.stringify(meta, null, '\t');
};

// ─── Blocks.php ────────────────────────────────────────────────────────────

/**
 * Generate the PHP class that registers all blocks.
 *
 * @param {Object}   data   - Plugin general data.
 * @param {Object[]} blocks - Array of block configurations.
 * @returns {string}
 */
export const blocksPhpSnippet = (data, blocks) => {
  if ( ! blocks || blocks.length === 0 ) return '';

  const ns     = data.baseNamespace || 'MyPlugin';
  const prefix = data.constantPrefix || 'MYPLUGIN';
  const version = data.version || '1.0.0';

  const registerCalls = blocks
    .map((block) => {
      const slug = toSlug(block.name || 'my-block');
      const dynamic = block.dynamic;
      return `\t\tregister_block_type(
\t\t\t${prefix}_PATH . '/blocks/build/${slug}',
\t\t\t${dynamic
        ? `[
\t\t\t\t'render_callback' => [ $this, 'render_${slug.replace(/-/g, '_')}' ],
\t\t\t]`
        : '[]'}
\t\t);`;
    })
    .join( '\n\n' );

  const renderMethods = blocks
    .filter( (b) => b.dynamic )
    .map( (block) => {
      const slug   = toSlug(block.name || 'my-block');
      const method = `render_${slug.replace(/-/g, '_')}`;
      return `
\t/**
\t * Server-side render callback for the ${toSlug(block.name)} block.
\t *
\t * @since ${version}
\t *
\t * @param array    $attributes Block attributes.
\t * @param string   $content    Block inner content.
\t * @param WP_Block $block      Block instance.
\t *
\t * @return string Rendered HTML.
\t */
\tpublic function ${method}(
\t\tarray    $attributes,
\t\tstring   $content,
\t\t\\WP_Block $block
\t): string {
\t\t$wrapper_attributes = get_block_wrapper_attributes();
\t\tob_start();
\t\t?>
\t\t<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
\t\t\t<?php echo wp_kses_post( $content ); ?>
\t\t</div>
\t\t<?php
\t\treturn (string) ob_get_clean();
\t}`;
    } )
    .join( '\n' );

  return `<?php
/**
 * Block registration class.
 *
 * Registers all blocks defined in the blocks/build directory.
 *
 * @package ${data.pluginName || ns}
 * @since   ${version}
 */

declare( strict_types=1 );

namespace ${ns};

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
\texit;
}

/**
 * Blocks class.
 *
 * @since ${version}
 */
class Blocks {

\t/**
\t * Constructor: hooks block registration into 'init'.
\t *
\t * @since ${version}
\t */
\tpublic function __construct() {
\t\tadd_action( 'init', [ $this, 'register_blocks' ] );
\t}

\t/**
\t * Register all plugin blocks via their block.json manifests.
\t *
\t * @since ${version}
\t *
\t * @return void
\t */
\tpublic function register_blocks(): void {
${registerCalls}
\t}
${renderMethods}
}
`;
};

// ─── Block index.js (editor) ───────────────────────────────────────────────

/**
 * Generate the block editor JS entry point (index.js).
 *
 * @param {Object} data  - Plugin general data.
 * @param {Object} block - Block configuration.
 * @returns {string}
 */
export const blockIndexJsSnippet = (data, block) => {
  const namespace = toSlug(data.textDomain || 'myplugin');
  const blockSlug  = toSlug(block.name || 'my-block');
  const className  = toPascalCase(blockSlug);
  const isDynamic  = block.dynamic;

  const attrDestructure = (block.attributes || [])
    .map((a) => a.name)
    .join(', ');

  const attrControls = (block.attributes || [])
    .filter((a) => a.type !== 'object' && a.type !== 'array')
    .map((a) => {
      if (a.type === 'boolean') {
        return `\t\t\t\t\t<PanelRow>
\t\t\t\t\t\t<ToggleControl
\t\t\t\t\t\t\tlabel="${a.name}"
\t\t\t\t\t\t\tchecked={${a.name}}
\t\t\t\t\t\t\tonChange={(val) => setAttributes({ ${a.name}: val })}
\t\t\t\t\t\t/>
\t\t\t\t\t</PanelRow>`;
      }
      if (a.type === 'number' || a.type === 'integer') {
        return `\t\t\t\t\t<PanelRow>
\t\t\t\t\t\t<RangeControl
\t\t\t\t\t\t\tlabel="${a.name}"
\t\t\t\t\t\t\tvalue={${a.name}}
\t\t\t\t\t\t\tonChange={(val) => setAttributes({ ${a.name}: val })}
\t\t\t\t\t\t\tmin={0}
\t\t\t\t\t\t\tmax={100}
\t\t\t\t\t\t/>
\t\t\t\t\t</PanelRow>`;
      }
      return `\t\t\t\t\t<PanelRow>
\t\t\t\t\t\t<TextControl
\t\t\t\t\t\t\tlabel="${a.name}"
\t\t\t\t\t\t\tvalue={${a.name} ?? ''}
\t\t\t\t\t\t\tonChange={(val) => setAttributes({ ${a.name}: val })}
\t\t\t\t\t\t/>
\t\t\t\t\t</PanelRow>`;
    })
    .join('\n');

  const hasControls = attrControls.length > 0;

  const controlImports = hasControls
    ? `import {
\tPanelBody,
\tPanelRow,
\tTextControl,
\tToggleControl,
\tRangeControl,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
`
    : `import { useBlockProps } from '@wordpress/block-editor';
`;

  const editReturn = isDynamic
    ? `\tconst blockProps = useBlockProps();
\treturn (
\t\t<div {...blockProps}>
\t\t\t<p>{ __( '${block.title || className} — server-side rendered.', '${namespace}' ) }</p>
\t\t</div>
\t);`
    : `\tconst blockProps = useBlockProps();
\treturn (
\t\t<>
${hasControls ? `\t\t\t<InspectorControls>
\t\t\t\t<PanelBody title={ __( 'Settings', '${namespace}' ) }>
${attrControls}
\t\t\t\t</PanelBody>
\t\t\t</InspectorControls>` : ''}
\t\t\t<div {...blockProps}>
\t\t\t\t<RichText
\t\t\t\t\ttagName="p"
\t\t\t\t\tvalue={ ${(block.attributes || [])[0]?.name || 'content'} }
\t\t\t\t\tonChange={ (val) => setAttributes({ ${(block.attributes || [])[0]?.name || 'content'}: val }) }
\t\t\t\t\tplaceholder={ __( 'Write something…', '${namespace}' ) }
\t\t\t\t/>
\t\t\t</div>
\t\t</>
\t);`;

  return `/**
 * ${block.title || className} block.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps${hasControls ? ', RichText' : ', RichText'} } from '@wordpress/block-editor';
${controlImports}
import './editor.css';
import './style.css';

import metadata from './block.json';

/**
 * Edit component — renders in the block editor.
 *
 * @param {Object} props           Block props.
 * @param {Object} props.attributes Block attributes.
 * @param {Function} props.setAttributes Setter.
 * @returns {JSX.Element}
 */
function Edit({ attributes, setAttributes }) {
\tconst { ${attrDestructure || 'content'} } = attributes;
${editReturn}
}

${!isDynamic ? `/**
 * Save component — renders on the frontend.
 *
 * @param {Object} props Block props.
 * @returns {JSX.Element}
 */
function Save({ attributes }) {
\tconst { ${attrDestructure || 'content'} } = attributes;
\tconst blockProps = useBlockProps.save();
\treturn (
\t\t<div {...blockProps}>
\t\t\t<RichText.Content
\t\t\t\ttagName="p"
\t\t\t\tvalue={ ${(block.attributes || [])[0]?.name || 'content'} }
\t\t\t/>
\t\t</div>
\t);
}` : ''}

registerBlockType( metadata.name, {
\tedit: Edit,
${!isDynamic ? '\tsave: Save,' : '\tsave: () => null,'}
} );
`;
};

// ─── editor.css ────────────────────────────────────────────────────────────

/**
 * Generate placeholder editor.css for a block.
 *
 * @param {Object} block - Block configuration.
 * @returns {string}
 */
export const blockEditorCssSnippet = (block) => {
  const slug = toSlug(block.name || 'my-block');
  return `/**
 * ${block.title || slug} block editor styles.
 */

.wp-block-${slug} {
\t/* Editor-only styles */
\tborder: 1px dashed #ccc;
\tpadding: 1rem;
}
`;
};

// ─── style.css ─────────────────────────────────────────────────────────────

/**
 * Generate placeholder style.css for a block (shared editor + frontend).
 *
 * @param {Object} block - Block configuration.
 * @returns {string}
 */
export const blockStyleCssSnippet = (block) => {
  const slug = toSlug(block.name || 'my-block');
  return `/**
 * ${block.title || slug} block styles (editor + frontend).
 */

.wp-block-${slug} {
\tpadding: 1rem;
}
`;
};

// ─── render.php (dynamic blocks) ───────────────────────────────────────────

/**
 * Generate render.php for dynamic blocks.
 *
 * @param {Object} data  - Plugin general data.
 * @param {Object} block - Block configuration.
 * @returns {string}
 */
export const blockRenderPhpSnippet = (data, block) => {
  const slug = toSlug(block.name || 'my-block');
  const ns   = data.textDomain || 'myplugin';
  return `<?php
/**
 * Dynamic render template for the ${block.title || slug} block.
 *
 * @var array    $attributes Block attributes passed from JS.
 * @var string   $content    InnerBlocks content.
 * @var WP_Block $block      The block instance.
 *
 * @package ${data.pluginName || ns}
 * @since   ${data.version || '1.0.0'}
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
\texit;
}

$wrapper_attributes = get_block_wrapper_attributes();
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
\t<?php echo wp_kses_post( $content ); ?>
</div>
`;
};

// ─── blocks/package.json ───────────────────────────────────────────────────

/**
 * Generate blocks/package.json using @wordpress/scripts toolchain.
 *
 * @param {Object} data - Plugin general data.
 * @returns {string}
 */
export const blocksPackageJsonSnippet = (data) => {
  const name = toSlug(data.textDomain || 'my-plugin');
  return JSON.stringify(
    {
      name:    `${name}-blocks`,
      version: data.version || '1.0.0',
      private: true,
      description: `Gutenberg blocks for the ${data.pluginName || name} plugin`,
      license: data.license || 'GPL-2.0-or-later',
      scripts: {
        build:  'wp-scripts build',
        format: 'wp-scripts format',
        lint:   'wp-scripts lint-js',
        start:  'wp-scripts start',
        packages: 'wp-scripts packages-update',
      },
      devDependencies: {
        '@wordpress/scripts': '^30.0.0',
      },
      dependencies: {
        '@wordpress/blocks':       '^13.0.0',
        '@wordpress/block-editor': '^14.0.0',
        '@wordpress/components':   '^28.0.0',
        '@wordpress/i18n':         '^5.0.0',
        '@wordpress/primitives':   '^4.0.0',
      },
    },
    null,
    '\t'
  );
};

// ─── blocks webpack.config.js ──────────────────────────────────────────────

/**
 * Generate a minimal webpack.config.js that extends @wordpress/scripts.
 *
 * @param {Object}   data   - Plugin general data.
 * @param {Object[]} blocks - Block configurations.
 * @returns {string}
 */
export const blocksWebpackConfigSnippet = (data, blocks) => {
  const entries = (blocks || [])
    .map((b) => {
      const slug = toSlug(b.name || 'my-block');
      return `\t'${slug}/index': path.resolve( srcDir, '${slug}/index.js' ),`;
    })
    .join('\n');

  return `/**
 * Webpack configuration — extends @wordpress/scripts defaults.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#advanced-usage
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path          = require( 'path' );

const srcDir  = path.resolve( __dirname, 'src' );
const distDir = path.resolve( __dirname, 'build' );

module.exports = {
\t...defaultConfig,
\tentry: {
${entries}
\t},
\toutput: {
\t\t...defaultConfig.output,
\t\tpath: distDir,
\t},
};
`;
};

// ─── Master aggregator ─────────────────────────────────────────────────────

/**
 * Produce all block-related files as an object keyed by relative path.
 *
 * @param {Object}   data   - Plugin general data.
 * @param {Object[]} blocks - Block configurations.
 * @returns {Object.<string, string>} Map of filepath → file content.
 */
export const allBlockFiles = (data, blocks) => {
  if ( ! blocks || blocks.length === 0 ) return {};

  const files = {};

  // PHP registration class
  files['includes/Blocks.php'] = blocksPhpSnippet(data, blocks);

  // blocks toolchain
  files['blocks/package.json']      = blocksPackageJsonSnippet(data);
  files['blocks/webpack.config.js'] = blocksWebpackConfigSnippet(data, blocks);

  // Per-block files
  blocks.forEach((block) => {
    const slug = toSlug(block.name || 'my-block');

    files[`blocks/src/${slug}/block.json`] = blockJsonSnippet(data, block);
    files[`blocks/src/${slug}/index.js`]   = blockIndexJsSnippet(data, block);
    files[`blocks/src/${slug}/editor.css`] = blockEditorCssSnippet(block);
    files[`blocks/src/${slug}/style.css`]  = blockStyleCssSnippet(block);

    if (block.dynamic) {
      files[`blocks/src/${slug}/render.php`] = blockRenderPhpSnippet(data, block);
    }
  });

  return files;
};
