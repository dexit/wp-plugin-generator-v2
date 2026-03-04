/**
 * Screen Options code generator.
 * Generates PHP 8.2+ Screen Options registration for WP 6.9+.
 */

export const screenOptionsSnippet = (data, screenOptions) => {
  const valid = (screenOptions || []).filter((s) => s.option && s.postType);

  if (!valid.length) {
    return `<?php
/**
 * Screen Options placeholder.
 *
 * @package ${data.baseNamespace}\\Admin
 */

namespace ${data.baseNamespace}\\Admin;

// No screen options configured.
`;
  }

  const registrations = valid.map((opt) => `
        add_filter(
            'manage_edit-${opt.postType}_columns',
            static function ( array $columns ): array {
                $columns['${opt.option}'] = __( '${opt.label || opt.option}', '${data.textDomain}' );
                return $columns;
            }
        );

        add_action(
            'load-edit.php',
            function (): void {
                $screen = get_current_screen();
                if ( ! $screen || '${opt.postType}' !== $screen->post_type ) {
                    return;
                }
                add_screen_option(
                    '${opt.option}',
                    [
                        'label'   => __( '${opt.label || opt.option}', '${data.textDomain}' ),
                        'default' => ${opt.default !== undefined ? opt.default : 20},
                        'option'  => '${opt.option}',
                    ]
                );
            }
        );

        // Persist screen option value.
        add_filter(
            'set_screen_option_${opt.option}',
            static function ( bool|string $status, string $option, string $value ): int {
                return (int) $value;
            },
            10, 3
        );`).join("\n");

  return `<?php
/**
 * Screen Options registration.
 *
 * @package ${data.baseNamespace}\\Admin
 */

namespace ${data.baseNamespace}\\Admin;

/**
 * Class ScreenOptions
 *
 * Registers per-user screen option preferences for list tables.
 */
final class ScreenOptions {

    public function __construct() {
        $this->register();
    }

    /**
     * Register all screen options.
     */
    private function register(): void {
        ${registrations}
    }
}
`;
};
