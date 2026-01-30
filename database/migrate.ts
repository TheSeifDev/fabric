/**
 * Database Migration Manager
 * Handles running and tracking database migrations
 */

import { getSQLiteConnection } from './connection';
import fs from 'fs';
import path from 'path';

interface Migration {
    id: number;
    name: string;
    appliedAt: number;
}

/**
 * Ensure migrations table exists
 */
function ensureMigrationsTable() {
    const db = getSQLiteConnection();

    db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    );
  `);
}

/**
 * Get list of applied migrations
 */
function getAppliedMigrations(): Migration[] {
    const db = getSQLiteConnection();
    ensureMigrationsTable();

    const migrations = db
        .prepare('SELECT id, name, applied_at as appliedAt FROM migrations ORDER BY id')
        .all() as Migration[];

    return migrations;
}

/**
 * Record migration as applied
 */
function recordMigration(name: string) {
    const db = getSQLiteConnection();

    db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)')
        .run(name, Date.now());
}

/**
 * Remove migration record
 */
function removeMigration(name: string) {
    const db = getSQLiteConnection();

    db.prepare('DELETE FROM migrations WHERE name = ?').run(name);
}

/**
 * Get pending migrations
 */
function getPendingMigrations(migrationsDir: string): string[] {
    const applied = getAppliedMigrations().map(m => m.name);

    if (!fs.existsSync(migrationsDir)) {
        return [];
    }

    const allMigrations = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

    return allMigrations.filter(m => !applied.includes(m));
}

/**
 * Run pending migrations
 */
export function runMigrations(migrationsDir: string = path.join(__dirname, 'migrations')) {
    const db = getSQLiteConnection();
    ensureMigrationsTable();

    const pending = getPendingMigrations(migrationsDir);

    if (pending.length === 0) {
        console.log('✅ No pending migrations');
        return;
    }

    console.log(`📝 Running ${pending.length} migration(s)...`);

    for (const migrationFile of pending) {
        const migrationPath = path.join(migrationsDir, migrationFile);
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        try {
            db.exec(sql);
            recordMigration(migrationFile);
            console.log(`  ✅ ${migrationFile}`);
        } catch (error) {
            console.error(`  ❌ Failed to run ${migrationFile}:`, error);
            throw error;
        }
    }

    console.log('✅ All migrations completed');
}

/**
 * Rollback last migration (development only)
 */
export function rollbackLastMigration() {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Migration rollback is only allowed in development');
    }

    const applied = getAppliedMigrations();

    if (applied.length === 0) {
        console.log('⚠️  No migrations to rollback');
        return;
    }

    const lastMigration = applied[applied.length - 1];

    // For now, we'll just remove the record
    // In production, you'd want to execute a down migration
    removeMigration(lastMigration.name);
    console.log(`🔙 Rolled back: ${lastMigration.name}`);
}

/**
 * Get migration status
 */
export function getMigrationStatus() {
    const applied = getAppliedMigrations();
    const migrationsDir = path.join(__dirname, 'migrations');
    const pending = getPendingMigrations(migrationsDir);

    return {
        applied: applied.length,
        pending: pending.length,
        appliedMigrations: applied,
        pendingMigrations: pending,
    };
}
