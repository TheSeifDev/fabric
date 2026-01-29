/**
 * Roll Service
 * Handles all roll-related business logic and data access
 * Acts as an abstraction layer between UI and IPC/Database
 */

import type { Roll, CreateRollDTO, UpdateRollDTO, RollFilters, APIResponse } from '@/lib/electron-api.d';

class RollService {
    /**
     * Get all rolls with optional filters
     */
    async getAll(filters?: RollFilters): Promise<Roll[]> {
        try {
            // In production, this will call window.electronAPI.rolls.getAll(filters)
            // For now, return mock data or throw error if electronAPI not available

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Roll[]> = await window.electronAPI.rolls.getAll(filters);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            // Fallback to empty array if electronAPI not available (SSR or development)
            console.warn('electronAPI not available, returning empty array');
            return [];
        } catch (error) {
            console.error('RollService.getAll error:', error);
            throw error;
        }
    }

    /**
     * Get a single roll by ID
     */
    async getById(id: string): Promise<Roll> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Roll> = await window.electronAPI.rolls.getById(id);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('RollService.getById error:', error);
            throw error;
        }
    }

    /**
     * Find roll by barcode
     */
    async findByBarcode(barcode: string): Promise<Roll | null> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Roll | null> = await window.electronAPI.rolls.findByBarcode(barcode);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            return null;
        } catch (error) {
            console.error('RollService.findByBarcode error:', error);
            throw error;
        }
    }

    /**
     * Create a new roll
     */
    async create(data: CreateRollDTO): Promise<Roll> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Roll> = await window.electronAPI.rolls.create(data);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('RollService.create error:', error);
            throw error;
        }
    }

    /**
     * Update an existing roll
     */
    async update(id: string, data: UpdateRollDTO): Promise<Roll> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Roll> = await window.electronAPI.rolls.update(id, data);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('RollService.update error:', error);
            throw error;
        }
    }

    /**
     * Delete a roll (soft delete)
     */
    async delete(id: string): Promise<void> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<null> = await window.electronAPI.rolls.delete(id);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('RollService.delete error:', error);
            throw error;
        }
    }

    /**
     * Search rolls by query string
     */
    async search(query: string): Promise<Roll[]> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<Roll[]> = await window.electronAPI.rolls.search(query);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            return [];
        } catch (error) {
            console.error('RollService.search error:', error);
            throw error;
        }
    }

    /**
     * Check if barcode is unique
     */
    async isBarcodeUnique(barcode: string, excludeId?: string): Promise<boolean> {
        try {
            const existing = await this.findByBarcode(barcode);

            if (!existing) return true;
            if (excludeId && existing.id === excludeId) return true;

            return false;
        } catch (error) {
            console.error('RollService.isBarcodeUnique error:', error);
            return false;
        }
    }
}

// Export singleton instance
export const rollService = new RollService();
export default rollService;
