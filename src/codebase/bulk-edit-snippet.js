/**
 * Bulk Edit / Bulk Actions code generator.
 * Generates PHP 8.2+ bulk action handler classes for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'BulkEdit';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const makeBulkEditClass = (bulkEdit, data) => {
  const postType  = bulkEdit.postType || 'post';
  const className = bulkEdit.className || toPascalCase(postType) + 'BulkEdit';
  const actions   = (bulkEdit.actions || []).filter((a) => a.action);
  const nonce     = `${data.functionPrefix || 'plugin'}_bulk_${postType}`;

  const actionOptions = actions.map((a) => `
            '${a.action}' => __( '${a.label || a.action}', '${data.textDomain}' ),`).join('');

  const actionHandlers = actions.map((a) => `
            case '${a.action}':
                $this->handle_${a.action.replace(/-/g, '_')}( $post_ids );
                break;`).join('');

  const actionMethods = actions.map((a) => `
    /**
     * Handle bulk action: ${a.action}
     *
     * @param int[] $post_ids
     */
    private function handle_${a.action.replace(/-/g, '_')}( array $post_ids ): void {
        foreach ( $post_ids as $post_id ) {
            if ( ! current_user_can( 'edit_post', $post_id ) ) {
                continue;
            }
            // TODO: implement action logic for post $post_id.
        }
    }`).join('');

  return `
/**
 * Bulk Actions for post type: ${postType}
 *
 * @package ${data.baseNamespace}\\Admin
 */
final class ${className} {

    private readonly string $post_type;
    private readonly string $nonce_action;

    public function __construct() {
        $this->post_type    = '${postType}';
        $this->nonce_action = '${nonce}';

        add_filter( 'bulk_actions-edit-' . $this->post_type,         [ $this, 'register_actions' ] );
        add_filter( 'handle_bulk_actions-edit-' . $this->post_type,  [ $this, 'handle_actions' ], 10, 3 );
        add_action( 'admin_notices',                                  [ $this, 'admin_notices' ] );
    }

    /**
     * Register custom bulk actions.
     *
     * @param array<string, string> $bulk_actions
     * @return array<string, string>
     */
    public function register_actions( array $bulk_actions ): array {
        $bulk_actions += [${actionOptions}
        ];
        return $bulk_actions;
    }

    /**
     * Handle the selected bulk action.
     *
     * @param string   $redirect_url
     * @param string   $doaction
     * @param int[]    $post_ids
     * @return string
     */
    public function handle_actions( string $redirect_url, string $doaction, array $post_ids ): string {
        if ( ! check_admin_referer( 'bulk-posts' ) ) {
            wp_die( esc_html__( 'Security check failed.', '${data.textDomain}' ) );
        }

        switch ( $doaction ) {
            ${actionHandlers}
            default:
                return $redirect_url;
        }

        $redirect_url = add_query_arg(
            [
                'bulk_action_done' => rawurlencode( $doaction ),
                'processed'        => count( $post_ids ),
            ],
            $redirect_url
        );

        return remove_query_arg( [ 'action', 'action2' ], $redirect_url );
    }

    /**
     * Show admin notice after bulk action.
     */
    public function admin_notices(): void {
        $screen = get_current_screen();
        if ( ! $screen || 'edit-' . $this->post_type !== $screen->id ) {
            return;
        }

        if ( ! isset( $_GET['bulk_action_done'], $_GET['processed'] ) ) {
            return;
        }

        $action    = sanitize_text_field( wp_unslash( $_GET['bulk_action_done'] ) );
        $processed = absint( $_GET['processed'] );

        printf(
            '<div class="notice notice-success is-dismissible"><p>%s</p></div>',
            sprintf(
                /* translators: 1: action name, 2: number of items */
                esc_html__( 'Bulk action "%1$s" applied to %2$d item(s).', '${data.textDomain}' ),
                esc_html( $action ),
                $processed
            )
        );
    }
${actionMethods}
}`;
};

export const bulkEditSnippet = (data, bulkEdits) => {
  const valid = (bulkEdits || []).filter((b) => b.postType);

  if (!valid.length) {
    return `<?php
/**
 * Bulk Edit placeholder.
 *
 * @package ${data.baseNamespace}\\Admin
 */

namespace ${data.baseNamespace}\\Admin;

// No bulk edit actions configured yet.
`;
  }

  const classes = valid.map((b) => makeBulkEditClass(b, data)).join("\n");

  return `<?php
/**
 * Custom Bulk Actions.
 *
 * @package ${data.baseNamespace}\\Admin
 */

namespace ${data.baseNamespace}\\Admin;
${classes}
`;
};
