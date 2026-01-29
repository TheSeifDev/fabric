/**
 * useRolls Hook
 * React hook for managing roll data and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { rollService } from '@/lib/services/RollService';
import type { Roll, CreateRollDTO, UpdateRollDTO, RollFilters } from '@/lib/electron-api.d';

export function useRolls(initialFilters?: RollFilters) {
    const [rolls, setRolls] = useState<Roll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load rolls
    const loadRolls = useCallback(async (filters?: RollFilters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await rollService.getAll(filters);
            setRolls(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load rolls');
            console.error('useRolls.loadRolls error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create roll
    const createRoll = useCallback(async (data: CreateRollDTO): Promise<Roll | null> => {
        try {
            setError(null);
            const newRoll = await rollService.create(data);
            setRolls((prev) => [...prev, newRoll]);
            return newRoll;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create roll');
            console.error('useRolls.createRoll error:', err);
            return null;
        }
    }, []);

    // Update roll
    const updateRoll = useCallback(async (id: string, data: UpdateRollDTO): Promise<Roll | null> => {
        try {
            setError(null);
            const updatedRoll = await rollService.update(id, data);
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

    // Delete roll
    const deleteRoll = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);
            await rollService.delete(id);
            setRolls((prev) => prev.filter((roll) => roll.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete roll');
            console.error('useRolls.deleteRoll error:', err);
            return false;
        }
    }, []);

    // Search rolls
    const searchRolls = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await rollService.search(query);
            setRolls(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            console.error('useRolls.searchRolls error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Find by barcode
    const findByBarcode = useCallback(async (barcode: string): Promise<Roll | null> => {
        try {
            setError(null);
            return await rollService.findByBarcode(barcode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to find roll');
            console.error('useRolls.findByBarcode error:', err);
            return null;
        }
    }, []);

    // Check barcode uniqueness
    const isBarcodeUnique = useCallback(async (barcode: string, excludeId?: string): Promise<boolean> => {
        try {
            return await rollService.isBarcodeUnique(barcode, excludeId);
        } catch (err) {
            console.error('useRolls.isBarcodeUnique error:', err);
            return false;
        }
    }, []);

    // Load on mount
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
        findByBarcode,
        isBarcodeUnique,
    };
}
