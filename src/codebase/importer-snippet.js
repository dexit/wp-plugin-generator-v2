/**
 * WP Importer registration code generator.
 * PHP 8.2+ / WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'Importer';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

export const importerSnippet = (data, importers) => {
  const valid = (importers || []).filter((i) => i.id);

  if (!valid.length) {
    return `<?php
/**
 * Importers placeholder.
 *
 * @package ${data.baseNamespace}\\Import
 */

namespace ${data.baseNamespace}\\Import;

// No importers configured yet.
`;
  }

  const classes = valid.map((imp) => {
    const className = imp.className || toPascalCase(imp.id);
    return `
/**
 * ${imp.name || imp.id} importer.
 *
 * @package ${data.baseNamespace}\\Import
 */
final class ${className} extends \\WP_Importer {

    /**
     * Import step tracking.
     */
    private int $step = 0;

    public function __construct() {
        // Registered via register_importer() in Importer::boot().
    }

    /**
     * Entry point called by WP importer framework.
     */
    public function dispatch(): void {
        if ( ! current_user_can( 'import' ) ) {
            wp_die( esc_html__( 'You do not have permission to import data.', '${data.textDomain}' ) );
        }

        $this->step = absint( $_GET['step'] ?? 0 );

        switch ( $this->step ) {
            case 0:
                $this->greeting();
                break;
            case 1:
                check_admin_referer( '${imp.id}-upload' );
                $this->handle_upload();
                break;
            case 2:
                check_admin_referer( '${imp.id}-import' );
                $this->run_import();
                break;
        }
    }

    /**
     * Step 0 — greeting / upload form.
     */
    private function greeting(): void {
        ?>
        <div class="wrap">
            <h2><?php esc_html_e( '${imp.name || imp.id}', '${data.textDomain}' ); ?></h2>
            <p><?php esc_html_e( '${imp.description || 'Upload your file to begin the import.'}', '${data.textDomain}' ); ?></p>
            <form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin.php?import=${imp.id}&step=1' ) ); ?>">
                <?php wp_nonce_field( '${imp.id}-upload' ); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="import-upload-file"><?php esc_html_e( 'Choose a file from your computer:', '${data.textDomain}' ); ?></label></th>
                        <td>
                            <input type="file" id="import-upload-file" name="import" size="25" accept="${imp.acceptedTypes || '.csv,.xml,.json'}" />
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <input type="submit" class="button button-primary" value="<?php esc_attr_e( 'Upload file and import', '${data.textDomain}' ); ?>" />
                </p>
            </form>
        </div>
        <?php
    }

    /**
     * Step 1 — handle file upload.
     */
    private function handle_upload(): void {
        $file = wp_import_handle_upload();

        if ( isset( $file['error'] ) ) {
            wp_die(
                esc_html( $file['error'] ),
                esc_html__( 'Upload Error', '${data.textDomain}' )
            );
        }

        $this->import_id = (int) $file['id'];
        // TODO: parse and preview uploaded file.

        ?>
        <div class="wrap">
            <h2><?php esc_html_e( 'Preview Import', '${data.textDomain}' ); ?></h2>
            <p><?php esc_html_e( 'Review the data below and click "Import" to continue.', '${data.textDomain}' ); ?></p>
            <form method="post" action="<?php echo esc_url( admin_url( 'admin.php?import=${imp.id}&step=2&id=' . $this->import_id ) ); ?>">
                <?php wp_nonce_field( '${imp.id}-import' ); ?>
                <p class="submit">
                    <input type="submit" class="button button-primary" value="<?php esc_attr_e( 'Run Import', '${data.textDomain}' ); ?>" />
                </p>
            </form>
        </div>
        <?php
    }

    /**
     * Step 2 — run the actual import.
     */
    private function run_import(): void {
        $import_id   = absint( $_GET['id'] ?? 0 );
        $import_file = get_attached_file( $import_id );

        if ( ! $import_file || ! file_exists( $import_file ) ) {
            wp_die( esc_html__( 'Import file not found.', '${data.textDomain}' ) );
        }

        // TODO: read $import_file, process rows, create WP objects.
        $count = 0;

        // Clean up the uploaded file.
        wp_import_cleanup( $import_id );

        ?>
        <div class="wrap">
            <h2><?php esc_html_e( 'Import Complete', '${data.textDomain}' ); ?></h2>
            <p>
                <?php
                printf(
                    /* translators: %d: number of items imported */
                    esc_html__( 'Imported %d items successfully.', '${data.textDomain}' ),
                    $count
                );
                ?>
            </p>
        </div>
        <?php
    }
}`;
  }).join("\n");

  const bootCalls = valid.map((imp) => {
    const className = imp.className || toPascalCase(imp.id);
    return `
        register_importer(
            '${imp.id}',
            __( '${imp.name || imp.id}', '${data.textDomain}' ),
            __( '${imp.description || ''}', '${data.textDomain}' ),
            static function (): void {
                ( new ${className}() )->dispatch();
            }
        );`;
  }).join('');

  return `<?php
/**
 * Custom Importers.
 *
 * @package ${data.baseNamespace}\\Import
 */

namespace ${data.baseNamespace}\\Import;

/**
 * Class Importer
 *
 * Boots all registered importers.
 */
final class Importer {

    public function __construct() {
        add_action( 'admin_init', [ $this, 'boot' ] );
    }

    /**
     * Register all importers with WordPress.
     */
    public function boot(): void {
        if ( ! function_exists( 'register_importer' ) ) {
            require_once ABSPATH . 'wp-admin/includes/import.php';
        }
        ${bootCalls}
    }
}
${classes}
`;
};
