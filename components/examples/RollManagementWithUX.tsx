/**
 * Example: Roll Management with Loading States & Toasts
 * Demonstrates skeleton loading and toast notifications
 */

'use client';

import { useEffect, useState } from 'react';
import { useRollStore } from '@/stores';
import { SkeletonList, SkeletonTable, Spinner } from '@/components/ui/Skeleton';
import { showSuccess, showError, showUndo, showPromise } from '@/lib/utils/toast';
import type { CreateRollDTO, UpdateRollDTO, RollStatus } from '@/lib/electron-api';

export function RollManagementWithUX() {
    const { rolls, loading, error, fetchRolls, createRoll, updateRoll, deleteRoll } = useRollStore();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRolls().finally(() => setIsInitialLoad(false));
    }, [fetchRolls]);

    const handleCreate = async (data: CreateRollDTO) => {
        setSubmitting(true);

        try {
            // Use promise toast for automatic loading/success/error states
            await showPromise(
                createRoll(data),
                {
                    loading: 'Creating roll...',
                    success: (roll) => `Roll ${roll.barcode} created successfully!`,
                    error: (error) => `Failed to create roll: ${error.message}`,
                }
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id: string, data: UpdateRollDTO) => {
        try {
            await updateRoll(id, data);
            showSuccess('Roll updated successfully');
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Update failed');
        }
    };

    const handleDelete = async (id: string) => {
        const rollToDelete = rolls.find(r => r.id === id);
        if (!rollToDelete) return;

        try {
            await deleteRoll(id);

            // Show undo toast
            showUndo(
                `Roll ${rollToDelete.barcode} deleted`,
                async () => {
                    // Undo deletion by recreating the roll
                    try {
                        await createRoll({
                            barcode: rollToDelete.barcode,
                            catalogId: rollToDelete.catalogId,
                            color: rollToDelete.color,
                            degree: rollToDelete.degree,
                            lengthMeters: rollToDelete.lengthMeters,
                            location: rollToDelete.location || undefined,
                            status: rollToDelete.status,
                        });
                        showSuccess('Roll restored');
                    } catch (error) {
                        showError('Failed to restore roll');
                    }
                }
            );
        } catch (error) {
            showError('Failed to delete roll');
        }
    };

    const handleStatusChange = async (id: string, newStatus: RollStatus) => {
        try {
            await updateRoll(id, { status: newStatus });
            showSuccess(`Status updated to ${newStatus}`);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Status update failed');
        }
    };

    // Show skeleton on initial load
    if (isInitialLoad) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Roll Management</h1>
                    <p className="text-gray-600">Loading rolls...</p>
                </div>
                <SkeletonList items={8} />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Roll Management</h1>
                    <p className="text-gray-600">{rolls.length} rolls in inventory</p>
                </div>
                <button
                    onClick={() => {
                        // Example: show create form modal
                        showSuccess('Create form would open here');
                    }}
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                    {submitting && <Spinner size="sm" />}
                    Add Roll
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
                    {error}
                </div>
            )}

            {/* Roll List */}
            <div className="space-y-3">
                {rolls.map((roll) => (
                    <div
                        key={roll.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <div>
                            <div className="font-mono font-semibold">{roll.barcode}</div>
                            <div className="text-sm text-gray-600">
                                {roll.color} • {roll.degree} • {roll.lengthMeters}m
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded text-sm font-medium ${roll.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                                roll.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {roll.status}
                            </span>
                            <button
                                onClick={() => handleDelete(roll.id)}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <Spinner size="sm" className="border-white border-t-blue-200" />
                    <span>Syncing...</span>
                </div>
            )}
        </div>
    );
}
