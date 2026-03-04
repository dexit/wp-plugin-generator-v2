/**
 * Term meta fields code generator.
 * Generates PHP 8.2+ taxonomy term field classes for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'TermFields';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const addInput = (field) => {
  switch (field.type) {
    case 'textarea':
      return `<textarea id="${field.key}" name="${field.key}" rows="4" class="large-text"></textarea>`;
    case 'checkbox':
      return `<input type="checkbox" id="${field.key}" name="${field.key}" value="1" />`;
    default:
      return `<input type="text" id="${field.key}" name="${field.key}" class="regular-text" />`;
  }
};

const editInput = (field) => {
  switch (field.type) {
    case 'textarea':
      return `<textarea id="${field.key}" name="${field.key}" rows="4" class="large-text"><?php echo esc_textarea( $value ); ?></textarea>`;
    case 'checkbox':
      return `<input type="checkbox" id="${field.key}" name="${field.key}" value="1" <?php checked( 1, $value ); ?> />`;
    default:
      return `<input type="text" id="${field.key}" name="${field.key}" value="<?php echo esc_attr( $value ); ?>" class="regular-text" />`;
  }
};

const sanitize = (field) => {
  if (field.type === 'textarea') return `sanitize_textarea_field( wp_unslash( $_POST['${field.key}'] ?? '' ) )`;
  if (field.type === 'checkbox') return `( isset( $_POST['${field.key}'] ) ? 1 : 0 )`;
  if (field.type === 'url')      return `esc_url_raw( wp_unslash( $_POST['${field.key}'] ?? '' ) )`;
  if (field.type === 'number')   return `absint( $_POST['${field.key}'] ?? 0 )`;
  return `sanitize_text_field( wp_unslash( $_POST['${field.key}'] ?? '' ) )`;
};

const makeTermFieldsClass = (group, data) => {
  const taxonomy  = group.taxonomy || 'category';
  const className = group.className || toPascalCase(taxonomy) + 'Fields';
  const fields    = (group.fields || []).filter((f) => f.key);
  const nonce     = `${data.functionPrefix || 'plugin'}_${taxonomy}_fields`;

  const addFields = fields.map((f) => `
        <div class="form-field">
            <label for="${f.key}"><?php esc_html_e( '${f.label || f.key}', '${data.textDomain}' ); ?></label>
            ${addInput(f)}
            <p class="description"><?php esc_html_e( '${f.description || ''}', '${data.textDomain}' ); ?></p>
        </div>`).join('');

  const editFields = fields.map((f) => `
        <tr class="form-field">
            <th scope="row"><label for="${f.key}"><?php esc_html_e( '${f.label || f.key}', '${data.textDomain}' ); ?></label></th>
            <td>
                <?php $value = get_term_meta( $term->term_id, '${f.key}', true ); ?>
                ${editInput(f)}
                <p class="description"><?php esc_html_e( '${f.description || ''}', '${data.textDomain}' ); ?></p>
            </td>
        </tr>`).join('');

  const saveFields = fields.map((f) => `
        update_term_meta( $term_id, '${f.key}', ${sanitize(f)} );`).join('');

  return `
/**
 * Term fields for taxonomy: ${taxonomy}
 *
 * @package ${data.baseNamespace}
 */
final class ${className} {

    private readonly string $taxonomy;
    private readonly string $nonce_action;

    public function __construct() {
        $this->taxonomy     = '${taxonomy}';
        $this->nonce_action = '${nonce}';

        add_action( "${taxonomy}_add_form_fields",  [ $this, 'render_add_fields' ] );
        add_action( "${taxonomy}_edit_form_fields", [ $this, 'render_edit_fields' ] );
        add_action( "created_${taxonomy}",          [ $this, 'save_fields' ] );
        add_action( "edited_${taxonomy}",           [ $this, 'save_fields' ] );
    }

    /**
     * Render fields on the "Add New Term" form.
     *
     * @param string $taxonomy
     */
    public function render_add_fields( string $taxonomy ): void {
        wp_nonce_field( $this->nonce_action, '${taxonomy}_fields_nonce' );
        ${addFields}
    }

    /**
     * Render fields on the "Edit Term" form.
     *
     * @param \\WP_Term $term
     */
    public function render_edit_fields( \\WP_Term $term ): void {
        wp_nonce_field( $this->nonce_action, '${taxonomy}_fields_nonce' );
        ?>
        <table class="form-table" role="presentation">
            <tbody>
                ${editFields}
            </tbody>
        </table>
        <?php
    }

    /**
     * Save term meta fields.
     *
     * @param int $term_id
     */
    public function save_fields( int $term_id ): void {
        if ( ! isset( $_POST['${taxonomy}_fields_nonce'] )
            || ! wp_verify_nonce( sanitize_key( $_POST['${taxonomy}_fields_nonce'] ), $this->nonce_action )
        ) {
            return;
        }
        ${saveFields}
    }
}`;
};

export const termFieldsSnippet = (data, termFieldGroups) => {
  const valid = (termFieldGroups || []).filter((g) => g.taxonomy);

  if (!valid.length) {
    return `<?php
/**
 * Term Fields placeholder.
 *
 * @package ${data.baseNamespace}
 */

namespace ${data.baseNamespace};

// No term fields configured yet.
`;
  }

  const classes = valid.map((g) => makeTermFieldsClass(g, data)).join("\n");

  return `<?php
/**
 * Taxonomy Term Fields.
 *
 * @package ${data.baseNamespace}
 */

namespace ${data.baseNamespace};
${classes}
`;
};
