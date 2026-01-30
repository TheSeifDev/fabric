/**
 * Example: Roll List with Empty States
 * Demonstrates empty state usage in list components
 */

'use client';

import { useEffect, useState } from 'react';
import { useRollStore } from '@/stores';
import { SkeletonList } from '@/components/ui/Skeleton';
import {
    EmptyRollsState,
    EmptySearchState,
    EmptyFilteredState,
    ErrorState,
} from '@/components/ui/EmptyState';
import type { RollFilters } from '@/lib/electron-api';

export function RollListWithEmptyStates() {
    const { rolls, loading, error, filters, fetchRolls, setFilters, clearFilters } = useRollStore();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRolls().finally(() => setIsInitialLoad(false));
    }, [fetchRolls]);

    const handleAddRoll = () => {
        console.log('Navigate to add roll form');
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setFilters({ ...filters, search: undefined });
    };

    const handleClearFilters = () => {
        clearFilters();
        setSearchQuery('');
    };

    const handleRetry = () => {
        fetchRolls();
    };

    // Initial loading state
    if (isInitialLoad) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Rolls</h1>
                <SkeletonList items={8} />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Rolls</h1>
                <ErrorState onRetry={handleRetry} />
            </div>
        );
    }

    // Empty state - no rolls at all
    if (rolls.length === 0 && !searchQuery && !hasActiveFilters(filters)) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Rolls</h1>
                <EmptyRollsState onAddRoll={handleAddRoll} />
            </div>
        );
    }

    // Empty search results
    if (rolls.length === 0 && searchQuery) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Rolls</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search rolls..."
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
                <EmptySearchState searchQuery={searchQuery} onClear={handleClearSearch} />
            </div>
        );
    }

    // Empty filtered results
    if (rolls.length === 0 && hasActiveFilters(filters)) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Rolls</h1>
                <FilterBar filters={filters} onFilterChange={setFilters} />
                <EmptyFilteredState onClearFilters={handleClearFilters} />
            </div>
        );
    }

    // Normal list with results
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Rolls</h1>
                <button
                    onClick={handleAddRoll}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    + Add Roll
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rolls..."
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>

            <FilterBar filters={filters} onFilterChange={setFilters} />

            <div className="space-y-3 mt-6">
                {rolls.map((roll) => (
                    <div
                        key={roll.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-mono font-semibold">{roll.barcode}</div>
                                <div className="text-sm text-gray-600">
                                    {roll.color} • {roll.degree} • {roll.lengthMeters}m
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded text-sm font-medium ${roll.status === 'in_stock'
                                        ? 'bg-green-100 text-green-800'
                                        : roll.status === 'reserved'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {roll.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper function
function hasActiveFilters(filters: RollFilters): boolean {
    return !!(filters.catalog || filters.color || filters.degree || filters.status);
}

// Placeholder filter bar component
function FilterBar({
    filters,
    onFilterChange,
}: {
    filters: RollFilters;
    onFilterChange: (filters: RollFilters) => void;
}) {
    return (
        <div className="flex gap-2">
            {filters.status && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded">
                    Status: {filters.status}
                    <button onClick={() => onFilterChange({ ...filters, status: undefined })}>×</button>
                </span>
            )}
            {filters.color && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded">
                    Color: {filters.color}
                    <button onClick={() => onFilterChange({ ...filters, color: undefined })}>×</button>
                </span>
            )}
        </div>
    );
}
