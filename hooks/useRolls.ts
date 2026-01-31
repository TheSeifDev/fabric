/**
 * useRolls Hook
 * React hook for managing roll data and operations
 * Supports both Electron (IPC) and Web (HTTP API) modes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllRolls, createRoll as createRollAPI, updateRoll as updateRollAPI, deleteRoll as deleteRollAPI } from '@/lib/api/rolls';
import type { Roll, CreateRollDTO, UpdateRollDTO, RollFilters } from '@/lib/electron-api.d';

// Helper to check if running in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

export function useRolls(initialFilters?: RollFilters) {
    const [rolls, setRolls] = useState<Roll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load rolls - Electron IPC or Web API
    const loadRolls = useCallback(async (filters?: RollFilters) => {
        try {
            setLoading(true);
            setError(null);

            let data: Roll[];
            if (isElectron) {
                // Electron mode: use IPC
                const result = await (window as any).electronAPI.rolls.getAll(filters);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to load rolls');
                }
                data = result.data;
            } else {
                // Web mode: use HTTP API
                data = await getAllRolls(filters);
            }

            setRolls(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load rolls');
            console.error('useRolls.loadRolls error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create roll - Electron IPC or Web API
    const createRoll = useCallback(async (data: CreateRollDTO): Promise<Roll | null> => {
        try {
            setError(null);

            let newRoll: Roll;
            if (isElectron) {
                const result = await (window as any).electronAPI.rolls.create(data);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to create roll');
                }
                newRoll = result.data;
            } else {
                newRoll = await createRollAPI(data);
            }

            setRolls((prev) => [...prev, newRoll]);
            return newRoll;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create roll');
            console.error('useRolls.createRoll error:', err);
            return null;
        }
    }, []);

    // Update roll - Electron IPC or Web API
    const updateRoll = useCallback(async (id: string, data: UpdateRollDTO): Promise<Roll | null> => {
        try {
            setError(null);

            let updatedRoll: Roll;
            if (isElectron) {
                const result = await (window as any).electronAPI.rolls.update(id, data);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to update roll');
                }
                updatedRoll = result.data;
            } else {
                updatedRoll = await updateRollAPI(id, data);
            }

            setRolls((prev) =>
                prev.map((roll) => (roll.id === id ? updatedRoll : roll))
            );
            return updatedRoll;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update roll');
            console.error('useRolls.updateRoll error:', err);
            return null;
        }
    }, []);

    // Delete roll - Electron IPC or Web API
    const deleteRoll = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);

            if (isElectron) {
                const result = await (window as any).electronAPI.rolls.delete(id);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to delete roll');
                }
            } else {
                await deleteRollAPI(id);
            }

            setRolls((prev) => prev.filter((roll) => roll.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete roll');
            console.error('useRolls.deleteRoll error:', err);
            return false;
        }
    }, []);

    // Search rolls - using filters instead
    const searchRolls = useCallback(async (query: string) => {
        await loadRolls({ search: query });
    }, [loadRolls]);

    // Load rolls on mount
    useEffect(() => {
        loadRolls(initialFilters);
    }, [loadRolls, initialFilters]);

    return {
        rolls,
        loading,
        error,
        loadRolls,
        createRoll,
        updateRoll,
        deleteRoll,
        searchRolls,
    };
}
