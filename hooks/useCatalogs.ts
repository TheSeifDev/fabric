/**
 * useCatalogs Hook
 * React hook for managing catalog data and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllCatalogs, getCatalogById, createCatalog as createCatalogAPI, updateCatalog as updateCatalogAPI, deleteCatalog as deleteCatalogAPI } from '@/lib/api/catalogs';
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
            const data = await getAllCatalogs();
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
            return await getCatalogById(id);
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
            const newCatalog = await createCatalogAPI(data);
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
            const updatedCatalog = await updateCatalogAPI(id, data);
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
            await deleteCatalogAPI(id);
            setCatalogs((prev) => prev.filter((catalog) => catalog.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete catalog';
            setError(message);
            console.error('useCatalogs.deleteCatalog error:', err);
            throw err; // Re-throw to notify the UI about cascade delete issues
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
    };
}
