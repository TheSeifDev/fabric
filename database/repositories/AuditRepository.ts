/**
 * Audit Repository
 * Data access layer for audit_log table
 */

import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { auditLog, type AuditLogEntry, type NewAuditLogEntry } from '../schema';
import type { PaginatedResult, PaginationOptions } from './base';

export type AuditAction = 'create' | 'update' | 'delete';
export type EntityType = 'user' | 'catalog' | 'roll';

export interface AuditFilters {
    entityType?: EntityType;
    entityId?: string;
    action?: AuditAction;
    userId?: string;
    startDate?: number;
    endDate?: number;
}

export class AuditRepository {
    private db = getDatabase();

    /**
     * Find all audit entries with optional filters
     */
    findAll(filters?: AuditFilters): AuditLogEntry[] {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(auditLog).orderBy(desc(auditLog.timestamp)).all();
        }

        return this.db
            .select()
            .from(auditLog)
            .where(and(...conditions))
            .orderBy(desc(auditLog.timestamp))
            .all();
    }

    /**
     * Find audit entries with pagination
     */
    findPaginated(
        filters?: AuditFilters,
        options?: PaginationOptions
    ): PaginatedResult<AuditLogEntry> {
        const page = options?.page || 1;
        const limit = options?.limit || 50;
        const offset = (page - 1) * limit;

        const conditions = this.buildWhereClause(filters);
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const countResult = whereClause
            ? this.db.select().from(auditLog).where(whereClause).all()
            : this.db.select().from(auditLog).all();
        const total = countResult.length;

        // Get paginated data
        const data = whereClause
            ? this.db
                .select()
                .from(auditLog)
                .where(whereClause)
                .orderBy(desc(auditLog.timestamp))
                .limit(limit)
                .offset(offset)
                .all()
            : this.db
                .select()
                .from(auditLog)
                .orderBy(desc(auditLog.timestamp))
                .limit(limit)
                .offset(offset)
                .all();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Find audit entry by ID
     */
    findById(id: string): AuditLogEntry | null {
        const result = this.db.select().from(auditLog).where(eq(auditLog.id, id)).get();
        return result || null;
    }

    /**
     * Find audit entries for specific entity
     */
    findByEntity(entityType: EntityType, entityId: string): AuditLogEntry[] {
        return this.db
            .select()
            .from(auditLog)
            .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
            .orderBy(desc(auditLog.timestamp))
            .all();
    }

    /**
     * Find audit entries by user
     */
    findByUser(userId: string): AuditLogEntry[] {
        return this.db
            .select()
            .from(auditLog)
            .where(eq(auditLog.userId, userId))
            .orderBy(desc(auditLog.timestamp))
            .all();
    }

    /**
     * Create audit log entry
     */
    log(data: NewAuditLogEntry): AuditLogEntry {
        const result = this.db.insert(auditLog).values(data).returning().get();
        return result;
    }

    /**
     * Log entity creation
     */
    logCreate(
        entityType: EntityType,
        entityId: string,
        userId: string | null,
        data: any
    ): AuditLogEntry {
        return this.log({
            id: crypto.randomUUID(),
            entityType,
            entityId,
            action: 'create',
            userId,
            changes: JSON.stringify(data),
            timestamp: new Date(),
        });
    }

    /**
     * Log entity update
     */
    logUpdate(
        entityType: EntityType,
        entityId: string,
        userId: string | null,
        changes: any
    ): AuditLogEntry {
        return this.log({
            id: crypto.randomUUID(),
            entityType,
            entityId,
            action: 'update',
            userId,
            changes: JSON.stringify(changes),
            timestamp: new Date(),
        });
    }

    /**
     * Log entity deletion
     */
    logDelete(
        entityType: EntityType,
        entityId: string,
        userId: string | null,
        data: any
    ): AuditLogEntry {
        return this.log({
            id: crypto.randomUUID(),
            entityType,
            entityId,
            action: 'delete',
            userId,
            changes: JSON.stringify(data),
            timestamp: new Date(),
        });
    }

    /**
     * Count audit entries
     */
    count(filters?: AuditFilters): number {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(auditLog).all().length;
        }

        return this.db
            .select()
            .from(auditLog)
            .where(and(...conditions))
            .all().length;
    }

    /**
     * Delete old audit entries (data retention)
     */
    deleteOlderThan(days: number): number {
        const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

        const deleted = this.db
            .delete(auditLog)
            .where(lte(auditLog.timestamp, new Date(cutoffDate)))
            .returning()
            .all();

        return deleted.length;
    }

    /**
     * Build where clause from filters
     */
    private buildWhereClause(filters?: AuditFilters) {
        const conditions = [];

        if (filters?.entityType) {
            conditions.push(eq(auditLog.entityType, filters.entityType));
        }

        if (filters?.entityId) {
            conditions.push(eq(auditLog.entityId, filters.entityId));
        }

        if (filters?.action) {
            conditions.push(eq(auditLog.action, filters.action));
        }

        if (filters?.userId) {
            conditions.push(eq(auditLog.userId, filters.userId));
        }

        if (filters?.startDate) {
            conditions.push(gte(auditLog.timestamp, new Date(filters.startDate)));
        }

        if (filters?.endDate) {
            conditions.push(lte(auditLog.timestamp, new Date(filters.endDate)));
        }

        return conditions;
    }
}

// Singleton instance
let instance: AuditRepository | null = null;

export function getAuditRepository(): AuditRepository {
    if (!instance) {
        instance = new AuditRepository();
    }
    return instance;
}
