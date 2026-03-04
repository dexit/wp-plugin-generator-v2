/**
 * Quick Edit columns and fields code generator.
 * Generates PHP 8.2+ quick edit classes for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'QuickEdit';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const makeQuickEditClass = (qe, data) => {
  const postType  = qe.postType || 'post';
  const className = qe.className || toPascalCase(postType) + 'QuickEdit';
  const fields    = (qe.fields || []).filter((f) => f.key);
  const nonce     = `${data.functionPrefix || 'plugin'}_quick_edit_${postType}`;

  const columnHeaders = fields.map((f) => `
        $columns['${f.key}'] = esc_html__( '${f.label || f.key}', '${data.textDomain}' );`).join('');

  const columnValues = fields.map((f) => `
        if ( '${f.key}' === $column ) {
            echo esc_html( get_post_meta( $post_id, '_${f.key}', true ) );
        }`).join('');

  const quickEditFields = fields.map((f) => {
    let input = '';
    switch (f.type) {
      case 'checkbox':
        input = `<input type="checkbox" name="${f.key}" value="1" />`;
        break;
      case 'select':
        input = `<select name="${f.key}"><option value=""><?php esc_html_e( '— Select —', '${data.textDomain}' ); ?></option></select>`;
        break;
      case 'number':
        input = `<input type="number" name="${f.key}" class="small-text" />`;
        break;
      default:
        input = `<input type="text" name="${f.key}" class="regular-text" />`;
    }
    return `
        <fieldset class="inline-edit-col-right">
            <div class="inline-edit-col">
                <label>
                    <span class="title"><?php esc_html_e( '${f.label || f.key}', '${data.textDomain}' ); ?></span>
                    <span class="input-text-wrap">${input}</span>
                </label>
            </div>
        </fieldset>`;
  }).join('');

  const saveFields = fields.map((f) => {
    const sanitize = f.type === 'number' ? 'absint' : 'sanitize_text_field';
    if (f.type === 'checkbox') {
      return `        update_post_meta( $post_id, '_${f.key}', isset( $_POST['${f.key}'] ) ? 1 : 0 );`;
    }
    return `        if ( isset( $_POST['${f.key}'] ) ) {
            update_post_meta( $post_id, '_${f.key}', ${sanitize}( wp_unslash( (string) $_POST['${f.key}'] ) ) );
        }`;
  }).join("\n");

  const inlineData = fields.map((f) => `
        $data['${f.key}'] = get_post_meta( $post->ID, '_${f.key}', true );`).join('');

  return `
/**
 * Quick Edit fields for post type: ${postType}
 *
 * @package ${data.baseNamespace}\\Admin
 */
final class ${className} {

    private readonly string $post_type;
    private readonly string $nonce_action;

    public function __construct() {
        $this->post_type    = '${postType}';
        $this->nonce_action = '${nonce}';

        add_filter( 'manage_' . $this->post_type . '_posts_columns',        [ $this, 'add_columns' ] );
        add_action( 'manage_' . $this->post_type . '_posts_custom_column',  [ $this, 'render_column' ], 10, 2 );
        add_action( 'quick_edit_custom_box',                                 [ $this, 'render_quick_edit' ], 10, 2 );
        add_action( 'save_post_' . $this->post_type,                         [ $this, 'save' ] );
        add_action( 'admin_enqueue_scripts',                                  [ $this, 'enqueue_scripts' ] );
    }

    /**
     * Add custom columns to the list table.
     *
     * @param array<string, string> $columns
     * @return array<string, string>
     */
    public function add_columns( array $columns ): array {
        ${columnHeaders}
        return $columns;
    }

    /**
     * Render custom column content.
     *
     * @param string $column
     * @param int    $post_id
     */
    public function render_column( string $column, int $post_id ): void {
        ${columnValues}
    }

    /**
     * Render quick edit fields.
     *
     * @param string $column_name
     * @param string $post_type
     */
    public function render_quick_edit( string $column_name, string $post_type ): void {
        if ( $this->post_type !== $post_type ) {
            return;
        }

        // Only render once.
        static $rendered = false;
        if ( $rendered ) {
            return;
        }
        $rendered = true;

        wp_nonce_field( $this->nonce_action, 'quick_edit_nonce' );
        ${quickEditFields}
    }

    /**
     * Enqueue admin JS to populate fields from inline data.
     */
    public function enqueue_scripts( string $hook ): void {
        if ( 'edit.php' !== $hook ) {
            return;
        }
        // Inline data is printed via admin_footer action.
        add_action( 'admin_footer', [ $this, 'print_inline_data' ] );
    }

    /**
     * Print inline data for each post (used by JS to populate quick edit).
     */
    public function print_inline_data(): void {
        $screen = get_current_screen();
        if ( ! $screen || $this->post_type !== $screen->post_type ) {
            return;
        }

        $posts = get_posts( [ 'post_type' => $this->post_type, 'numberposts' => -1, 'fields' => 'ids' ] );

        foreach ( $posts as $post_id ) {
            $post = get_post( $post_id );
            if ( ! $post ) continue;
            $data = [ 'id' => $post_id ];
            ${inlineData}
            printf(
                '<div class="wpgen-quick-edit-data" id="wpgen-qed-%d" data-fields="%s" style="display:none"></div>',
                (int) $post_id,
                esc_attr( wp_json_encode( $data ) )
            );
        }
    }

    /**
     * Save quick edit field data.
     *
     * @param int $post_id
     */
    public function save( int $post_id ): void {
        if ( ! isset( $_POST['quick_edit_nonce'] )
            || ! wp_verify_nonce( sanitize_key( $_POST['quick_edit_nonce'] ), $this->nonce_action )
        ) {
            return;
        }

        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

${saveFields}
    }
}`;
};

export const quickEditSnippet = (data, quickEdits) => {
  const valid = (quickEdits || []).filter((qe) => qe.postType);

  if (!valid.length) {
    return `<?php
/**
 * Quick Edit placeholder.
 *
 * @package ${data.baseNamespace}\\Admin
 */

namespace ${data.baseNamespace}\\Admin;

// No quick edit fields configured yet.
`;
  }

  const classes = valid.map((qe) => makeQuickEditClass(qe, data)).join("\n");

  return `<?php
/**
 * Custom Quick Edit Fields.
 *
 * @package ${data.baseNamespace}\\Admin
 */

namespace ${data.baseNamespace}\\Admin;
${classes}
`;
};
