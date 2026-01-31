/**
 * Database Schema Definitions
 * Drizzle ORM schema for SQLite database
 */

import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

/**
 * Users Table
 * Stores user accounts with roles and authentication
 */
export const users = sqliteTable(
    'users',
    {
        id: text('id').primaryKey(),
        name: text('name').notNull(),
        email: text('email').notNull().unique(),
        passwordHash: text('password_hash').notNull(),
        role: text('role', { enum: ['admin', 'storekeeper', 'viewer'] }).notNull(),
        status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
        createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
        updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    },
    (table) => ({
        emailIdx: index('idx_users_email').on(table.email),
        roleIdx: index('idx_users_role').on(table.role),
    })
);

/**
 * Catalogs Table
 * Stores fabric catalog information with soft delete support
 */
export const catalogs = sqliteTable(
    'catalogs',
    {
        id: text('id').primaryKey(),
        code: text('code').notNull().unique(),
        name: text('name').notNull(),
        material: text('material').notNull(),
        description: text('description'),
        status: text('status', { enum: ['active', 'archived', 'draft'] }).notNull().default('active'),
        image: text('image'),
        createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
        updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
        createdBy: text('created_by').references(() => users.id),
        updatedBy: text('updated_by').references(() => users.id),
        deletedAt: integer('deleted_at', { mode: 'timestamp' }),
        deletedBy: text('deleted_by').references(() => users.id),
    },
    (table) => ({
        codeIdx: index('idx_catalogs_code').on(table.code),
        statusIdx: index('idx_catalogs_status').on(table.status),
        createdByIdx: index('idx_catalogs_created_by').on(table.createdBy),
        deletedAtIdx: index('idx_catalogs_deleted_at').on(table.deletedAt),
    })
);

/**
 * Rolls Table
 * Stores fabric roll inventory with soft delete support
 * CONSTRAINT: Active rolls must have unique barcodes (enforced by unique index)
 */
export const rolls = sqliteTable(
    'rolls',
    {
        id: text('id').primaryKey(),
        barcode: text('barcode').notNull(),
        catalogId: text('catalog_id')
            .notNull()
            .references(() => catalogs.id),
        color: text('color').notNull(),
        degree: text('degree', { enum: ['A', 'B', 'C'] }).notNull(),
        lengthMeters: real('length_meters').notNull(),
        status: text('status', { enum: ['in_stock', 'reserved', 'sold'] })
            .notNull()
            .default('in_stock'),
        location: text('location'),
        createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
        updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
        createdBy: text('created_by').references(() => users.id),
        updatedBy: text('updated_by').references(() => users.id),
        deletedAt: integer('deleted_at', { mode: 'timestamp' }),
        deletedBy: text('deleted_by').references(() => users.id),
    },
    (table) => ({
        barcodeIdx: index('idx_rolls_barcode').on(table.barcode),
        catalogIdIdx: index('idx_rolls_catalog_id').on(table.catalogId),
        statusIdx: index('idx_rolls_status').on(table.status),
        barcodeStatusIdx: index('idx_rolls_barcode_status').on(table.barcode, table.status),
        deletedAtIdx: index('idx_rolls_deleted_at').on(table.deletedAt),
        // Unique constraint: Only one active roll per barcode (deletedAt IS NULL)
        // This is enforced by partial unique index in migration
    })
);

/**
 * Audit Log Table
 * Tracks all changes for compliance and debugging
 */
export const auditLog = sqliteTable(
    'audit_log',
    {
        id: text('id').primaryKey(),
        entityType: text('entity_type').notNull(),
        entityId: text('entity_id').notNull(),
        action: text('action', { enum: ['create', 'update', 'delete'] }).notNull(),
        userId: text('user_id').references(() => users.id),
        changes: text('changes'), // JSON string
        timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
    },
    (table) => ({
        entityIdx: index('idx_audit_entity').on(table.entityType, table.entityId),
        userIdx: index('idx_audit_user').on(table.userId),
        timestampIdx: index('idx_audit_timestamp').on(table.timestamp),
    })
);

/**
 * Type exports for use in application
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Catalog = typeof catalogs.$inferSelect;
export type NewCatalog = typeof catalogs.$inferInsert;

export type Roll = typeof rolls.$inferSelect;
export type NewRoll = typeof rolls.$inferInsert;

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
