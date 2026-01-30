/**
 * Optimistic Update Testing Example
 * Demonstrates optimistic UI updates with rollback on error
 */

'use client';

import { useState } from 'react';
import { useRollStore } from '@/stores';
import type { UpdateRollDTO, RollStatus } from '@/lib/electron-api';

export function OptimisticUpdateExample() {
    const { rolls, updateRoll, loading, error } = useRollStore();
    const [selectedRollId, setSelectedRollId] = useState<string | null>(null);
    const [simulateError, setSimulateError] = useState(false);

    const handleStatusChange = async (rollId: string, newStatus: RollStatus) => {
        try {
            // This will update optimistically and rollback if error occurs
            await updateRoll(rollId, { status: newStatus });
            console.log('✅ Optimistic update succeeded');
        } catch (error) {
            console.error('❌ Update failed, rolled back:', error);
        }
    };

    const handleLocationUpdate = async (rollId: string, newLocation: string) => {
        try {
            await updateRoll(rollId, { location: newLocation });
        } catch (error) {
            console.error('Location update failed:', error);
        }
    };

    const selectedRoll = rolls.find(r => r.id === selectedRollId);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Optimistic Updates Demo</h2>
                <p className="text-gray-600">
                    Updates happen instantly in the UI. If the server rejects the update, it automatically rolls back.
                </p>
            </div>

            {/* Error Simulation Toggle */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={simulateError}
                        onChange={(e) => setSimulateError(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="font-medium">Simulate Server Error (demonstrates rollback)</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                    When enabled, updates will appear to succeed but then roll back after a delay
                </p>
            </div>

            {/* Roll List */}
            <div className="mb-6">
                <h3 className="font-semibold mb-3">Select a Roll to Update:</h3>
                <div className="grid gap-2">
                    {rolls.slice(0, 5).map((roll) => (
                        <button
                            key={roll.id}
                            onClick={() => setSelectedRollId(roll.id)}
                            className={`p-3 border rounded-lg text-left transition-colors ${selectedRollId === roll.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-mono font-semibold">{roll.barcode}</span>
                                    <span className="text-sm text-gray-500 ml-3">{roll.color}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className={`px-2 py-1 rounded text-sm ${roll.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                                            roll.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {roll.status}
                                    </span>
                                    {roll.location && (
                                        <span className="text-sm text-gray-500">📍 {roll.location}</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Update Controls */}
            {selectedRoll && (
                <div className="p-6 border border-gray-200 rounded-lg bg-white">
                    <h3 className="font-semibold mb-4">Update Roll: {selectedRoll.barcode}</h3>

                    {/* Status Update */}
                    <div className="mb-6">
                        <label className="block font-medium mb-2">Change Status:</label>
                        <p className="text-sm text-gray-500 mb-3">
                            ⚡ Updates happen instantly. Watch the UI respond immediately!
                        </p>
                        <div className="flex gap-2">
                            {(['in_stock', 'reserved', 'sold'] as RollStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(selectedRoll.id, status)}
                                    disabled={selectedRoll.status === status || loading}
                                    className={`px-4 py-2 rounded font-medium transition-all ${selectedRoll.status === status
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                                        } ${loading ? 'opacity-50' : ''}`}
                                >
                                    {status.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location Update */}
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Update Location:</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                defaultValue={selectedRoll.location || ''}
                                placeholder="Enter new location"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleLocationUpdate(selectedRoll.id, e.currentTarget.value);
                                    }
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    handleLocationUpdate(selectedRoll.id, input.value);
                                }}
                                disabled={loading}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Update
                            </button>
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-semibold mb-2">How Optimistic Updates Work:</h4>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                            <li>Click a button → UI updates <strong>immediately</strong></li>
                            <li>Request sent to server in background</li>
                            <li>If server confirms → change persists</li>
                            <li>If server rejects → UI automatically <strong>rolls back</strong></li>
                        </ol>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing with server...</span>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
                    <div className="flex items-start gap-2">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <div className="font-semibold">Update Failed</div>
                            <div className="text-sm opacity-90">{error}</div>
                            <div className="text-xs mt-1 opacity-75">Changes have been rolled back</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
