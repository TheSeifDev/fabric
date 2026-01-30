/**
 * Catalog Service (Database-Enabled)
 * Handles all catalog-related business logic with direct database access
 */

import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO } from '@/lib/electron-api.d';
import { NotFoundError, ConflictError, ValidationError, DatabaseError, BusinessError } from '@/lib/errors';
import {
    validateCatalogCreate,
    validateCatalogUpdate,
    validateCatalogDelete,
    validateCatalogCodeUnique,
} from '@/lib/business-rules';
import { getCatalogRepository, getAuditRepository } from '@/database/repositories';
import type { NewCatalog } from '@/database/schema';
import { generateUUID } from '@/lib/utils';

class CatalogService {
    private catalogRepo = getCatalogRepository();
    private auditRepo = getAuditRepository();

    /**
     * Get all catalogs
     */
    async getAll(): Promise<Catalog[]> {
        try {
            const catalogs = this.catalogRepo.findAll();
            return catalogs.map(this.mapToAPI);
        } catch (error) {
            console.error('CatalogService.getAll error:', error);
            throw new DatabaseError('Failed to fetch catalogs');
        }
    }

    /**
     * Get a single catalog by ID
     */
    async getById(id: string): Promise<Catalog> {
        try {
            const catalog = this.catalogRepo.findById(id);

            if (!catalog) {
                throw new NotFoundError('Catalog', id);
            }

            return this.mapToAPI(catalog);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('CatalogService.getById error:', error);
            throw new DatabaseError('Failed to fetch catalog');
        }
    }

    /**
     * Get a catalog by code
     */
    async getByCode(code: string): Promise<Catalog | null> {
        try {
            const catalog = this.catalogRepo.findByCode(code);
            return catalog ? this.mapToAPI(catalog) : null;
        } catch (error) {
            console.error('CatalogService.getByCode error:', error);
            throw new DatabaseError('Failed to fetch catalog by code');
        }
    }

    /**
     * Create a new catalog
     */
    async create(data: CreateCatalogDTO, userId?: string): Promise<Catalog> {
        try {
            // 1. Validate catalog data
            validateCatalogCreate(data);

            // 2. Check if code exists in DB
            if (this.catalogRepo.codeExists(data.code)) {
                throw new ConflictError(
                    `Catalog code ${data.code} already exists`,
                    'code'
                );
            }

            // 4. Create catalog in database
            const now = new Date();
            const newCatalog: NewCatalog = {
                id: generateUUID(),
                code: data.code,
                name: data.name,
                material: data.material,
                description: data.description || null,
                status: data.status || 'active',
                image: data.image || null,
                createdAt: now,
                updatedAt: now,
                createdBy: userId || null,
                updatedBy: userId || null,
            };

            const created = this.catalogRepo.create(newCatalog);

            // 5. Audit log
            if (userId) {
                this.auditRepo.logCreate('catalog', created.id, userId, data);
            }

            return this.mapToAPI(created);
        } catch (error) {
            if (error instanceof ConflictError || error instanceof ValidationError) {
                throw error;
            }
            console.error('CatalogService.create error:', error);
            throw new DatabaseError('Failed to create catalog');
        }
    }

    /**
     * Update a catalog
     */
    async update(id: string, data: UpdateCatalogDTO, userId?: string): Promise<Catalog> {
        try {
            // 1. Get existing catalog
            const existing = this.catalogRepo.findById(id);
            if (!existing) {
                throw new NotFoundError('Catalog', id);
            }

            // 2. Check if archiving with active rolls
            if (data.status === 'archived' && existing.status !== 'archived') {
                const activeRollCount = this.catalogRepo.getActiveRollCount(id);
                if (activeRollCount > 0) {
                    throw new BusinessError(
                        `Cannot archive catalog with ${activeRollCount} active roll(s). Please sell or remove all rolls first.`,
                        'CATALOG_HAS_ACTIVE_ROLLS',
                        { catalogId: id, activeRollCount }
                    );
                }
            }

            // 3. Update catalog in database
            const updateData: Partial<NewCatalog> = {
                ...(data.name && { name: data.name }),
                ...(data.material && { material: data.material }),
                ...(data.description !== undefined && { description: data.description || null }),
                ...(data.status && { status: data.status }),
                ...(data.image !== undefined && { image: data.image || null }),
                updatedBy: userId || 'system',
            };

            const updated = this.catalogRepo.update(id, updateData);

            // 6. Audit log
            if (userId) {
                this.auditRepo.logUpdate('catalog', id, userId, data);
            }

            return this.mapToAPI(updated);
        } catch (error) {
            if (
                error instanceof NotFoundError ||
                error instanceof ConflictError ||
                error instanceof ValidationError ||
                error instanceof BusinessError
            ) {
                throw error;
            }
            console.error('CatalogService.update error:', error);
            throw new DatabaseError('Failed to update catalog');
        }
    }

    /**
     * Delete a catalog
     */
    async delete(id: string, userId?: string): Promise<void> {
        try {
            // 1. Get existing catalog
            const existing = this.catalogRepo.findById(id);
            if (!existing) {
                throw new NotFoundError('Catalog', id);
            }

            // 2. Check if catalog has any rolls
            const rollCount = this.catalogRepo.getRollCount(id);
            if (rollCount > 0) {
                throw new BusinessError(
                    `Cannot delete catalog with ${rollCount} roll(s). Please remove or reassign all rolls before deleting the catalog.`,
                    'CATALOG_HAS_ROLLS',
                    { catalogId: id, catalogName: existing.name, rollCount }
                );
            }

            // 4. Delete from database
            this.catalogRepo.delete(id);

            // 5. Audit log
            if (userId) {
                this.auditRepo.logDelete('catalog', id, userId, existing);
            }
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof BusinessError) {
                throw error;
            }
            console.error('CatalogService.delete error:', error);
            throw new DatabaseError('Failed to delete catalog');
        }
    }

    /**
     * Get all unique materials
     */
    async getMaterials(): Promise<string[]> {
        try {
            return this.catalogRepo.getAllMaterials();
        } catch (error) {
            console.error('CatalogService.getMaterials error:', error);
            throw new DatabaseError('Failed to get materials');
        }
    }

    /**
     * Get roll count for catalog
     */
    async getRollCount(catalogId: string): Promise<number> {
        try {
            return this.catalogRepo.getRollCount(catalogId);
        } catch (error) {
            console.error('CatalogService.getRollCount error:', error);
            throw new DatabaseError('Failed to get roll count');
        }
    }

    /**
     * Map database catalog to API format
     */
    private mapToAPI(catalog: any): Catalog {
        return {
            id: catalog.id,
            code: catalog.code,
            name: catalog.name,
            material: catalog.material,
            description: catalog.description,
            status: catalog.status,
            image: catalog.image,
            createdAt: catalog.createdAt instanceof Date ? catalog.createdAt.getTime() : catalog.createdAt,
            updatedAt: catalog.updatedAt instanceof Date ? catalog.updatedAt.getTime() : catalog.updatedAt,
            createdBy: catalog.createdBy || '',
            updatedBy: catalog.updatedBy || '',
            deletedAt: catalog.deletedAt ? (catalog.deletedAt instanceof Date ? catalog.deletedAt.getTime() : catalog.deletedAt) : null,
            deletedBy: catalog.deletedBy || null,
        };
    }
}

// Export singleton instance
export const catalogService = new CatalogService();
export default catalogService;
