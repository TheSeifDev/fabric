/**
 * Database Initialization Script
 * Sets up database and runs migrations on first start
 */

import { initDatabase, getSQLiteConnection } from './connection';
import { runMigrations, getMigrationStatus } from './migrate';
import { seedInitialData } from './seed';
import path from 'path';

/**
 * Initialize database with migrations and seed data
 */
export async function setupDatabase() {
    console.log('🔧 Setting up database...\n');

    try {
        // Step 1: Initialize connection
        console.log('1️⃣  Initializing database connection...');
        initDatabase();
        console.log('   ✅ Connection established\n');

        // Step 2: Run migrations
        console.log('2️⃣  Running migrations...');
        const migrationsDir = path.join(__dirname, 'migrations');
        runMigrations(migrationsDir);

        const migrationStatus = getMigrationStatus();
        console.log(`   ✅ Migrations complete (${migrationStatus.applied} applied)\n`);

        // Step 3: Check if database needs seeding
        const db = getSQLiteConnection();
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

        if (userCount.count === 0) {
            console.log('3️⃣  Seeding initial data...');
            await seedInitialData();
            console.log('   ✅ Seed data created\n');
        } else {
            console.log('3️⃣  Database already seeded\n');
        }

        console.log('✅ Database setup complete!\n');
        return true;
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
    try {
        const db = getSQLiteConnection();

        // Check if migrations table exists
        const result = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'")
            .get();

        return !!result;
    } catch {
        return false;
    }
}
