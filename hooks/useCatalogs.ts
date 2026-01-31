/**
 * useCatalogs Hook
 * React hook for managing catalog data and operations
 * Supports both Electron (IPC) and Web (HTTP API) modes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getAllCatalogs,
    getCatalogById,
    createCatalog as createCatalogAPI,
    updateCatalog as updateCatalogAPI,
    deleteCatalog as deleteCatalogAPI,
} from '@/lib/api/catalogs';
import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO } from '@/lib/electron-api.d';

// Helper to check if running in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

export function useCatalogs() {
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load catalogs - Electron IPC or Web API
    const loadCatalogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let data: Catalog[];
            if (isElectron) {
                const result = await (window as any).electronAPI.catalogs.getAll();
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to load catalogs');
                }
                data = result.data;
            } else {
                data = await getAllCatalogs();
            }

            setCatalogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load catalogs');
            console.error('useCatalogs.loadCatalogs error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get specific catalog - Electron IPC or Web API
    const getCatalog = useCallback(async (id: string): Promise<Catalog | null> => {
        try {
            setError(null);

            let catalog: Catalog;
            if (isElectron) {
                const result = await (window as any).electronAPI.catalogs.getById(id);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to get catalog');
                }
                catalog = result.data;
            } else {
                catalog = await getCatalogById(id);
            }

            return catalog;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get catalog');
            console.error('useCatalogs.getCatalog error:', err);
            return null;
        }
    }, []);

    // Create catalog - Electron IPC or Web API
    const createCatalog = useCallback(async (data: CreateCatalogDTO): Promise<Catalog | null> => {
        try {
            setError(null);

            let newCatalog: Catalog;
            if (isElectron) {
                const result = await (window as any).electronAPI.catalogs.create(data);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to create catalog');
                }
                newCatalog = result.data;
            } else {
                newCatalog = await createCatalogAPI(data);
            }

            setCatalogs((prev) => [...prev, newCatalog]);
            return newCatalog;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create catalog');
            console.error('useCatalogs.createCatalog error:', err);
            return null;
        }
    }, []);

    // Update catalog - Electron IPC or Web API
    const updateCatalog = useCallback(async (id: string, data: UpdateCatalogDTO): Promise<Catalog | null> => {
        try {
            setError(null);

            let updatedCatalog: Catalog;
            if (isElectron) {
                const result = await (window as any).electronAPI.catalogs.update(id, data);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to update catalog');
                }
                updatedCatalog = result.data;
            } else {
                updatedCatalog = await updateCatalogAPI(id, data);
            }

            setCatalogs((prev) =>
                prev.map((catalog) => (catalog.id === id ? updatedCatalog : catalog))
            );
            return updatedCatalog;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update catalog');
            console.error('useCatalogs.updateCatalog error:', err);
            return null;
        }
    }, []);

    // Delete catalog - Electron IPC or Web API
    const deleteCatalog = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);

            if (isElectron) {
                const result = await (window as any).electronAPI.catalogs.delete(id);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to delete catalog');
                }
            } else {
                await deleteCatalogAPI(id);
            }

            setCatalogs((prev) => prev.filter((catalog) => catalog.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete catalog';
            setError(message);
            console.error('useCatalogs.deleteCatalog error:', err);
            throw err; // Re-throw to notify the UI about cascade delete issues
        }
    }, []);

    // Load catalogs on mount
    useEffect(() => {
        loadCatalogs();
    }, [loadCatalogs]);

    return {
        catalogs,
        loading,
        error,
        loadCatalogs,
        getCatalog,
        createCatalog,
        updateCatalog,
        deleteCatalog,
    };
}
