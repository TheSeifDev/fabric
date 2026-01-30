/**
 * Catalog Service
 * Handles all catalog-related business logic and data access
 */

import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO, APIResponse } from '@/lib/electron-api.d';
import { NotFoundError, ConflictError, ValidationError, DatabaseError, BusinessError, normalizeError } from '@/lib/errors';
import {
    validateCatalogCreate,
    validateCatalogUpdate,
    validateCatalogDelete,
    validateCatalogCodeUnique
} from '@/lib/business-rules';

class CatalogService {
    /**
     * Get all catalogs
     */
    async getAll(): Promise<Catalog[]> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Catalog[]> = await window.electronAPI.catalogs.getAll();

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            console.warn('electronAPI not available, returning empty array');
            return [];
        } catch (error) {
            console.error('CatalogService.getAll error:', error);
            throw error;
        }
    }

    /**
     * Get a single catalog by ID
     */
    async getById(id: string): Promise<Catalog> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Catalog> = await window.electronAPI.catalogs.getById(id);

                if (!response.success) {
                    if (response.error.code === 'NOT_FOUND') {
                        throw new NotFoundError('Catalog', id);
                    }
                    throw new DatabaseError(response.error.message, response.error.code);
                }

                return response.data;
            }

            throw new DatabaseError('electronAPI not available');
        } catch (error) {
            throw normalizeError(error);
        }
    }

    /**
     * Create a new catalog
     */
    async create(data: CreateCatalogDTO): Promise<Catalog> {
        try {
            // Business rule validation
            validateCatalogCreate(data);

            // Check code uniqueness
            const allCatalogs = await this.getAll();
            validateCatalogCodeUnique(data.code, allCatalogs);

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Catalog> = await window.electronAPI.catalogs.create(data);

                if (!response.success) {
                    if (response.error.code === 'CONFLICT') {
                        throw new ConflictError(response.error.message, 'code');
                    }
                    if (response.error.code === 'VALIDATION_ERROR') {
                        throw new ValidationError(response.error.message);
                    }
                    throw new DatabaseError(response.error.message, response.error.code);
                }

                return response.data;
            }

            throw new DatabaseError('electronAPI not available');
        } catch (error) {
            throw normalizeError(error);
        }
    }

    /**
     * Update an existing catalog
     */
    async update(id: string, data: UpdateCatalogDTO): Promise<Catalog> {
        try {
            // Get current catalog
            const currentCatalog = await this.getById(id);

            // Get rolls count for validation
            const rollsCount = await this.getRollsCount(id);
            const hasRolls = rollsCount > 0;

            // Business rule validation
            validateCatalogUpdate(currentCatalog, data, hasRolls);

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Catalog> = await window.electronAPI.catalogs.update(id, data);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('CatalogService.update error:', error);
            throw error;
        }
    }

    /**
     * Delete a catalog (soft delete)
     */
    async delete(id: string): Promise<void> {
        try {
            // Get catalog and rolls count
            const catalog = await this.getById(id);
            const rollsCount = await this.getRollsCount(id);

            // Business rule validation
            validateCatalogDelete(catalog, rollsCount);

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<null> = await window.electronAPI.catalogs.delete(id);

                if (!response.success) {
                    if (response.error.code === 'NOT_FOUND') {
                        throw new NotFoundError('Catalog', id);
                    }
                    throw new DatabaseError(response.error.message, response.error.code);
                }

                return;
            }

            throw new DatabaseError('electronAPI not available');
        } catch (error) {
            throw normalizeError(error);
        }
    }

    /**
     * Get count of rolls for a catalog
     */
    async getRollsCount(catalogId: string): Promise<number> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<number> = await window.electronAPI.catalogs.getRollsCount(catalogId);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            return 0;
        } catch (error) {
            console.error('CatalogService.getRollsCount error:', error);
            return 0;
        }
    }

    /**
     * Check if catalog code is unique
     */
    async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
        try {
            const catalogs = await this.getAll();
            const existing = catalogs.find(c => c.code === code);

            if (!existing) return true;
            if (excludeId && existing.id === excludeId) return true;

            return false;
        } catch (error) {
            console.error('CatalogService.isCodeUnique error:', error);
            return false;
        }
    }
}

// Export singleton instance
export const catalogService = new CatalogService();
export default catalogService;
