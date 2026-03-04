/**
 * Custom Post Type code generator.
 * Generates PHP 8.2+ compatible CPT registration classes for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'MyPostType';
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const makeCptClass = (cpt, data) => {
  const className    = cpt.className || toPascalCase(cpt.postType);
  const singular     = cpt.singularLabel || toPascalCase(cpt.postType);
  const plural       = cpt.pluralLabel   || singular + 's';
  const slug         = cpt.slug          || cpt.postType;
  const iconVal      = cpt.menuIcon      || 'dashicons-admin-post';
  const menuPos      = cpt.menuPosition  || 'null';
  const capType      = cpt.capabilityType || 'post';
  const pub          = cpt.public           !== false ? 'true' : 'false';
  const pubQuery     = cpt.publiclyQueryable !== false ? 'true' : 'false';
  const rest         = cpt.showInRest       !== false ? 'true' : 'false';
  const archive      = cpt.hasArchive       ? 'true' : 'false';
  const hierarchical = cpt.hierarchical     ? 'true' : 'false';

  const supportsList = (cpt.supports && cpt.supports.length > 0)
    ? cpt.supports.map((s) => `'${s}'`).join(', ')
    : "'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'";

  const taxonomyLine = (cpt.taxonomies && cpt.taxonomies.length > 0)
    ? `\n            'taxonomies'          => [ ${cpt.taxonomies.map((t) => `'${t}'`).join(', ')} ],`
    : '';

  const templateBlock = cpt.blockTemplate
    ? `\n            'template'            => [ [ 'core/paragraph', [ 'placeholder' => __( 'Write here…', '${data.textDomain}' ) ] ] ],
            'template_lock'       => false,`
    : '';

  return `
/**
 * Registers the "${cpt.postType}" custom post type.
 *
 * @package ${data.baseNamespace}\\CPT
 */
final class ${className} {

    public readonly string $post_type;

    public function __construct() {
        $this->post_type = '${cpt.postType}';
        add_action( 'init', [ $this, 'register' ], 0 );
    }

    /**
     * Register the post type.
     */
    public function register(): void {
        register_post_type( $this->post_type, $this->get_args() );
    }

    /**
     * Post type arguments.
     *
     * @return array<string, mixed>
     */
    private function get_args(): array {
        return [
            'labels'              => $this->get_labels(),
            'public'              => ${pub},
            'publicly_queryable'  => ${pubQuery},
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_nav_menus'   => true,
            'show_in_admin_bar'   => true,
            'show_in_rest'        => ${rest},
            'rest_base'           => '${slug}',
            'query_var'           => true,
            'rewrite'             => [ 'slug' => '${slug}', 'with_front' => false ],
            'capability_type'     => '${capType}',
            'has_archive'         => ${archive},
            'hierarchical'        => ${hierarchical},
            'menu_position'       => ${menuPos},
            'menu_icon'           => '${iconVal}',
            'supports'            => [ ${supportsList} ],${taxonomyLine}${templateBlock}
            'delete_with_user'    => false,
        ];
    }

    /**
     * Localised labels.
     *
     * @return array<string, string>
     */
    private function get_labels(): array {
        $singular = _x( '${singular}', 'post type singular name', '${data.textDomain}' );
        $plural   = _x( '${plural}',   'post type general name',  '${data.textDomain}' );

        return [
            'name'                     => $plural,
            'singular_name'            => $singular,
            'add_new'                  => __( 'Add New', '${data.textDomain}' ),
            'add_new_item'             => sprintf( __( 'Add New %s', '${data.textDomain}' ), $singular ),
            'new_item'                 => sprintf( __( 'New %s', '${data.textDomain}' ), $singular ),
            'edit_item'                => sprintf( __( 'Edit %s', '${data.textDomain}' ), $singular ),
            'view_item'                => sprintf( __( 'View %s', '${data.textDomain}' ), $singular ),
            'view_items'               => sprintf( __( 'View %s', '${data.textDomain}' ), $plural ),
            'all_items'                => sprintf( __( 'All %s', '${data.textDomain}' ), $plural ),
            'search_items'             => sprintf( __( 'Search %s', '${data.textDomain}' ), $plural ),
            'parent_item_colon'        => sprintf( __( 'Parent %s:', '${data.textDomain}' ), $singular ),
            'not_found'                => sprintf( __( 'No %s found.', '${data.textDomain}' ), strtolower( $plural ) ),
            'not_found_in_trash'       => sprintf( __( 'No %s found in Trash.', '${data.textDomain}' ), strtolower( $plural ) ),
            'featured_image'           => sprintf( __( '%s Cover Image', '${data.textDomain}' ), $singular ),
            'set_featured_image'       => __( 'Set cover image', '${data.textDomain}' ),
            'remove_featured_image'    => __( 'Remove cover image', '${data.textDomain}' ),
            'use_featured_image'       => __( 'Use as cover image', '${data.textDomain}' ),
            'archives'                 => sprintf( __( '%s Archives', '${data.textDomain}' ), $singular ),
            'insert_into_item'         => sprintf( __( 'Insert into %s', '${data.textDomain}' ), strtolower( $singular ) ),
            'uploaded_to_this_item'    => sprintf( __( 'Uploaded to this %s', '${data.textDomain}' ), strtolower( $singular ) ),
            'filter_items_list'        => sprintf( __( 'Filter %s list', '${data.textDomain}' ), strtolower( $plural ) ),
            'items_list_navigation'    => sprintf( __( '%s list navigation', '${data.textDomain}' ), $plural ),
            'items_list'               => sprintf( __( '%s list', '${data.textDomain}' ), $plural ),
            'item_published'           => sprintf( __( '%s published.', '${data.textDomain}' ), $singular ),
            'item_published_privately' => sprintf( __( '%s published privately.', '${data.textDomain}' ), $singular ),
            'item_reverted_to_draft'   => sprintf( __( '%s reverted to draft.', '${data.textDomain}' ), $singular ),
            'item_scheduled'           => sprintf( __( '%s scheduled.', '${data.textDomain}' ), $singular ),
            'item_updated'             => sprintf( __( '%s updated.', '${data.textDomain}' ), $singular ),
            'menu_name'                => $plural,
            'name_admin_bar'           => $singular,
        ];
    }
}`;
};

export const cptSnippet = (data, cpts) => {
  const validCpts = (cpts || []).filter((c) => c.postType);

  if (!validCpts.length) {
    return `<?php
/**
 * Custom Post Types placeholder.
 *
 * @package ${data.baseNamespace}\\CPT
 */

namespace ${data.baseNamespace}\\CPT;

// No post types configured yet.
`;
  }

  const classBlocks = validCpts.map((cpt) => makeCptClass(cpt, data)).join("\n");

  return `<?php
/**
 * Custom Post Types
 *
 * @package ${data.baseNamespace}\\CPT
 */

namespace ${data.baseNamespace}\\CPT;
${classBlocks}
`;
};

/**
 * Generates the CPT Manager class that boots all CPTs.
 */
export const cptManagerSnippet = (data, cpts) => {
  const validCpts = (cpts || []).filter((c) => c.postType);
  const inits = validCpts
    .map((cpt) => {
      const className = cpt.className || toPascalCase(cpt.postType);
      return `        new CPT\\${className}();`;
    })
    .join("\n");

  return `<?php
/**
 * CPT Manager — boots all custom post types.
 *
 * @package ${data.baseNamespace}
 */

namespace ${data.baseNamespace};

/**
 * Class CptManager
 */
final class CptManager {

    public function __construct() {
${inits || '        // No CPTs configured.'}
    }
}
`;
};
