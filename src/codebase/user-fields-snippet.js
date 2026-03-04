/**
 * User meta fields code generator.
 * Generates PHP 8.2+ user profile field classes for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'UserFields';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const renderInput = (field) => {
  switch (field.type) {
    case 'textarea':
      return `<textarea id="${field.key}" name="${field.key}" rows="4" class="large-text"><?php echo esc_textarea( $value ); ?></textarea>`;
    case 'checkbox':
      return `<input type="checkbox" id="${field.key}" name="${field.key}" value="1" <?php checked( 1, $value ); ?> />`;
    case 'select':
      return `<select id="${field.key}" name="${field.key}">
                    <?php foreach ( $this->get_${field.key}_options() as $k => $v ) : ?>
                        <option value="<?php echo esc_attr( $k ); ?>" <?php selected( $value, $k ); ?>><?php echo esc_html( $v ); ?></option>
                    <?php endforeach; ?>
                </select>`;
    case 'url':
      return `<input type="url" id="${field.key}" name="${field.key}" value="<?php echo esc_url( $value ); ?>" class="regular-text" />`;
    case 'number':
      return `<input type="number" id="${field.key}" name="${field.key}" value="<?php echo esc_attr( $value ); ?>" class="small-text" />`;
    default:
      return `<input type="text" id="${field.key}" name="${field.key}" value="<?php echo esc_attr( $value ); ?>" class="regular-text" />`;
  }
};

const sanitizeField = (field) => {
  const map = {
    textarea: 'sanitize_textarea_field',
    url:      'esc_url_raw',
    email:    'sanitize_email',
    number:   'absint',
    checkbox: '( isset( $_POST[ \'${field.key}\' ] ) ? 1 : 0 )',
  };
  if (field.type === 'checkbox') {
    return `( isset( $_POST['${field.key}'] ) ? 1 : 0 )`;
  }
  return `${map[field.type] || 'sanitize_text_field'}( sanitize_text_field( wp_unslash( $_POST['${field.key}'] ?? '' ) ) )`;
};

export const userFieldsSnippet = (data, userFields) => {
  const valid = (userFields || []).filter((f) => f.key);

  if (!valid.length) {
    return `<?php
/**
 * User fields placeholder.
 *
 * @package ${data.baseNamespace}
 */

namespace ${data.baseNamespace};

// No user fields configured yet.
`;
  }

  const section     = valid[0].section || 'Additional Info';
  const nonceAction = `${data.functionPrefix || 'plugin'}_user_fields`;

  const viewFields = valid.map((f) => `
            <tr>
                <th><label for="${f.key}"><?php esc_html_e( '${f.label || f.key}', '${data.textDomain}' ); ?></label></th>
                <td>
                    <?php $value = get_user_meta( $user->ID, '${f.key}', true ); ?>
                    ${renderInput(f)}
                    <?php if ( '${f.description || ''}' ) : ?>
                        <p class="description"><?php esc_html_e( '${f.description || ''}', '${data.textDomain}' ); ?></p>
                    <?php endif; ?>
                </td>
            </tr>`).join('');

  const saveFields = valid.map((f) => {
    return `        update_user_meta( $user_id, '${f.key}', ${sanitizeField(f)} );`;
  }).join("\n");

  return `<?php
/**
 * User Profile Fields.
 *
 * @package ${data.baseNamespace}
 */

namespace ${data.baseNamespace};

/**
 * Class UserFields
 *
 * Adds custom fields to user profile pages (self and admin edit).
 */
final class UserFields {

    private readonly string $nonce_action;

    public function __construct() {
        $this->nonce_action = '${nonceAction}';

        add_action( 'show_user_profile',        [ $this, 'render_fields' ] );
        add_action( 'edit_user_profile',        [ $this, 'render_fields' ] );
        add_action( 'personal_options_update',  [ $this, 'save_fields' ] );
        add_action( 'edit_user_profile_update', [ $this, 'save_fields' ] );
    }

    /**
     * Render custom user profile fields.
     *
     * @param \\WP_User $user
     */
    public function render_fields( \\WP_User $user ): void {
        ?>
        <h2><?php esc_html_e( '${section}', '${data.textDomain}' ); ?></h2>
        <?php wp_nonce_field( $this->nonce_action, 'user_fields_nonce' ); ?>
        <table class="form-table" role="presentation">
            <tbody>
                ${viewFields}
            </tbody>
        </table>
        <?php
    }

    /**
     * Save custom user meta fields.
     *
     * @param int $user_id
     */
    public function save_fields( int $user_id ): void {
        if ( ! isset( $_POST['user_fields_nonce'] )
            || ! wp_verify_nonce( sanitize_key( $_POST['user_fields_nonce'] ), $this->nonce_action )
        ) {
            return;
        }

        if ( ! current_user_can( 'edit_user', $user_id ) ) {
            return;
        }

${saveFields}
    }
}
`;
};
