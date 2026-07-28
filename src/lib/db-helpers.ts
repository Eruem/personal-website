/**
 * Build and execute a dynamic UPDATE query.
 * Only updates the columns provided in `updates`.
 */
export function buildUpdateQuery(
  table: string,
  updates: Record<string, string | number | null>,
  whereColumn: string,
  whereValue: string
) {
  const setClauses: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(updates)) {
    setClauses.push(`${key} = ?`);
    values.push(value);
  }
  setClauses.push("updated_at = datetime('now')");

  const sql = `UPDATE ${table} SET ${setClauses.join(", ")} WHERE ${whereColumn} = ?`;
  values.push(whereValue);

  return { sql, values };
}
