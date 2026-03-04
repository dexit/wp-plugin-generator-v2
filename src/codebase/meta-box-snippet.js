/**
 * Meta Box / Edit Screen code generator.
 * Generates PHP 8.2+ meta box classes with block editor sidebar support for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'MetaBox';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const fieldInput = (field, data) => {
  const name = `${field.key}`;
  switch (field.type) {
    case 'textarea':
      return `<textarea id="${name}" name="${name}" rows="4" style="width:100%"><?php echo esc_textarea( $val ); ?></textarea>`;
    case 'checkbox':
      return `<input type="checkbox" id="${name}" name="${name}" value="1" <?php checked( 1, $val ); ?> />`;
    case 'select':
      return `<select id="${name}" name="${name}" style="width:100%">
                <?php /* Add your options here */ ?>
            </select>`;
    case 'date':
      return `<input type="date" id="${name}" name="${name}" value="<?php echo esc_attr( $val ); ?>" class="widefat" />`;
    case 'number':
      return `<input type="number" id="${name}" name="${name}" value="<?php echo esc_attr( $val ); ?>" class="widefat" />`;
    case 'url':
      return `<input type="url" id="${name}" name="${name}" value="<?php echo esc_url( $val ); ?>" class="widefat" />`;
    case 'email':
      return `<input type="email" id="${name}" name="${name}" value="<?php echo esc_attr( $val ); ?>" class="widefat" />`;
    case 'color':
      return `<input type="color" id="${name}" name="${name}" value="<?php echo esc_attr( $val ); ?>" />`;
    case 'image':
      return `<div class="wpgen-image-field">
                <img id="${name}_preview" src="<?php echo esc_url( $val ? wp_get_attachment_image_url( (int)$val, 'thumbnail' ) : '' ); ?>" style="max-width:150px;display:<?php echo $val ? 'block' : 'none'; ?>" />
                <input type="hidden" id="${name}" name="${name}" value="<?php echo esc_attr( $val ); ?>" />
                <button type="button" class="button wpgen-upload-image" data-target="${name}"><?php esc_html_e( 'Upload Image', '${data.textDomain}' ); ?></button>
                <?php if ( $val ) : ?><button type="button" class="button wpgen-remove-image" data-target="${name}"><?php esc_html_e( 'Remove', '${data.textDomain}' ); ?></button><?php endif; ?>
            </div>`;
    default:
      return `<input type="text" id="${name}" name="${name}" value="<?php echo esc_attr( $val ); ?>" class="widefat" />`;
  }
};

const renderFields = (metaBox, data) => {
  return (metaBox.fields || []).filter((f) => f.key).map((field) => `
        // ${field.label || field.key}
        $val = get_post_meta( $post->ID, '_${field.key}', true );
        ?>
        <p>
            <label for="${field.key}"><strong><?php esc_html_e( '${field.label || field.key}', '${data.textDomain}' ); ?></strong></label><br>
            ${fieldInput(field, data)}
            <?php if ( '${field.description || ''}' ) : ?>
                <span class="description"><?php esc_html_e( '${field.description || ''}', '${data.textDomain}' ); ?></span>
            <?php endif; ?>
        </p>
        <?php`).join('');
};

const saveFields = (metaBox) => {
  return (metaBox.fields || []).filter((f) => f.key).map((field) => {
    let sanitize = 'sanitize_text_field';
    if (field.type === 'textarea')  sanitize = 'sanitize_textarea_field';
    if (field.type === 'url')       sanitize = 'esc_url_raw';
    if (field.type === 'email')     sanitize = 'sanitize_email';
    if (field.type === 'number')    sanitize = 'absint';
    if (field.type === 'checkbox')  return `
        if ( isset( $data['${field.key}'] ) ) {
            update_post_meta( $post_id, '_${field.key}', 1 );
        } else {
            delete_post_meta( $post_id, '_${field.key}' );
        }`;
    if (field.type === 'image')     sanitize = 'absint';

    return `
        if ( isset( $data['${field.key}'] ) ) {
            update_post_meta( $post_id, '_${field.key}', ${sanitize}( $data['${field.key}'] ) );
        }`;
  }).join('');
};

const makeMetaBoxClass = (metaBox, data) => {
  const className  = metaBox.className || toPascalCase(metaBox.id);
  const postTypes  = (metaBox.postTypes && metaBox.postTypes.length)
    ? metaBox.postTypes.map((pt) => `'${pt}'`).join(', ')
    : "'post'";
  const context    = metaBox.context   || 'normal';
  const priority   = metaBox.priority  || 'default';

  return `
/**
 * Meta box: ${metaBox.title || metaBox.id}
 *
 * @package ${data.baseNamespace}\\Admin\\MetaBoxes
 */
final class ${className} {

    private readonly string $id;
    private readonly string $nonce_action;

    public function __construct() {
        $this->id           = '${metaBox.id}';
        $this->nonce_action = '${metaBox.id}_nonce_action';

        add_action( 'add_meta_boxes', [ $this, 'register' ] );
        add_action( 'save_post',      [ $this, 'save' ], 10, 2 );
    }

    /**
     * Register the meta box.
     */
    public function register(): void {
        $post_types = [ ${postTypes} ];
        foreach ( $post_types as $post_type ) {
            add_meta_box(
                $this->id,
                __( '${metaBox.title || metaBox.id}', '${data.textDomain}' ),
                [ $this, 'render' ],
                $post_type,
                '${context}',
                '${priority}'
            );
        }
    }

    /**
     * Render the meta box HTML.
     *
     * @param \\WP_Post $post
     */
    public function render( \\WP_Post $post ): void {
        wp_nonce_field( $this->nonce_action, $this->id . '_nonce' );
        ${renderFields(metaBox, data)}
    }

    /**
     * Save meta box data.
     *
     * @param int      $post_id
     * @param \\WP_Post $post
     */
    public function save( int $post_id, \\WP_Post $post ): void {
        if ( ! isset( $_POST[ $this->id . '_nonce' ] )
            || ! wp_verify_nonce( sanitize_key( $_POST[ $this->id . '_nonce' ] ), $this->nonce_action )
        ) {
            return;
        }

        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }

        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        $data = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification
        ${saveFields(metaBox)}
    }
}`;
};

export const metaBoxSnippet = (data, metaBoxes) => {
  const valid = (metaBoxes || []).filter((m) => m.id);

  if (!valid.length) {
    return `<?php
/**
 * Meta Boxes placeholder.
 *
 * @package ${data.baseNamespace}\\Admin\\MetaBoxes
 */

namespace ${data.baseNamespace}\\Admin\\MetaBoxes;

// No meta boxes configured yet.
`;
  }

  const classes = valid.map((mb) => makeMetaBoxClass(mb, data)).join("\n");

  return `<?php
/**
 * Custom Meta Boxes (Edit Screen fields).
 *
 * @package ${data.baseNamespace}\\Admin\\MetaBoxes
 */

namespace ${data.baseNamespace}\\Admin\\MetaBoxes;
${classes}
`;
};
