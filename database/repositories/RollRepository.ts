/**
 * Roll Repository
 * Data access layer for rolls table
 */

import { eq, and, or, like, desc, gte, lte, inArray } from 'drizzle-orm';
import { getDatabase, getSQLiteConnection } from '../connection';
import { rolls, catalogs, type Roll, type NewRoll } from '../schema';
import type { Repository, PaginatedResult, PaginationOptions } from './base';
import type { RollStatus, RollDegree, RollFilters as APIRollFilters } from '@/lib/electron-api';

export interface RollFilters extends Omit<APIRollFilters, 'catalog'> {
    catalogId?: string;
    status?: RollStatus;
    degree?: RollDegree;
    color?: string;
    search?: string;
    minLength?: number;
    maxLength?: number;
}

export class RollRepository implements Repository<Roll, NewRoll> {
    private db = getDatabase();
    private sqliteDb = getSQLiteConnection();

    /**
     * Find all rolls with optional filters
     */
    findAll(filters?: RollFilters): Roll[] {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(rolls).orderBy(desc(rolls.createdAt)).all();
        }

        return this.db
            .select()
            .from(rolls)
            .where(and(...conditions))
            .orderBy(desc(rolls.createdAt))
            .all();
    }

    /**
     * Find rolls with pagination
     */
    findPaginated(filters?: RollFilters, options?: PaginationOptions): PaginatedResult<Roll> {
        const page = options?.page || 1;
        const limit = options?.limit || 50;
        const offset = (page - 1) * limit;

        const conditions = this.buildWhereClause(filters);
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const countResult = whereClause
            ? this.db.select().from(rolls).where(whereClause).all()
            : this.db.select().from(rolls).all();
        const total = countResult.length;

        // Get paginated data
        const data = whereClause
            ? this.db
                .select()
                .from(rolls)
                .where(whereClause)
                .orderBy(desc(rolls.createdAt))
                .limit(limit)
                .offset(offset)
                .all()
            : this.db
                .select()
                .from(rolls)
                .orderBy(desc(rolls.createdAt))
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
     * Find roll by ID
     */
    findById(id: string): Roll | null {
        const result = this.db.select().from(rolls).where(eq(rolls.id, id)).get();
        return result || null;
    }

    /**
     * Find rolls by barcode
     */
    findByBarcode(barcode: string): Roll[] {
        return this.db.select().from(rolls).where(eq(rolls.barcode, barcode)).all();
    }

    /**
     * Find active roll by barcode (not sold)
     */
    findActiveByBarcode(barcode: string): Roll | null {
        const result = this.db
            .select()
            .from(rolls)
            .where(and(eq(rolls.barcode, barcode), or(eq(rolls.status, 'in_stock'), eq(rolls.status, 'reserved'))!))
            .get();

        return result || null;
    }

    /**
     * Check if barcode is available (barcode reuse policy)
     * Returns true if barcode can be used (no active rolls with this barcode)
     */
    isBarcodeAvailable(barcode: string, excludeId?: string): boolean {
        const conditions = [
            eq(rolls.barcode, barcode),
            or(eq(rolls.status, 'in_stock'), eq(rolls.status, 'reserved'))!,
        ];

        if (excludeId) {
            // When updating, exclude the current roll from the check
            const result = this.db
                .select()
                .from(rolls)
                .where(
                    and(
                        eq(rolls.barcode, barcode),
                        or(eq(rolls.status, 'in_stock'), eq(rolls.status, 'reserved'))!
                    )
                )
                .all();

            // Available if no other active rolls exist with this barcode
            return result.filter((r) => r.id !== excludeId).length === 0;
        }

        const result = this.db.select().from(rolls).where(and(...conditions)).get();

        return !result; // Available if no active roll found
    }

    /**
     * Create new roll
     */
    create(data: NewRoll): Roll {
        const result = this.db.insert(rolls).values(data).returning().get();
        return result;
    }

    /**
     * Update roll
     */
    update(id: string, data: Partial<NewRoll>): Roll {
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        const result = this.db.update(rolls).set(updateData).where(eq(rolls.id, id)).returning().get();

        if (!result) {
            throw new Error(`Roll with id ${id} not found`);
        }

        return result;
    }

    /**
     * Delete roll
     */
    delete(id: string): void {
        const result = this.db.delete(rolls).where(eq(rolls.id, id)).returning().get();

        if (!result) {
            throw new Error(`Roll with id ${id} not found`);
        }
    }

    /**
     * Count rolls
     */
    count(filters?: RollFilters): number {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(rolls).all().length;
        }

        return this.db
            .select()
            .from(rolls)
            .where(and(...conditions))
            .all().length;
    }

    /**
     * Update roll status
     */
    updateStatus(id: string, status: RollStatus): Roll {
        return this.update(id, { status });
    }

    /**
     * Get all unique colors
     */
    getAllColors(): string[] {
        const results = this.db
            .select({ color: rolls.color })
            .from(rolls)
            .groupBy(rolls.color)
            .all();

        return results.map((r) => r.color);
    }

    /**
     * Get rolls by catalog ID
     */
    findByCatalogId(catalogId: string): Roll[] {
        return this.db.select().from(rolls).where(eq(rolls.catalogId, catalogId)).all();
    }

    /**
     * Get inventory summary
     */
    getInventorySummary() {
        const result = this.sqliteDb.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(length_meters) as totalLength
      FROM rolls
      GROUP BY status
    `).all() as Array<{ status: RollStatus; count: number; totalLength: number }>;

        return result;
    }

    /**
     * Build where clause from filters
     */
    private buildWhereClause(filters?: RollFilters) {
        const conditions = [];

        if (filters?.catalogId) {
            conditions.push(eq(rolls.catalogId, filters.catalogId));
        }

        if (filters?.status) {
            conditions.push(eq(rolls.status, filters.status));
        }

        if (filters?.degree) {
            conditions.push(eq(rolls.degree, filters.degree));
        }

        if (filters?.color) {
            conditions.push(eq(rolls.color, filters.color));
        }

        if (filters?.minLength !== undefined) {
            conditions.push(gte(rolls.lengthMeters, filters.minLength));
        }

        if (filters?.maxLength !== undefined) {
            conditions.push(lte(rolls.lengthMeters, filters.maxLength));
        }

        if (filters?.search) {
            conditions.push(
                or(
                    like(rolls.barcode, `%${filters.search}%`),
                    like(rolls.color, `%${filters.search}%`),
                    like(rolls.location, `%${filters.search}%`)
                )!
            );
        }

        return conditions;
    }
}

// Singleton instance
let instance: RollRepository | null = null;

export function getRollRepository(): RollRepository {
    if (!instance) {
        instance = new RollRepository();
    }
    return instance;
}
