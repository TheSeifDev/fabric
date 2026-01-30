/**
 * Database Module Exports
 * Central export point for all database functionality
 */

// Connection
export {
    initDatabase,
    getDatabase,
    getSQLiteConnection,
    closeDatabase,
    resetDatabase,
    backupDatabase,
    getDatabaseStats,
    schema
} from './connection';

// Schema types
export type {
    User,
    NewUser,
    Catalog,
    NewCatalog,
    Roll,
    NewRoll,
    AuditLogEntry,
    NewAuditLogEntry,
} from './schema';

// Migrations
export {
    runMigrations,
    rollbackLastMigration,
    getMigrationStatus,
} from './migrate';

// Initialization
export {
    setupDatabase,
    isDatabaseInitialized,
} from './init';

// Seeding
export {
    seedInitialData,
    clearAllData,
} from './seed';
