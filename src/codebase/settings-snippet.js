/**
 * WP Settings API code generator.
 * Generates PHP 8.2+ compatible Settings registration for WP 6.9+.
 */

const toPascalCase = (str) => {
  if (!str) return 'Settings';
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const sanitizeCallbackMap = {
  text:     'sanitize_text_field',
  textarea: 'sanitize_textarea_field',
  email:    'sanitize_email',
  url:      'esc_url_raw',
  number:   'absint',
  checkbox: 'rest_sanitize_boolean',
  select:   'sanitize_text_field',
  color:    'sanitize_hex_color',
};

const makeField = (field, sectionId, data) => {
  const sanitize = sanitizeCallbackMap[field.type] || 'sanitize_text_field';
  return `
        register_setting(
            '${sectionId}',
            '${field.id}',
            [
                'type'              => '${field.type === 'number' ? 'integer' : 'string'}',
                'label'             => __( '${field.title}', '${data.textDomain}' ),
                'description'       => __( '${field.description || ''}', '${data.textDomain}' ),
                'sanitize_callback' => '${sanitize}',
                'default'           => '${field.default || ''}',
                'show_in_rest'      => true,
            ]
        );

        add_settings_field(
            '${field.id}',
            __( '${field.title}', '${data.textDomain}' ),
            [ $this, 'render_field_${field.id.replace(/-/g, '_')}' ],
            '${sectionId}',
            '${sectionId}_section'
        );`;
};

const makeFieldRenderer = (field, data) => {
  const id = field.id.replace(/-/g, '_');
  let input = '';
  switch (field.type) {
    case 'textarea':
      input = `<textarea id="${field.id}" name="${field.id}" rows="5" cols="50" class="large-text code"><?php echo esc_textarea( $value ); ?></textarea>`;
      break;
    case 'checkbox':
      input = `<input type="checkbox" id="${field.id}" name="${field.id}" value="1" <?php checked( 1, $value ); ?> />`;
      break;
    case 'select':
      input = `<select id="${field.id}" name="${field.id}">
            <?php foreach ( $this->get_${id}_options() as $key => $label ) : ?>
                <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $value, $key ); ?>><?php echo esc_html( $label ); ?></option>
            <?php endforeach; ?>
        </select>`;
      break;
    case 'color':
      input = `<input type="color" id="${field.id}" name="${field.id}" value="<?php echo esc_attr( $value ); ?>" />`;
      break;
    case 'number':
      input = `<input type="number" id="${field.id}" name="${field.id}" value="<?php echo esc_attr( $value ); ?>" class="small-text" />`;
      break;
    default:
      input = `<input type="text" id="${field.id}" name="${field.id}" value="<?php echo esc_attr( $value ); ?>" class="regular-text" />`;
  }

  return `
    /**
     * Render the "${field.title}" setting field.
     */
    public function render_field_${id}(): void {
        $value = get_option( '${field.id}', '${field.default || ''}' );
        ?>
        <fieldset>
            <label for="${field.id}">${input}</label>
            <p class="description"><?php echo esc_html__( '${field.description || ''}', '${data.textDomain}' ); ?></p>
        </fieldset>
        <?php
    }`;
};

export const settingsSnippet = (data, settingsGroups) => {
  const valid = (settingsGroups || []).filter((g) => g.groupId && g.pageSlug);

  if (!valid.length) {
    return `<?php
/**
 * Settings placeholder.
 *
 * @package ${data.baseNamespace}\\Settings
 */

namespace ${data.baseNamespace}\\Settings;

// No settings groups configured yet.
`;
  }

  const classBlocks = valid.map((group) => {
    const className = group.className || toPascalCase(group.groupId);
    const sections  = (group.sections || []).filter((s) => s.id);
    const allFields = sections.flatMap((s) => (s.fields || []).filter((f) => f.id && f.type));

    const registerCalls = sections.map((section) => {
      const sectionFields = (section.fields || []).filter((f) => f.id && f.type);
      return `
        // Section: ${section.title || section.id}
        add_settings_section(
            '${section.id}_section',
            __( '${section.title || ''}', '${data.textDomain}' ),
            function (): void {
                echo '<p>' . esc_html__( '${section.description || ''}', '${data.textDomain}' ) . '</p>';
            },
            '${group.groupId}'
        );
${sectionFields.map((f) => makeField(f, group.groupId, data)).join('')}`;
    }).join('');

    const fieldRenderers = allFields.map((f) => makeFieldRenderer(f, data)).join('');

    const renderPage = `
    /**
     * Render the settings page.
     */
    public function render_page(): void {
        if ( ! current_user_can( '${group.capability || 'manage_options'}' ) ) {
            wp_die( esc_html__( 'You do not have permission to access this page.', '${data.textDomain}' ) );
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
            <?php settings_errors( '${group.groupId}_messages' ); ?>
            <form method="post" action="options.php">
                <?php
                settings_fields( '${group.groupId}' );
                do_settings_sections( '${group.groupId}' );
                submit_button( __( 'Save Settings', '${data.textDomain}' ) );
                ?>
            </form>
        </div>
        <?php
    }`;

    return `
/**
 * Settings group: ${group.groupTitle || group.groupId}
 *
 * @package ${data.baseNamespace}\\Settings
 */
final class ${className} {

    public function __construct() {
        add_action( 'admin_init', [ $this, 'register' ] );
        add_action( 'admin_menu', [ $this, 'add_page' ] );
    }

    /**
     * Register settings, sections, and fields.
     */
    public function register(): void {${registerCalls}
    }

    /**
     * Add the settings page to the admin menu.
     */
    public function add_page(): void {
        add_options_page(
            __( '${group.groupTitle || group.groupId}', '${data.textDomain}' ),
            __( '${group.menuTitle || group.groupTitle || group.groupId}', '${data.textDomain}' ),
            '${group.capability || 'manage_options'}',
            '${group.pageSlug}',
            [ $this, 'render_page' ]
        );
    }
${renderPage}
${fieldRenderers}
}`;
  }).join("\n");

  return `<?php
/**
 * Settings API registrations.
 *
 * @package ${data.baseNamespace}\\Settings
 */

namespace ${data.baseNamespace}\\Settings;
${classBlocks}
`;
};
