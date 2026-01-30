/**
 * Verify Database Setup Script
 * Quick script to verify database tables exist
 */

import { getSQLiteConnection } from '../database/connection';

try {
    const db = getSQLiteConnection();

    console.log('🔍 Verifying database tables...\n');

    const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all() as { name: string }[];

    console.log('📊 Found tables:');
    tables.forEach((table) => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
        console.log(`  ✅ ${table.name} (${count.count} rows)`);
    });

    console.log('\n✨ Database verification complete!');
    process.exit(0);
} catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
}
