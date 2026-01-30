/**
 * Catalog Repository
 * Data access layer for catalogs table
 */

import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { getDatabase, getSQLiteConnection } from '../connection';
import { catalogs, rolls, type Catalog, type NewCatalog } from '../schema';
import type { Repository, PaginatedResult, PaginationOptions } from './base';
import type { CatalogStatus } from '@/lib/electron-api';

export interface CatalogFilters {
    status?: CatalogStatus;
    material?: string;
    search?: string;
}

export class CatalogRepository implements Repository<Catalog, NewCatalog> {
    private db = getDatabase();
    private sqliteDb = getSQLiteConnection();

    /**
     * Find all catalogs with optional filters
     */
    findAll(filters?: CatalogFilters): Catalog[] {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(catalogs).orderBy(desc(catalogs.createdAt)).all();
        }

        return this.db
            .select()
            .from(catalogs)
            .where(and(...conditions))
            .orderBy(desc(catalogs.createdAt))
            .all();
    }

    /**
     * Find catalogs with pagination
     */
    findPaginated(
        filters?: CatalogFilters,
        options?: PaginationOptions
    ): PaginatedResult<Catalog> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        const conditions = this.buildWhereClause(filters);
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const countResult = whereClause
            ? this.db.select().from(catalogs).where(whereClause).all()
            : this.db.select().from(catalogs).all();
        const total = countResult.length;

        // Get paginated data
        const data = whereClause
            ? this.db
                .select()
                .from(catalogs)
                .where(whereClause)
                .orderBy(desc(catalogs.createdAt))
                .limit(limit)
                .offset(offset)
                .all()
            : this.db
                .select()
                .from(catalogs)
                .orderBy(desc(catalogs.createdAt))
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
     * Find catalog by ID
     */
    findById(id: string): Catalog | null {
        const result = this.db.select().from(catalogs).where(eq(catalogs.id, id)).get();
        return result || null;
    }

    /**
     * Find catalog by code
     */
    findByCode(code: string): Catalog | null {
        const result = this.db.select().from(catalogs).where(eq(catalogs.code, code)).get();
        return result || null;
    }

    /**
     * Create new catalog
     */
    create(data: NewCatalog): Catalog {
        const result = this.db.insert(catalogs).values(data).returning().get();
        return result;
    }

    /**
     * Update catalog
     */
    update(id: string, data: Partial<NewCatalog>): Catalog {
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        const result = this.db
            .update(catalogs)
            .set(updateData)
            .where(eq(catalogs.id, id))
            .returning()
            .get();

        if (!result) {
            throw new Error(`Catalog with id ${id} not found`);
        }

        return result;
    }

    /**
     * Delete catalog
     */
    delete(id: string): void {
        const result = this.db.delete(catalogs).where(eq(catalogs.id, id)).returning().get();

        if (!result) {
            throw new Error(`Catalog with id ${id} not found`);
        }
    }

    /**
     * Count catalogs
     */
    count(filters?: CatalogFilters): number {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(catalogs).all().length;
        }

        return this.db
            .select()
            .from(catalogs)
            .where(and(...conditions))
            .all().length;
    }

    /**
     * Check if code exists
     */
    codeExists(code: string, excludeId?: string): boolean {
        const result = this.db
            .select()
            .from(catalogs)
            .where(
                excludeId
                    ? and(eq(catalogs.code, code), eq(catalogs.id, excludeId))
                    : eq(catalogs.code, code)
            )
            .get();

        return excludeId ? !result : !!result;
    }

    /**
     * Get roll count for catalog
     */
    getRollCount(catalogId: string): number {
        const result = this.sqliteDb
            .prepare('SELECT COUNT(*) as count FROM rolls WHERE catalog_id = ?')
            .get(catalogId) as { count: number };

        return result.count;
    }

    /**
     * Get active roll count for catalog
     */
    getActiveRollCount(catalogId: string): number {
        const result = this.sqliteDb
            .prepare("SELECT COUNT(*) as count FROM rolls WHERE catalog_id = ? AND status != 'sold'")
            .get(catalogId) as { count: number };

        return result.count;
    }

    /**
     * Update catalog status
     */
    updateStatus(id: string, status: CatalogStatus): Catalog {
        return this.update(id, { status });
    }

    /**
     * Get all unique materials
     */
    getAllMaterials(): string[] {
        const results = this.db
            .select({ material: catalogs.material })
            .from(catalogs)
            .groupBy(catalogs.material)
            .all();

        return results.map((r) => r.material);
    }

    /**
     * Build where clause from filters
     */
    private buildWhereClause(filters?: CatalogFilters) {
        const conditions = [];

        if (filters?.status) {
            conditions.push(eq(catalogs.status, filters.status));
        }

        if (filters?.material) {
            conditions.push(eq(catalogs.material, filters.material));
        }

        if (filters?.search) {
            conditions.push(
                or(
                    like(catalogs.name, `%${filters.search}%`),
                    like(catalogs.code, `%${filters.search}%`),
                    like(catalogs.description, `%${filters.search}%`)
                )!
            );
        }

        return conditions;
    }
}

// Singleton instance
let instance: CatalogRepository | null = null;

export function getCatalogRepository(): CatalogRepository {
    if (!instance) {
        instance = new CatalogRepository();
    }
    return instance;
}
