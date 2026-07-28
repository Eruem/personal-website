/**
 * Database abstraction layer.
 *
 * - Cloudflare Workers / Pages: uses D1 via getRequestContext()
 * - Local Node.js (next dev): uses better-sqlite3
 *
 * Both backends expose the same async D1-style API.
 */

// ---- Types (D1-compatible) ----

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { duration: number; last_row_id: number | null; rows_read: number | null; rows_written: number | null };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(stmts: D1PreparedStatement[]): Promise<void>;
}

// ---- Environment Detection ----

function getCloudflareEnv() {
  // Use dynamic require via new Function to avoid webpack static analysis
  try {
    // In Cloudflare Workers / next-on-pages, getRequestContext is available
    const m = require("@cloudflare/next-on-pages");
    return m.getRequestContext().env;
  } catch {
    return null;
  }
}

// ---- Local better-sqlite3 backend ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _localDb: any = null;

function getLocalDb(): D1Database {
  if (!_localDb) {
    const Database = require("better-sqlite3").default || require("better-sqlite3");
    const dbPath = process.env.DATABASE_PATH || "data/site.db";
    const path = require("path");
    const fs = require("fs");

    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    _localDb = new Database(dbPath);
    _localDb.pragma("journal_mode = WAL");
    _localDb.pragma("foreign_keys = ON");

    // Run schema
    _localDb.exec(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        avatar_path TEXT,
        background_path TEXT,
        bio TEXT,
        site_title TEXT NOT NULL DEFAULT '个人主页',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS portfolio_item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_path TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_portfolio_sort ON portfolio_item(sort_order ASC);
      CREATE TABLE IF NOT EXISTS image (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT OR IGNORE INTO site_config (id, site_title) VALUES (1, '个人主页');
    `);

    // Seed default admin if none exists
    const bcrypt = require("bcryptjs");
    const existing = _localDb.prepare("SELECT id FROM admin LIMIT 1").get() as { id: number } | undefined;
    if (!existing) {
      const username = process.env.ADMIN_USERNAME || "admin";
      const password = process.env.ADMIN_PASSWORD || "changeme123";
      const passwordHash = bcrypt.hashSync(password, 12);
      _localDb.prepare("INSERT INTO admin (username, password_hash) VALUES (?, ?)").run(username, passwordHash);
    }
  }

  // Wrap better-sqlite3 sync API as async D1-compatible API
  return {
    prepare(sql: string): D1PreparedStatement {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let boundValues: unknown[] = [];

      return {
        bind(...values: unknown[]): D1PreparedStatement {
          boundValues = values;
          return this;
        },

        async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
          const s = _localDb!.prepare(sql);
          const rows = boundValues.length > 0
            ? (s.all(...boundValues) as T[])
            : (s.all() as T[]);
          return {
            results: rows,
            success: true,
            meta: { duration: 0, last_row_id: null, rows_read: rows.length, rows_written: null },
          };
        },

        async first<T = Record<string, unknown>>(): Promise<T | null> {
          const s = _localDb!.prepare(sql);
          const row = boundValues.length > 0
            ? (s.get(...boundValues) as T | undefined)
            : (s.get() as T | undefined);
          return row ?? null;
        },

        async run(): Promise<D1Result> {
          const s = _localDb!.prepare(sql);
          const result = boundValues.length > 0
            ? s.run(...boundValues)
            : s.run();
          return {
            results: [],
            success: true,
            meta: {
              duration: 0,
              last_row_id: result.changes > 0 ? Number(result.lastInsertRowid) : null,
              rows_read: null,
              rows_written: result.changes,
            },
          };
        },
      };
    },

    async batch(stmts: D1PreparedStatement[]): Promise<void> {
      for (const s of stmts) {
        await s.run();
      }
    },
  };
}

// ---- Public API ----

/**
 * Get the database instance.
 * Automatically selects D1 (Cloudflare) or better-sqlite3 (local Node.js).
 */
export function getDb(): D1Database {
  const env = getCloudflareEnv();
  if (env) {
    return env.DB as unknown as D1Database;
  }
  return getLocalDb();
}

