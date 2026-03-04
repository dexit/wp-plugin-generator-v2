/**
 * Database utilities code generator.
 * Generates a typed $wpdb wrapper class. PHP 8.2+ / WP 6.9+.
 */

export const dbUtilsSnippet = (data) => {
  return `<?php
/**
 * Database utility helper.
 *
 * @package ${data.baseNamespace}\\Utils
 */

namespace ${data.baseNamespace}\\Utils;

/**
 * Class DbUtils
 *
 * Thin wrapper around \\wpdb for common CRUD operations with
 * prepared queries (protects against SQL injection) and
 * typed return values.
 *
 * Usage:
 *   $db     = new \\${data.baseNamespace}\\Utils\\DbUtils();
 *   $rows   = $db->get_rows( 'my_table', [ 'status' => 'active' ] );
 *   $id     = $db->insert( 'my_table', [ 'name' => 'Foo' ] );
 *   $done   = $db->update( 'my_table', [ 'name' => 'Bar' ], [ 'id' => $id ] );
 *   $done   = $db->delete( 'my_table', [ 'id' => $id ] );
 */
final class DbUtils {

    private readonly \\wpdb $wpdb;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }

    /**
     * Get the prefixed table name.
     *
     * @param string $table  Base table name (without prefix).
     *
     * @return string
     */
    public function table( string $table ): string {
        return $this->wpdb->prefix . $table;
    }

    /**
     * Fetch multiple rows.
     *
     * @param string               $table   Base table name.
     * @param array<string, mixed> $where   Column => value pairs (AND-joined).
     * @param string               $fields  SQL fields clause.
     * @param string               $order   ORDER BY clause.
     * @param int                  $limit   LIMIT (0 = no limit).
     * @param int                  $offset  OFFSET.
     *
     * @return array<int, object>
     */
    public function get_rows(
        string $table,
        array $where  = [],
        string $fields = '*',
        string $order  = '',
        int $limit     = 0,
        int $offset    = 0
    ): array {
        $tbl = $this->table( $table );
        $sql = "SELECT {$fields} FROM {$tbl}";

        if ( ! empty( $where ) ) {
            $conditions = [];
            $values     = [];
            foreach ( $where as $col => $val ) {
                $conditions[] = esc_sql( $col ) . ' = %s';
                $values[]     = $val;
            }
            $sql .= ' WHERE ' . implode( ' AND ', $conditions );
            $sql  = $this->wpdb->prepare( $sql, $values ); // phpcs:ignore WordPress.DB.PreparedSQL
        }

        if ( $order ) {
            $sql .= ' ORDER BY ' . esc_sql( $order );
        }

        if ( $limit > 0 ) {
            $sql .= $this->wpdb->prepare( ' LIMIT %d OFFSET %d', $limit, $offset );
        }

        return (array) $this->wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL
    }

    /**
     * Fetch a single row by ID.
     *
     * @param string $table  Base table name.
     * @param int    $id     Row ID.
     * @param string $id_col Column name for the ID field.
     *
     * @return object|null
     */
    public function get_row( string $table, int $id, string $id_col = 'id' ): ?object {
        $tbl = $this->table( $table );
        $sql = $this->wpdb->prepare(
            'SELECT * FROM ' . $tbl . ' WHERE ' . esc_sql( $id_col ) . ' = %d LIMIT 1', // phpcs:ignore WordPress.DB.PreparedSQL
            $id
        );
        return $this->wpdb->get_row( $sql ) ?: null; // phpcs:ignore WordPress.DB.PreparedSQL
    }

    /**
     * Fetch a single column value.
     *
     * @param string               $table   Base table name.
     * @param string               $field   Column name.
     * @param array<string, mixed> $where   WHERE conditions.
     *
     * @return string|null
     */
    public function get_var( string $table, string $field, array $where = [] ): ?string {
        $rows = $this->get_rows( $table, $where, esc_sql( $field ), '', 1, 0 );
        if ( empty( $rows ) ) {
            return null;
        }
        return $rows[0]->{$field} ?? null;
    }

    /**
     * Count rows matching conditions.
     *
     * @param string               $table
     * @param array<string, mixed> $where
     *
     * @return int
     */
    public function count( string $table, array $where = [] ): int {
        $rows = $this->get_rows( $table, $where, 'COUNT(*) AS cnt' );
        return isset( $rows[0]->cnt ) ? (int) $rows[0]->cnt : 0;
    }

    /**
     * Insert a row and return the new ID.
     *
     * @param string               $table
     * @param array<string, mixed> $data
     * @param array<string, string>|null $format  printf format strings per field.
     *
     * @return int  Inserted ID, or 0 on failure.
     */
    public function insert( string $table, array $data, ?array $format = null ): int {
        $result = $this->wpdb->insert( $this->table( $table ), $data, $format );
        return $result ? (int) $this->wpdb->insert_id : 0;
    }

    /**
     * Update rows matching $where.
     *
     * @param string               $table
     * @param array<string, mixed> $data
     * @param array<string, mixed> $where
     * @param array<string, string>|null $format
     * @param array<string, string>|null $where_format
     *
     * @return int|false  Rows affected, or false on error.
     */
    public function update(
        string $table,
        array $data,
        array $where,
        ?array $format       = null,
        ?array $where_format = null
    ): int|false {
        return $this->wpdb->update( $this->table( $table ), $data, $where, $format, $where_format );
    }

    /**
     * Delete rows matching $where.
     *
     * @param string               $table
     * @param array<string, mixed> $where
     * @param array<string, string>|null $where_format
     *
     * @return int|false
     */
    public function delete( string $table, array $where, ?array $where_format = null ): int|false {
        return $this->wpdb->delete( $this->table( $table ), $where, $where_format );
    }

    /**
     * Run a raw prepared query.
     *
     * @param string  $sql
     * @param mixed[] $args  Values for %s / %d / %f placeholders.
     *
     * @return int|bool
     */
    public function query( string $sql, array $args = [] ): int|bool {
        if ( ! empty( $args ) ) {
            $sql = $this->wpdb->prepare( $sql, $args ); // phpcs:ignore WordPress.DB.PreparedSQL
        }
        return $this->wpdb->query( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL
    }

    /**
     * Begin a transaction.
     */
    public function begin_transaction(): void {
        $this->wpdb->query( 'START TRANSACTION' ); // phpcs:ignore WordPress.DB.PreparedSQL
    }

    /**
     * Commit a transaction.
     */
    public function commit(): void {
        $this->wpdb->query( 'COMMIT' ); // phpcs:ignore WordPress.DB.PreparedSQL
    }

    /**
     * Roll back a transaction.
     */
    public function rollback(): void {
        $this->wpdb->query( 'ROLLBACK' ); // phpcs:ignore WordPress.DB.PreparedSQL
    }

    /**
     * Return the last wpdb error string.
     */
    public function last_error(): string {
        return $this->wpdb->last_error;
    }
}
`;
};
