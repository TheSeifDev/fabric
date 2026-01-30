/**
 * Database Seeding
 * Creates initial data for development and testing
 */

import { getSQLiteConnection } from './connection';
import * as crypto from 'crypto';

/**
 * Hash password (simple for development - use bcrypt in production)
 */
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Generate UUID v4
 */
function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Seed initial data
 */
export async function seedInitialData() {
    const db = getSQLiteConnection();
    const now = Date.now();

    console.log('   📝 Creating admin user...');

    // Create admin user
    const adminId = generateId();
    db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        adminId,
        'Admin User',
        'admin@fabric.local',
        hashPassword('admin123'), // Default password - CHANGE IN PRODUCTION
        'admin',
        'active',
        now,
        now
    );

    console.log('   ✅ Admin user created (email: admin@fabric.local, password: admin123)');

    // Create sample catalogs
    console.log('   📝 Creating sample catalogs...');

    const catalog1Id = generateId();
    const catalog2Id = generateId();
    const catalog3Id = generateId();

    db.prepare(`
    INSERT INTO catalogs (id, code, name, material, description, status, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        catalog1Id,
        'CTN-001',
        'Premium Cotton',
        'Cotton',
        'High-quality cotton fabric for premium garments',
        'active',
        now,
        now,
        adminId
    );

    db.prepare(`
    INSERT INTO catalogs (id, code, name, material, description, status, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        catalog2Id,
        'PLY-001',
        'Polyester Blend',
        'Polyester',
        'Durable polyester blend for everyday wear',
        'active',
        now,
        now,
        adminId
    );

    db.prepare(`
    INSERT INTO catalogs (id, code, name, material, description, status, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        catalog3Id,
        'SLK-001',
        'Silk Luxury',
        'Silk',
        'Premium silk fabric for luxury items',
        'active',
        now,
        now,
        adminId
    );

    console.log('   ✅ 3 sample catalogs created');

    // Create sample rolls
    console.log('   📝 Creating sample rolls...');

    const sampleRolls = [
        { barcode: 'RC001', catalogId: catalog1Id, color: 'White', degree: 'A', length: 50.5, location: 'A1-01' },
        { barcode: 'RC002', catalogId: catalog1Id, color: 'Blue', degree: 'A', length: 45.0, location: 'A1-02' },
        { barcode: 'RC003', catalogId: catalog1Id, color: 'Red', degree: 'B', length: 40.0, location: 'A1-03' },
        { barcode: 'RP001', catalogId: catalog2Id, color: 'Black', degree: 'A', length: 55.5, location: 'B1-01' },
        { barcode: 'RP002', catalogId: catalog2Id, color: 'Gray', degree: 'A', length: 48.0, location: 'B1-02' },
        { barcode: 'RS001', catalogId: catalog3Id, color: 'Gold', degree: 'A', length: 30.0, location: 'C1-01' },
        { barcode: 'RS002', catalogId: catalog3Id, color: 'Silver', degree: 'B', length: 25.5, location: 'C1-02' },
        { barcode: 'RC004', catalogId: catalog1Id, color: 'Green', degree: 'C', length: 35.0, location: 'A2-01' },
    ];

    const stmt = db.prepare(`
    INSERT INTO rolls (id, barcode, catalog_id, color, degree, length_meters, status, location, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    for (const roll of sampleRolls) {
        stmt.run(
            generateId(),
            roll.barcode,
            roll.catalogId,
            roll.color,
            roll.degree,
            roll.length,
            'in_stock',
            roll.location,
            now,
            now,
            adminId
        );
    }

    console.log(`   ✅ ${sampleRolls.length} sample rolls created`);

    console.log('   📊 Database seeded successfully!');
    console.log('   📝 Login with: admin@fabric.local / admin123');
}

/**
 * Clear all data (development only)
 */
export function clearAllData() {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Data clearing is only allowed in development');
    }

    const db = getSQLiteConnection();

    db.prepare('DELETE FROM audit_log').run();
    db.prepare('DELETE FROM rolls').run();
    db.prepare('DELETE FROM catalogs').run();
    db.prepare('DELETE FROM users').run();

    console.log('🗑️  All data cleared');
}
