/**
 * REST Post Fields code generator.
 * Uses register_rest_field() to add custom fields to WP REST API responses.
 * PHP 8.2+ / WP 6.9+.
 */

const phpType = (type) => {
  const map = { number: 'int', boolean: 'bool', checkbox: 'bool', array: 'array' };
  return map[type] || 'string';
};

const sanitize = (field) => {
  if (field.type === 'number')  return 'absint';
  if (field.type === 'boolean' || field.type === 'checkbox') return 'rest_sanitize_boolean';
  if (field.type === 'url')    return 'esc_url_raw';
  if (field.type === 'email')  return 'sanitize_email';
  return 'sanitize_text_field';
};

const makeFieldRegistration = (field, data) => {
  const postTypes = (field.postTypes && field.postTypes.length)
    ? field.postTypes.map((pt) => `'${pt}'`).join(', ')
    : "'post'";

  const phpT    = phpType(field.type);
  const readVal = field.readonly ? `        // Write not allowed (readonly field)` : `
        'update_callback' => static function ( mixed $value, \\WP_Post $post ): bool {
            return (bool) update_post_meta( $post->ID, '_${field.fieldName}', ${sanitize(field)}( $value ) );
        },`;

  return `
        // Field: ${field.fieldName}
        $post_types = [ ${postTypes} ];
        foreach ( $post_types as $post_type ) {
            register_rest_field(
                $post_type,
                '${field.fieldName}',
                [
                    'get_callback' => static function ( array $post_data ): ${phpT} {
                        $value = get_post_meta( $post_data['id'], '_${field.fieldName}', true );
                        return (${phpT}) ( $value ?: ${phpT === 'string' ? "''" : phpT === 'array' ? '[]' : phpT === 'bool' ? 'false' : '0'} );
                    },
                    ${readVal}
                    'schema'          => [
                        'description' => __( '${field.description || field.fieldName}', '${data.textDomain}' ),
                        'type'        => '${field.type === 'checkbox' ? 'boolean' : field.type || 'string'}',
                        'context'     => [ 'view', 'edit' ],
                        'readonly'    => ${field.readonly ? 'true' : 'false'},
                    ],
                ]
            );
        }`;
};

export const postRestFieldsSnippet = (data, postRestFields) => {
  const valid = (postRestFields || []).filter((f) => f.fieldName);

  if (!valid.length) {
    return `<?php
/**
 * REST Post Fields placeholder.
 *
 * @package ${data.baseNamespace}\\API
 */

namespace ${data.baseNamespace}\\API;

// No REST post fields configured yet.
`;
  }

  const registrations = valid.map((f) => makeFieldRegistration(f, data)).join('');

  return `<?php
/**
 * REST Post Fields — registers custom fields on WP REST API post responses.
 *
 * @package ${data.baseNamespace}\\API
 */

namespace ${data.baseNamespace}\\API;

/**
 * Class PostFields
 *
 * Uses register_rest_field() to expose custom post meta via the REST API.
 */
final class PostFields {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register' ] );
    }

    /**
     * Register all custom REST fields.
     */
    public function register(): void {
        ${registrations}
    }
}
`;
};
