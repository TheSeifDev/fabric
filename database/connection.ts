/**
 * Database Connection Manager
 * Handles SQLite database connection with better-sqlite3
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

/**
 * Get database file path based on environment
 */
function getDatabasePath(): string {
    const isDev = process.env.NODE_ENV === 'development';

    // Get user data directory (cross-platform)
    const userDataDir = process.env.APPDATA ||
        (process.platform === 'darwin'
            ? path.join(process.env.HOME!, 'Library', 'Application Support')
            : path.join(process.env.HOME!, '.local', 'share'));

    const appDir = path.join(userDataDir, 'fabric-inventory');

    // Ensure directory exists
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir, { recursive: true });
    }

    const dbFileName = isDev ? 'dev.db' : 'production.db';
    return path.join(appDir, dbFileName);
}

/**
 * Database connection singleton
 */
let sqliteDb: Database.Database | null = null;
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Initialize database connection
 */
export function initDatabase() {
    if (sqliteDb && db) {
        return db;
    }

    const dbPath = getDatabasePath();
    console.log(`📁 Database path: ${dbPath}`);

    try {
        // Create SQLite connection
        sqliteDb = new Database(dbPath, {
            verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
        });

        // Enable foreign keys
        sqliteDb.pragma('foreign_keys = ON');

        // Set journal mode to WAL for better concurrency
        sqliteDb.pragma('journal_mode = WAL');

        // Create Drizzle instance
        db = drizzle(sqliteDb, { schema });

        console.log('✅ Database connected successfully');

        return db;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

/**
 * Get database instance
 */
export function getDatabase() {
    if (!db) {
        return initDatabase();
    }
    return db;
}

/**
 * Get raw SQLite connection
 */
export function getSQLiteConnection() {
    if (!sqliteDb) {
        initDatabase();
    }
    return sqliteDb!;
}

/**
 * Close database connection
 */
export function closeDatabase() {
    if (sqliteDb) {
        sqliteDb.close();
        sqliteDb = null;
        db = null;
        console.log('🔒 Database connection closed');
    }
}

/**
 * Reset database (development only)
 */
export function resetDatabase() {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Database reset is only allowed in development mode');
    }

    closeDatabase();

    const dbPath = getDatabasePath();
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('🗑️  Database file deleted');
    }

    // Remove WAL and SHM files
    const walPath = `${dbPath}-wal`;
    const shmPath = `${dbPath}-shm`;

    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

    return initDatabase();
}

/**
 * Backup database
 */
export function backupDatabase(): string {
    const dbPath = getDatabasePath();
    const backupDir = path.join(path.dirname(dbPath), 'backups');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

    // Copy database file
    fs.copyFileSync(dbPath, backupPath);

    console.log(`💾 Database backed up to: ${backupPath}`);
    return backupPath;
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
    const db = getSQLiteConnection();

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const catalogCount = db.prepare('SELECT COUNT(*) as count FROM catalogs').get() as { count: number };
    const rollCount = db.prepare('SELECT COUNT(*) as count FROM rolls').get() as { count: number };
    const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_log').get() as { count: number };

    return {
        users: userCount.count,
        catalogs: catalogCount.count,
        rolls: rollCount.count,
        auditLogs: auditCount.count,
        dbPath: getDatabasePath(),
    };
}

// Export schema for use in queries
export { schema };
