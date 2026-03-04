/**
 * Email registration code generator.
 * Generates a typed Email handler class. PHP 8.2+ / WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'Email';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const makeEmailMethod = (email, data) => {
  const method = 'send_' + email.key.replace(/-/g, '_');
  const args   = (email.fields || []).map((f) => `string $${f}`).join(', ');
  const argsDoc = (email.fields || []).map((f) => ` * @param string $${f}`).join("\n");

  return `
    /**
     * Send "${email.subject}" email.
     *
${argsDoc || ' * @param string $recipient_email'}
     *
     * @return bool
     */
    public function ${method}( ${args || 'string $recipient_email'} ): bool {
        $to      = ${email.fields && email.fields.includes('recipient_email') ? '$recipient_email' : 'sanitize_email( $recipient_email )'};
        $subject = __( '${email.subject || 'Notification'}', '${data.textDomain}' );
        $message = $this->render_template( '${email.key}', compact( ${(email.fields || ['recipient_email']).map((f) => `'${f}'`).join(', ')} ) );
        $headers = $this->get_headers();

        return wp_mail( $to, $subject, $message, $headers );
    }`;
};

export const emailSnippet = (data, emails) => {
  const valid = (emails || []).filter((e) => e.key && e.subject);

  const methods = valid.map((e) => makeEmailMethod(e, data)).join("\n");

  return `<?php
/**
 * Email handler — typed wrappers for wp_mail().
 *
 * @package ${data.baseNamespace}
 */

namespace ${data.baseNamespace};

/**
 * Class Emails
 *
 * Centralises all outgoing emails for the plugin.
 * Each email type has its own method with typed parameters.
 */
final class Emails {

    /**
     * Sender name.
     */
    private readonly string $from_name;

    /**
     * Sender email address.
     */
    private readonly string $from_email;

    public function __construct() {
        $this->from_name  = get_bloginfo( 'name' );
        $this->from_email = get_bloginfo( 'admin_email' );

        // Ensure HTML emails are supported.
        add_filter( 'wp_mail_content_type', static fn(): string => 'text/html' );
    }
${methods || `
    // Add email methods here, e.g.:
    // public function send_welcome( string $recipient_email ): bool { ... }`}

    // -------------------------------------------------------------------------
    // Shared helpers
    // -------------------------------------------------------------------------

    /**
     * Build standard mail headers.
     *
     * @return string[]
     */
    private function get_headers(): array {
        return [
            'Content-Type: text/html; charset=UTF-8',
            sprintf( 'From: %s <%s>', $this->from_name, $this->from_email ),
        ];
    }

    /**
     * Render a plain email template from a string or template file.
     *
     * @param string               $template_key
     * @param array<string, mixed> $data
     *
     * @return string
     */
    private function render_template( string $template_key, array $data = [] ): string {
        $template_file = ${data.constantPrefix ? `${data.constantPrefix}_PATH` : 'plugin_dir_path( __FILE__ )'} . '/templates/emails/' . $template_key . '.php';

        if ( file_exists( $template_file ) ) {
            ob_start();
            // phpcs:ignore WordPress.PHP.DontExtract
            extract( $data, EXTR_SKIP );
            include $template_file;
            return (string) ob_get_clean();
        }

        // Fallback: plain text assembled from $data.
        return implode( "\\n", array_map(
            static fn( $k, $v ): string => esc_html( $k ) . ': ' . esc_html( (string) $v ),
            array_keys( $data ),
            $data
        ) );
    }
}
`;
};
