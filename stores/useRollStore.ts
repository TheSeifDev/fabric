/**
 * Roll Store - Zustand
 * Centralized state management for rolls with optimistic updates
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Roll, CreateRollDTO, UpdateRollDTO, RollFilters } from '@/lib/electron-api';
import { rollService } from '@/lib/services/RollService';

interface RollStore {
    // State
    rolls: Roll[];
    loading: boolean;
    error: string | null;
    filters: RollFilters;

    // Actions
    fetchRolls: () => Promise<void>;
    createRoll: (data: CreateRollDTO) => Promise<Roll>;
    updateRoll: (id: string, data: UpdateRollDTO) => Promise<Roll>;
    deleteRoll: (id: string) => Promise<void>;
    setFilters: (filters: Partial<RollFilters>) => void;
    clearFilters: () => void;

    // Selectors
    getRollById: (id: string) => Roll | undefined;
    getRollsByStatus: (status: Roll['status']) => Roll[];
    getRollsByCatalog: (catalogId: string) => Roll[];
}

// rollService imported from service file

const initialFilters: RollFilters = {
    search: '',
    catalog: undefined,
    color: undefined,
    degree: undefined,
    status: undefined,
};

export const useRollStore = create<RollStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            rolls: [],
            loading: false,
            error: null,
            filters: initialFilters,

            // Fetch all rolls
            fetchRolls: async () => {
                set({ loading: true, error: null });
                try {
                    const rolls = await rollService.getAll();
                    set({ rolls, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch rolls',
                        loading: false
                    });
                }
            },

            // Create roll with optimistic update
            createRoll: async (data: CreateRollDTO) => {
                set({ loading: true, error: null });

                try {
                    const newRoll = await rollService.create(data);

                    set(state => ({
                        rolls: [...state.rolls, newRoll],
                        loading: false,
                    }));

                    return newRoll;
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to create roll',
                        loading: false
                    });
                    throw error;
                }
            },

            // Update roll with optimistic update and rollback
            updateRoll: async (id: string, data: UpdateRollDTO) => {
                const rollIndex = get().rolls.findIndex(r => r.id === id);
                if (rollIndex === -1) {
                    throw new Error('Roll not found');
                }

                const originalRoll = get().rolls[rollIndex];

                // Optimistic update
                set(state => ({
                    rolls: state.rolls.map(r =>
                        r.id === id ? { ...r, ...data } : r
                    ),
                    loading: true,
                    error: null,
                }));

                try {
                    const updated = await rollService.update(id, data);

                    // Confirm with server response
                    set(state => ({
                        rolls: state.rolls.map(r => r.id === id ? updated : r),
                        loading: false,
                    }));

                    return updated;
                } catch (error) {
                    // Rollback on error
                    set(state => ({
                        rolls: state.rolls.map(r => r.id === id ? originalRoll : r),
                        error: error instanceof Error ? error.message : 'Failed to update roll',
                        loading: false,
                    }));
                    throw error;
                }
            },

            // Delete roll with optimistic update and rollback
            deleteRoll: async (id: string) => {
                const rollToDelete = get().rolls.find(r => r.id === id);
                if (!rollToDelete) {
                    throw new Error('Roll not found');
                }

                // Optimistic delete
                set(state => ({
                    rolls: state.rolls.filter(r => r.id !== id),
                    loading: true,
                    error: null,
                }));

                try {
                    await rollService.delete(id);
                    set({ loading: false });
                } catch (error) {
                    // Rollback on error
                    set(state => ({
                        rolls: [...state.rolls, rollToDelete],
                        error: error instanceof Error ? error.message : 'Failed to delete roll',
                        loading: false,
                    }));
                    throw error;
                }
            },

            // Set filters
            setFilters: (newFilters: Partial<RollFilters>) => {
                set(state => ({
                    filters: { ...state.filters, ...newFilters }
                }));
            },

            // Clear filters
            clearFilters: () => {
                set({ filters: initialFilters });
            },

            // Selectors
            getRollById: (id: string) => {
                return get().rolls.find(r => r.id === id);
            },

            getRollsByStatus: (status: Roll['status']) => {
                return get().rolls.filter(r => r.status === status);
            },

            getRollsByCatalog: (catalogId: string) => {
                return get().rolls.filter(r => r.catalogId === catalogId);
            },
        }),
        { name: 'RollStore' }
    )
);
