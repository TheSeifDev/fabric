/**
 * Example: Roll Management using Zustand Store
 * Shows CRUD operations with optimistic updates
 */

'use client';

import { useState } from 'react';
import { useRollStore } from '@/stores';
import type { CreateRollDTO } from '@/lib/electron-api';

export function RollManagementExample() {
    const {
        rolls,
        loading,
        error,
        createRoll,
        updateRoll,
        deleteRoll,
        getRollsByStatus
    } = useRollStore();

    const [formData, setFormData] = useState<CreateRollDTO>({
        barcode: '',
        catalogId: '',
        color: '',
        degree: 'A',
        lengthMeters: 0,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createRoll(formData);
            alert('Roll created successfully!');
            setFormData({
                barcode: '',
                catalogId: '',
                color: '',
                degree: 'A',
                lengthMeters: 0,
            });
        } catch (error) {
            console.error('Failed to create roll:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this roll?')) return;

        try {
            await deleteRoll(id);
            alert('Roll deleted successfully!');
        } catch (error) {
            console.error('Failed to delete roll:', error);
        }
    };

    const inStockRolls = getRollsByStatus('in_stock');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Roll Management</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Create Form */}
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold mb-4">Create New Roll</h3>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        placeholder="Barcode"
                        value={formData.barcode}
                        onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg"
                    />

                    <input
                        placeholder="Catalog ID"
                        value={formData.catalogId}
                        onChange={e => setFormData({ ...formData, catalogId: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg"
                    />

                    <input
                        placeholder="Color"
                        value={formData.color}
                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg"
                    />

                    <input
                        type="number"
                        placeholder="Length (meters)"
                        value={formData.lengthMeters}
                        onChange={e => setFormData({ ...formData, lengthMeters: Number(e.target.value) })}
                        className="px-4 py-2 border border-gray-200 rounded-lg"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Roll'}
                </button>
            </form>

            {/* Roll List */}
            <div className="bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold mb-4">
                    In Stock Rolls ({inStockRolls.length})
                </h3>

                <div className="space-y-2">
                    {inStockRolls.map(roll => (
                        <div key={roll.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <span className="font-medium">{roll.barcode}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                    {roll.color} - {roll.lengthMeters}m
                                </span>
                            </div>

                            <button
                                onClick={() => handleDelete(roll.id)}
                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    ))}

                    {inStockRolls.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No rolls in stock</p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-2xl font-bold">{rolls.length}</p>
                        <p className="text-sm text-gray-600">Total Rolls</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{inStockRolls.length}</p>
                        <p className="text-sm text-gray-600">In Stock</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{getRollsByStatus('sold').length}</p>
                        <p className="text-sm text-gray-600">Sold</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
