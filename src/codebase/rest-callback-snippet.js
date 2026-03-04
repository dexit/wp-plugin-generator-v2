/**
 * WP REST API custom callback route generator.
 * Generates PHP 8.2+ REST route classes for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'Endpoint';
  return str.split(/[-_\s\/]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const methodList = (methods) => {
  if (!methods || !methods.length) return "'GET'";
  return methods.map((m) => `'${m.toUpperCase()}'`).join( ' | ' );
};

const argSchemas = (fields) => {
  if (!fields || !fields.length) return '';
  return fields.map((f) => {
    const required = f.required ? '\n                    \'required\'     => true,' : '';
    const sanitize = f.type === 'integer' ? 'absint' : 'sanitize_text_field';
    return `
                '${f.name}' => [
                    'description'       => __( '${f.description || f.name}', '${f.textDomain || ''}' ),
                    'type'              => '${f.type || 'string'}',${required}
                    'sanitize_callback' => '${sanitize}',
                    'validate_callback' => 'rest_validate_request_arg',
                ],`;
  }).join('');
};

const makeEndpointClass = (endpoint, data) => {
  const className   = endpoint.className || toPascalCase(endpoint.route || 'Endpoint');
  const namespace   = endpoint.namespace || `${data.textDomain}/v1`;
  const route       = endpoint.route     || '/items';
  const methods     = endpoint.methods   || ['GET'];
  const authType    = endpoint.authRequired ? 'is_user_logged_in()' : 'true';
  const cap         = endpoint.capability  || 'read';
  const hasBody     = methods.some((m) => ['POST', 'PUT', 'PATCH'].includes(m.toUpperCase()));

  return `
/**
 * REST endpoint: ${namespace}${route}
 *
 * @package ${data.baseNamespace}\\API
 */
final class ${className} extends \\WP_REST_Controller {

    protected string $namespace = '${namespace}';
    protected string $rest_base = '${route.replace(/^\//, '')}';

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    /**
     * Register REST routes.
     */
    public function register_routes(): void {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => ${methodList(methods)},
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                    'args'                => $this->get_collection_params(),
                ],
                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\\d]+)',
            [
                'args' => [
                    'id' => [
                        'description' => __( 'Unique identifier for the item.', '${data.textDomain}' ),
                        'type'        => 'integer',
                        'minimum'     => 1,
                    ],
                ],
                [
                    'methods'             => \\WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_item' ],
                    'permission_callback' => [ $this, 'get_item_permissions_check' ],
                ],
                ${hasBody ? `[
                    'methods'             => \\WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'update_item_permissions_check' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( \\WP_REST_Server::EDITABLE ),
                ],
                [
                    'methods'             => \\WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_item' ],
                    'permission_callback' => [ $this, 'delete_item_permissions_check' ],
                ],` : ''}
                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );
    }

    /**
     * Check permission for listing items.
     *
     * @param \\WP_REST_Request $request
     * @return bool|\\WP_Error
     */
    public function get_items_permissions_check( \\WP_REST_Request $request ): bool|\\WP_Error {
        if ( ! ${authType} ) {
            return new \\WP_Error(
                'rest_forbidden',
                __( 'Sorry, you are not allowed to view these items.', '${data.textDomain}' ),
                [ 'status' => \\WP_Http::UNAUTHORIZED ]
            );
        }
        return current_user_can( '${cap}' );
    }

    /**
     * Check permission for a single item.
     *
     * @param \\WP_REST_Request $request
     * @return bool|\\WP_Error
     */
    public function get_item_permissions_check( \\WP_REST_Request $request ): bool|\\WP_Error {
        return $this->get_items_permissions_check( $request );
    }

    /**
     * Check permission for updating.
     *
     * @param \\WP_REST_Request $request
     * @return bool|\\WP_Error
     */
    public function update_item_permissions_check( \\WP_REST_Request $request ): bool|\\WP_Error {
        return current_user_can( '${endpoint.editCapability || 'edit_posts'}' );
    }

    /**
     * Check permission for deleting.
     *
     * @param \\WP_REST_Request $request
     * @return bool|\\WP_Error
     */
    public function delete_item_permissions_check( \\WP_REST_Request $request ): bool|\\WP_Error {
        return current_user_can( '${endpoint.deleteCapability || 'delete_posts'}' );
    }

    /**
     * Retrieve a collection of items.
     *
     * @param \\WP_REST_Request $request
     * @return \\WP_REST_Response|\\WP_Error
     */
    public function get_items( \\WP_REST_Request $request ): \\WP_REST_Response|\\WP_Error {
        $data  = [];
        // TODO: query your data source here.

        return rest_ensure_response( $data );
    }

    /**
     * Retrieve a single item.
     *
     * @param \\WP_REST_Request $request
     * @return \\WP_REST_Response|\\WP_Error
     */
    public function get_item( \\WP_REST_Request $request ): \\WP_REST_Response|\\WP_Error {
        $id   = (int) $request->get_param( 'id' );
        $data = [];
        // TODO: query item by $id.

        if ( empty( $data ) ) {
            return new \\WP_Error(
                'rest_not_found',
                __( 'Item not found.', '${data.textDomain}' ),
                [ 'status' => \\WP_Http::NOT_FOUND ]
            );
        }

        return rest_ensure_response( $data );
    }

    /**
     * Update a single item.
     *
     * @param \\WP_REST_Request $request
     * @return \\WP_REST_Response|\\WP_Error
     */
    public function update_item( \\WP_REST_Request $request ): \\WP_REST_Response|\\WP_Error {
        $id     = (int) $request->get_param( 'id' );
        $params = $request->get_json_params() ?? $request->get_body_params();
        // TODO: update item by $id with $params.

        return rest_ensure_response( [ 'updated' => true ] );
    }

    /**
     * Delete a single item.
     *
     * @param \\WP_REST_Request $request
     * @return \\WP_REST_Response|\\WP_Error
     */
    public function delete_item( \\WP_REST_Request $request ): \\WP_REST_Response|\\WP_Error {
        $id = (int) $request->get_param( 'id' );
        // TODO: delete item by $id.

        return rest_ensure_response( [ 'deleted' => true, 'id' => $id ] );
    }

    /**
     * Prepare item for response.
     *
     * @param mixed            $item
     * @param \\WP_REST_Request $request
     * @return \\WP_REST_Response|\\WP_Error
     */
    public function prepare_item_for_response( mixed $item, \\WP_REST_Request $request ): \\WP_REST_Response|\\WP_Error {
        $data   = [];
        $schema = $this->get_item_schema();

        // Map $item to schema fields here.

        $context = $request->get_param( 'context' ) ?? 'view';
        $data    = $this->filter_response_by_context( $data, $context );

        return rest_ensure_response( $data );
    }

    /**
     * JSON schema for a single item.
     *
     * @return array<string, mixed>
     */
    public function get_item_schema(): array {
        if ( $this->schema ) {
            return $this->add_additional_fields_schema( $this->schema );
        }

        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => '${endpoint.route || 'item'}',
            'type'       => 'object',
            'properties' => [
                'id' => [
                    'description' => __( 'Unique identifier.', '${data.textDomain}' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                // TODO: add schema fields here.
            ],
        ];

        $this->schema = $schema;
        return $this->add_additional_fields_schema( $this->schema );
    }

    /**
     * Query parameters for collection requests.
     *
     * @return array<string, mixed>
     */
    public function get_collection_params(): array {
        $params = parent::get_collection_params();
        // TODO: add custom collection params.
        return $params;
    }
}`;
};

export const restCallbackSnippet = (data, restCallbacks) => {
  const valid = (restCallbacks || []).filter((e) => e.route);

  if (!valid.length) {
    return `<?php
/**
 * Custom REST API endpoints placeholder.
 *
 * @package ${data.baseNamespace}\\API
 */

namespace ${data.baseNamespace}\\API;

// No custom REST callbacks configured yet.
`;
  }

  const classes = valid.map((cb) => makeEndpointClass(cb, data)).join("\n");

  return `<?php
/**
 * Custom REST API Endpoints.
 * Extends WP_REST_Controller for standard compliance.
 *
 * @package ${data.baseNamespace}\\API
 */

namespace ${data.baseNamespace}\\API;
${classes}
`;
};
