/**
 * useCatalogs Hook
 * React hook for managing catalog data and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '@/lib/services/CatalogService';
import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO } from '@/lib/electron-api.d';

export function useCatalogs() {
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load catalogs
    const loadCatalogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await catalogService.getAll();
            setCatalogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load catalogs');
            console.error('useCatalogs.loadCatalogs error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get catalog by ID
    const getCatalog = useCallback(async (id: string): Promise<Catalog | null> => {
        try {
            setError(null);
            return await catalogService.getById(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get catalog');
            console.error('useCatalogs.getCatalog error:', err);
            return null;
        }
    }, []);

    // Create catalog
    const createCatalog = useCallback(async (data: CreateCatalogDTO): Promise<Catalog | null> => {
        try {
            setError(null);
            const newCatalog = await catalogService.create(data);
            setCatalogs((prev) => [...prev, newCatalog]);
            return newCatalog;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create catalog');
            console.error('useCatalogs.createCatalog error:', err);
            return null;
        }
    }, []);

    // Update catalog
    const updateCatalog = useCallback(async (id: string, data: UpdateCatalogDTO): Promise<Catalog | null> => {
        try {
            setError(null);
            const updatedCatalog = await catalogService.update(id, data);
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

    // Delete catalog
    const deleteCatalog = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);
            await catalogService.delete(id);
            setCatalogs((prev) => prev.filter((catalog) => catalog.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete catalog';
            setError(message);
            console.error('useCatalogs.deleteCatalog error:', err);
            throw err; // Re-throw to notify the UI about cascade delete issues
        }
    }, []);

    // Get rolls count
    const getRollsCount = useCallback(async (catalogId: string): Promise<number> => {
        try {
            return await catalogService.getRollsCount(catalogId);
        } catch (err) {
            console.error('useCatalogs.getRollsCount error:', err);
            return 0;
        }
    }, []);

    // Check code uniqueness
    const isCodeUnique = useCallback(async (code: string, excludeId?: string): Promise<boolean> => {
        try {
            return await catalogService.isCodeUnique(code, excludeId);
        } catch (err) {
            console.error('useCatalogs.isCodeUnique error:', err);
            return false;
        }
    }, []);

    // Load on mount
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
        getRollsCount,
        isCodeUnique,
    };
}
