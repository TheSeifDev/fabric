/**
 * Catalog Service
 * Handles all catalog-related business logic and data access
 */

import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO, APIResponse } from '@/lib/electron-api.d';

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
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('CatalogService.getById error:', error);
            throw error;
        }
    }

    /**
     * Create a new catalog
     */
    async create(data: CreateCatalogDTO): Promise<Catalog> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Catalog> = await window.electronAPI.catalogs.create(data);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('CatalogService.create error:', error);
            throw error;
        }
    }

    /**
     * Update an existing catalog
     */
    async update(id: string, data: UpdateCatalogDTO): Promise<Catalog> {
        try {
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
            // Check if catalog has rolls first
            const rollsCount = await this.getRollsCount(id);

            if (rollsCount > 0) {
                throw new Error(`Cannot delete catalog with ${rollsCount} associated rolls`);
            }

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<null> = await window.electronAPI.catalogs.delete(id);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('CatalogService.delete error:', error);
            throw error;
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
