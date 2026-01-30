/**
 * Example: Dashboard Stats using Zustand Stores
 * Demonstrates how to use the new Zustand stores in components
 */

'use client';

import { useEffect } from 'react';
import { useRollStore, useCatalogStore, useAuthStore } from '@/stores';

export function DashboardStats() {
    const { rolls, loading: rollsLoading, fetchRolls } = useRollStore();
    const { catalogs, loading: catalogsLoading, fetchCatalogs } = useCatalogStore();
    const { user, isAuthenticated } = useAuthStore();

    // Fetch data on mount
    useEffect(() => {
        if (isAuthenticated()) {
            fetchRolls();
            fetchCatalogs();
        }
    }, [fetchRolls, fetchCatalogs, isAuthenticated]);

    // Calculate stats using store data
    const stats = {
        totalRolls: rolls.length,
        inStock: rolls.filter(r => r.status === 'in_stock').length,
        reserved: rolls.filter(r => r.status === 'reserved').length,
        sold: rolls.filter(r => r.status === 'sold').length,
        totalCatalogs: catalogs.length,
        activeCatalogs: catalogs.filter(c => c.status === 'active').length,
    };

    if (!isAuthenticated()) {
        return <div>Please log in</div>;
    }

    if (rollsLoading || catalogsLoading) {
        return <div>Loading stats...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                title="Total Rolls"
                value={stats.totalRolls}
                subtitle={`${stats.inStock} in stock`}
            />
            <StatCard
                title="Reserved"
                value={stats.reserved}
                subtitle="Pending sale"
            />
            <StatCard
                title="Catalogs"
                value={stats.activeCatalogs}
                subtitle={`${stats.totalCatalogs} total`}
            />
        </div>
    );
}

function StatCard({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
    );
}
