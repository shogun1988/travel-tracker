// Country service utilities for querying countries
// Note: These functions accept a DB client with a `query(sql, params)` method (e.g., pg.Client)

/**
 * Find a country code by name (partial, case-insensitive).
 * Returns the ISO alpha-2 code string if found, otherwise null.
 * @param {{query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>}} db
 * @param {string} name
 * @returns {Promise<string|null>}
 */
export async function findCountryCodeByName(db, name) {
  if (!name || typeof name !== 'string') return null;
  const term = name.trim().toLowerCase();
  if (term.length === 0) return null;

  const sql = "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' LIMIT 1;";
  const result = await db.query(sql, [term]);
  if (result && Array.isArray(result.rows) && result.rows.length > 0) {
    return result.rows[0]?.country_code ?? null;
  }
  return null;
}

/**
 * Returns true when a matching country exists; otherwise false.
 * @param {{query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>}} db
 * @param {string} name
 * @returns {Promise<boolean>}
 */
export async function countryExists(db, name) {
  const code = await findCountryCodeByName(db, name);
  return Boolean(code);
}
