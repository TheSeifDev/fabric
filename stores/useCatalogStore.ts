/**
 * Catalog Store - Zustand
 * Centralized state management for catalogs
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO } from '@/lib/electron-api';
import { catalogService } from '@/lib/services/CatalogService';

interface CatalogStore {
    // State
    catalogs: Catalog[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchCatalogs: () => Promise<void>;
    createCatalog: (data: CreateCatalogDTO) => Promise<Catalog>;
    updateCatalog: (id: string, data: UpdateCatalogDTO) => Promise<Catalog>;
    deleteCatalog: (id: string) => Promise<void>;

    // Selectors
    getCatalogById: (id: string) => Catalog | undefined;
    getActiveCatalogs: () => Catalog[];
}

// catalogService imported from service file

export const useCatalogStore = create<CatalogStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            catalogs: [],
            loading: false,
            error: null,

            // Fetch all catalogs
            fetchCatalogs: async () => {
                set({ loading: true, error: null });
                try {
                    const catalogs = await catalogService.getAll();
                    set({ catalogs, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch catalogs',
                        loading: false
                    });
                }
            },

            // Create catalog
            createCatalog: async (data: CreateCatalogDTO) => {
                set({ loading: true, error: null });

                try {
                    const newCatalog = await catalogService.create(data);

                    set(state => ({
                        catalogs: [...state.catalogs, newCatalog],
                        loading: false,
                    }));

                    return newCatalog;
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to create catalog',
                        loading: false
                    });
                    throw error;
                }
            },

            // Update catalog with optimistic update
            updateCatalog: async (id: string, data: UpdateCatalogDTO) => {
                const catalogIndex = get().catalogs.findIndex(c => c.id === id);
                if (catalogIndex === -1) {
                    throw new Error('Catalog not found');
                }

                const originalCatalog = get().catalogs[catalogIndex];

                // Optimistic update
                set(state => ({
                    catalogs: state.catalogs.map(c =>
                        c.id === id ? { ...c, ...data } : c
                    ),
                    loading: true,
                    error: null,
                }));

                try {
                    const updated = await catalogService.update(id, data);

                    set(state => ({
                        catalogs: state.catalogs.map(c => c.id === id ? updated : c),
                        loading: false,
                    }));

                    return updated;
                } catch (error) {
                    // Rollback
                    set(state => ({
                        catalogs: state.catalogs.map(c => c.id === id ? originalCatalog : c),
                        error: error instanceof Error ? error.message : 'Failed to update catalog',
                        loading: false,
                    }));
                    throw error;
                }
            },

            // Delete catalog
            deleteCatalog: async (id: string) => {
                const catalogToDelete = get().catalogs.find(c => c.id === id);
                if (!catalogToDelete) {
                    throw new Error('Catalog not found');
                }

                // Optimistic delete
                set(state => ({
                    catalogs: state.catalogs.filter(c => c.id !== id),
                    loading: true,
                    error: null,
                }));

                try {
                    await catalogService.delete(id);
                    set({ loading: false });
                } catch (error) {
                    // Rollback
                    set(state => ({
                        catalogs: [...state.catalogs, catalogToDelete],
                        error: error instanceof Error ? error.message : 'Failed to delete catalog',
                        loading: false,
                    }));
                    throw error;
                }
            },

            // Selectors
            getCatalogById: (id: string) => {
                return get().catalogs.find(c => c.id === id);
            },

            getActiveCatalogs: () => {
                return get().catalogs.filter(c => c.status === 'active');
            },
        }),
        { name: 'CatalogStore' }
    )
);
