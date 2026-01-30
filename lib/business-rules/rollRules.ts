/**
 * Business Rules - Roll Management
 * Enforces business logic for roll operations
 */

import type { Roll, RollStatus, CreateRollDTO, UpdateRollDTO } from '@/lib/electron-api';
import { BusinessError, ConflictError } from '@/lib/errors';

/**
 * Valid roll status transitions
 * Represents the allowed state machine transitions
 */
const VALID_TRANSITIONS: Record<RollStatus, RollStatus[]> = {
    in_stock: ['reserved', 'sold'],
    reserved: ['in_stock', 'sold'], // Can cancel reservation
    sold: [], // Final state - no transitions allowed
};

/**
 * Validate a roll status transition
 * @throws BusinessError if transition is invalid
 */
export function validateStatusTransition(from: RollStatus, to: RollStatus): void {
    if (from === to) {
        return; // Same status is always valid
    }

    const allowedTransitions = VALID_TRANSITIONS[from];

    if (!allowedTransitions.includes(to)) {
        throw new BusinessError(
            `Invalid status transition from "${from}" to "${to}". Allowed transitions from "${from}": ${allowedTransitions.join(', ') || 'none (final state)'}`,
            'INVALID_STATUS_TRANSITION',
            { from, to, allowed: allowedTransitions }
        );
    }
}

/**
 * Check if a status is a final state (no further transitions)
 */
export function isFinalStatus(status: RollStatus): boolean {
    return VALID_TRANSITIONS[status].length === 0;
}

/**
 * Get allowed next statuses for a given current status
 */
export function getAllowedTransitions(status: RollStatus): RollStatus[] {
    return VALID_TRANSITIONS[status];
}

/**
 * Barcode reuse policy validation
 * Barcodes can be reassigned to new rolls ONLY if the previous roll is sold
 */
export async function validateBarcodeAvailable(
    barcode: string,
    existingRolls: Roll[],
    excludeRollId?: string
): Promise<void> {
    // Find rolls with this barcode
    const rollsWithBarcode = existingRolls.filter(r =>
        r.barcode === barcode && r.id !== excludeRollId
    );

    if (rollsWithBarcode.length === 0) {
        return; // Barcode not in use
    }

    // Check if any active (non-sold) rolls use this barcode
    const activeRollWithBarcode = rollsWithBarcode.find(r => r.status !== 'sold');

    if (activeRollWithBarcode) {
        throw new ConflictError(
            `Barcode "${barcode}" is already in use on an active roll (ID: ${activeRollWithBarcode.id}, Status: ${activeRollWithBarcode.status})`
        );
    }

    // Barcode exists but only on sold rolls - this is allowed
}

/**
 * Validate roll creation data
 */
export function validateRollCreate(data: CreateRollDTO): void {
    // Validate length
    if (data.lengthMeters <= 0) {
        throw new BusinessError(
            'Roll length must be greater than 0',
            'INVALID_LENGTH'
        );
    }

    if (data.lengthMeters > 1000) {
        throw new BusinessError(
            'Roll length cannot exceed 1000 meters',
            'LENGTH_TOO_LARGE',
            { maxLength: 1000, provided: data.lengthMeters }
        );
    }

    // Validate barcode format
    if (data.barcode.trim().length < 3) {
        throw new BusinessError(
            'Barcode must be at least 3 characters long',
            'INVALID_BARCODE'
        );
    }
}

/**
 * Validate roll update data
 */
export function validateRollUpdate(
    currentRoll: Roll,
    updates: UpdateRollDTO
): void {
    // If status is being updated, validate transition
    if (updates.status && updates.status !== currentRoll.status) {
        validateStatusTransition(currentRoll.status, updates.status);
    }

    // Validate length if being updated
    if (updates.lengthMeters !== undefined) {
        if (updates.lengthMeters <= 0) {
            throw new BusinessError(
                'Roll length must be greater than 0',
                'INVALID_LENGTH'
            );
        }

        if (updates.lengthMeters > 1000) {
            throw new BusinessError(
                'Roll length cannot exceed 1000 meters',
                'LENGTH_TOO_LARGE'
            );
        }
    }

    // Prevent editing sold rolls (except for specific allowed changes)
    if (currentRoll.status === 'sold') {
        const allowedFields = ['location']; // Only location can be updated for sold rolls
        const updatedFields = Object.keys(updates);
        const invalidFields = updatedFields.filter(f => !allowedFields.includes(f));

        if (invalidFields.length > 0) {
            throw new BusinessError(
                'Cannot modify sold rolls except for location',
                'CANNOT_MODIFY_SOLD_ROLL',
                { invalidFields, allowedFields }
            );
        }
    }
}

/**
 * Check if a roll can be deleted
 */
export function validateRollDelete(roll: Roll): void {
    // Prevent deletion of rolls that are reserved or in other critical states
    // For now, all rolls can be deleted (soft delete)
    // In future, might add restrictions based on business need
}

/**
 * Calculate roll statistics for validation
 */
export function calculateRollStats(rolls: Roll[]): {
    total: number;
    byStatus: Record<RollStatus, number>;
    byCatalog: Record<string, number>;
} {
    const byStatus: Record<RollStatus, number> = {
        in_stock: 0,
        reserved: 0,
        sold: 0,
    };

    const byCatalog: Record<string, number> = {};

    for (const roll of rolls) {
        byStatus[roll.status]++;
        byCatalog[roll.catalogId] = (byCatalog[roll.catalogId] || 0) + 1;
    }

    return {
        total: rolls.length,
        byStatus,
        byCatalog,
    };
}
