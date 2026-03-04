/**
 * Request utilities trait generator.
 * PHP 8.2+ / WP 6.9+.
 */

export const requestUtilsSnippet = (data) => {
  return `<?php
/**
 * Request utilities trait.
 *
 * @package ${data.baseNamespace}\\Traits
 */

namespace ${data.baseNamespace}\\Traits;

/**
 * Trait RequestUtils
 *
 * Provides typed helper methods for safely reading HTTP request data,
 * validating nonces, checking permissions, and sending JSON responses.
 *
 * Usage:
 *   class MyHandler {
 *       use \\${data.baseNamespace}\\Traits\\RequestUtils;
 *   }
 */
trait RequestUtils {

    // -------------------------------------------------------------------------
    // Input helpers
    // -------------------------------------------------------------------------

    /**
     * Get a POST field as a sanitized string.
     *
     * @param string $key
     * @param string $default
     *
     * @return string
     */
    protected function post_string( string $key, string $default = '' ): string {
        return sanitize_text_field( wp_unslash( $_POST[ $key ] ?? $default ) );
    }

    /**
     * Get a POST field as a sanitized textarea string.
     *
     * @param string $key
     * @param string $default
     *
     * @return string
     */
    protected function post_textarea( string $key, string $default = '' ): string {
        return sanitize_textarea_field( wp_unslash( $_POST[ $key ] ?? $default ) );
    }

    /**
     * Get a POST field as an integer.
     *
     * @param string $key
     * @param int    $default
     *
     * @return int
     */
    protected function post_int( string $key, int $default = 0 ): int {
        return absint( $_POST[ $key ] ?? $default );
    }

    /**
     * Get a POST field as a boolean (checkbox).
     *
     * @param string $key
     *
     * @return bool
     */
    protected function post_bool( string $key ): bool {
        return isset( $_POST[ $key ] ) && (bool) $_POST[ $key ];
    }

    /**
     * Get a POST field as a sanitized URL.
     *
     * @param string $key
     * @param string $default
     *
     * @return string
     */
    protected function post_url( string $key, string $default = '' ): string {
        return esc_url_raw( wp_unslash( $_POST[ $key ] ?? $default ) );
    }

    /**
     * Get a POST field as a sanitized email.
     *
     * @param string $key
     * @param string $default
     *
     * @return string
     */
    protected function post_email( string $key, string $default = '' ): string {
        return sanitize_email( wp_unslash( $_POST[ $key ] ?? $default ) );
    }

    /**
     * Get a GET param as a sanitized string.
     *
     * @param string $key
     * @param string $default
     *
     * @return string
     */
    protected function get_string( string $key, string $default = '' ): string {
        return sanitize_text_field( wp_unslash( $_GET[ $key ] ?? $default ) );
    }

    /**
     * Get a GET param as an integer.
     *
     * @param string $key
     * @param int    $default
     *
     * @return int
     */
    protected function get_int( string $key, int $default = 0 ): int {
        return absint( $_GET[ $key ] ?? $default );
    }

    // -------------------------------------------------------------------------
    // Nonce helpers
    // -------------------------------------------------------------------------

    /**
     * Verify a nonce field from $_POST.
     *
     * @param string $field_name  Nonce field name in the form.
     * @param string $action      Nonce action string.
     *
     * @return bool
     */
    protected function verify_nonce( string $field_name, string $action ): bool {
        $nonce = sanitize_key( wp_unslash( $_POST[ $field_name ] ?? '' ) );
        return (bool) wp_verify_nonce( $nonce, $action );
    }

    /**
     * Verify a nonce from $_GET (e.g., admin action links).
     *
     * @param string $action
     *
     * @return bool
     */
    protected function verify_get_nonce( string $action ): bool {
        $nonce = sanitize_key( wp_unslash( $_GET['_wpnonce'] ?? '' ) );
        return (bool) wp_verify_nonce( $nonce, $action );
    }

    /**
     * Die with a nonce failure message.
     */
    protected function nonce_die(): never {
        wp_die(
            esc_html__( 'Security check failed. Please refresh and try again.', '${data.textDomain}' ),
            esc_html__( 'Security Error', '${data.textDomain}' ),
            [ 'response' => 403 ]
        );
    }

    // -------------------------------------------------------------------------
    // JSON response helpers
    // -------------------------------------------------------------------------

    /**
     * Send a JSON success response and exit.
     *
     * @param mixed $data
     * @param int   $status_code
     */
    protected function json_success( mixed $data = null, int $status_code = 200 ): never {
        wp_send_json_success( $data, $status_code );
    }

    /**
     * Send a JSON error response and exit.
     *
     * @param string $message
     * @param int    $status_code
     * @param mixed  $data
     */
    protected function json_error( string $message, int $status_code = 400, mixed $data = null ): never {
        wp_send_json_error( [ 'message' => $message, 'data' => $data ], $status_code );
    }

    // -------------------------------------------------------------------------
    // Redirect helpers
    // -------------------------------------------------------------------------

    /**
     * Redirect and exit.
     *
     * @param string $url
     * @param int    $status
     */
    protected function redirect( string $url, int $status = 302 ): never {
        wp_safe_redirect( $url, $status );
        exit;
    }

    /**
     * Redirect back to the referring page.
     *
     * @param array<string, string> $args  Extra query args to append.
     */
    protected function redirect_back( array $args = [] ): never {
        $ref = wp_get_referer() ?: admin_url();
        if ( $args ) {
            $ref = add_query_arg( $args, $ref );
        }
        $this->redirect( $ref );
    }

    // -------------------------------------------------------------------------
    // Capability helpers
    // -------------------------------------------------------------------------

    /**
     * Check a capability and die if denied.
     *
     * @param string $capability
     * @param int    $object_id  Optional: post/term/user ID for meta-caps.
     */
    protected function require_capability( string $capability, int $object_id = 0 ): void {
        $allowed = $object_id
            ? current_user_can( $capability, $object_id )
            : current_user_can( $capability );

        if ( ! $allowed ) {
            wp_die(
                esc_html__( 'You do not have permission to perform this action.', '${data.textDomain}' ),
                esc_html__( 'Permission Denied', '${data.textDomain}' ),
                [ 'response' => 403 ]
            );
        }
    }

    /**
     * Is this an AJAX request?
     */
    protected function is_ajax(): bool {
        return wp_doing_ajax();
    }

    /**
     * Is this a REST request?
     */
    protected function is_rest(): bool {
        return defined( 'REST_REQUEST' ) && REST_REQUEST;
    }

    /**
     * Get the current request method.
     */
    protected function method(): string {
        return strtoupper( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ?? 'GET' ) ) );
    }

    /**
     * Is this a POST request?
     */
    protected function is_post(): bool {
        return 'POST' === $this->method();
    }

    /**
     * Is this a GET request?
     */
    protected function is_get(): bool {
        return 'GET' === $this->method();
    }
}
`;
};
