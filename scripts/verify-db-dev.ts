/**
 * Development DB Verification Script
 */

// Note: Run this with NODE_ENV=development or rely on .env.local

import { getSQLiteConnection } from '../database/connection';

try {
    const db = getSQLiteConnection();

    console.log('🔍 Verifying DEVELOPMENT database...\n');

    const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all() as { name: string }[];

    console.log('📊 Found tables in dev.db:');
    tables.forEach((table) => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
        console.log(`  ✅ ${table.name} (${count.count} rows)`);
    });

    console.log('\n✨ Development database verification complete!');
    process.exit(0);
} catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
}
