export const phpcsCode = () => {
  let code = `<?xml version="1.0"?>
<ruleset name="WordPress Plugin — PHP 8.2+ / WP 6.9+">
    <description>WordPress Coding Standards (WPCS 3.x) enforcing PHP 8.2+ compatibility.</description>

    <!-- Scan all PHP files recursively -->
    <arg name="extensions" value="php"/>
    <arg value="sp"/>
    <arg name="colors"/>

    <!-- WordPress-Core ruleset -->
    <rule ref="WordPress">
        <exclude name="WordPress.Files.FileName.NotHyphenatedLowercase"/>
        <exclude name="WordPress.Files.FileName.InvalidClassFileName"/>
        <!-- Allow short array syntax [] -->
        <exclude name="Generic.Arrays.DisallowShortArraySyntax"/>
        <!-- Allow match expressions -->
        <exclude name="Universal.ControlStructures.DisallowLonelyIf"/>
    </rule>

    <!-- Enforce PHP 8.2 minimum -->
    <rule ref="PHPCompatibilityWP"/>
    <config name="minimum_supported_wp_version" value="6.5"/>
    <config name="testVersion" value="8.2-"/>

    <!-- Exclude generated / vendor directories -->
    <exclude-pattern>*/node_modules/*</exclude-pattern>
    <exclude-pattern>*/vendor/*</exclude-pattern>
    <exclude-pattern>.github/</exclude-pattern>
    <exclude-pattern>*/dist/*</exclude-pattern>

</ruleset>`;

  return code;
};
