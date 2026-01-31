/**
 * Business Rules and Validation Logic
 * Centralized business rule enforcement for the Fabric Inventory System
 */

import type { CreateRollDTO, UpdateRollDTO, CreateCatalogDTO, UpdateCatalogDTO, CreateUserDTO, UpdateUserDTO } from './electron-api.d';
import { ValidationError, BusinessError, ConflictError } from './errors';

// ============================================
// ROLL BUSINESS RULES
// ============================================

/**
 * Roll Status Lifecycle:
 * in_stock → reserved → sold
 * in_stock → sold (direct sale)
 * reserved → in_stock (cancel reservation)
 * sold is final (no transitions allowed)
 */
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
    'in_stock': ['reserved', 'sold'],
    'reserved': ['in_stock', 'sold'],
    'sold': [], // Final state - no transitions allowed
};

/**
 * Validate roll creation data
 */
export function validateRollCreate(data: CreateRollDTO): void {
    // Barcode validation
    if (!data.barcode || data.barcode.trim().length === 0) {
        throw new ValidationError('Barcode is required', 'barcode');
    }

    if (data.barcode.length < 3 || data.barcode.length > 50) {
        throw new ValidationError('Barcode must be between 3 and 50 characters', 'barcode');
    }

    // Catalog validation
    if (!data.catalogId || data.catalogId.trim().length === 0) {
        throw new ValidationError('Catalog is required', 'catalogId');
    }

    // Color validation
    if (!data.color || data.color.trim().length === 0) {
        throw new ValidationError('Color is required', 'color');
    }

    if (data.color.length > 50) {
        throw new ValidationError('Color must be 50 characters or less', 'color');
    }

    // Degree validation
    if (!data.degree || !['A', 'B', 'C'].includes(data.degree)) {
        throw new ValidationError('Degree must be A, B, or C', 'degree');
    }

    // Length validation
    if (typeof data.lengthMeters !== 'number' || data.lengthMeters <= 0) {
        throw new ValidationError('Length must be a positive number', 'lengthMeters');
    }

    if (data.lengthMeters > 10000) {
        throw new ValidationError('Length cannot exceed 10,000 meters', 'lengthMeters');
    }

    // Location validation (optional)
    if (data.location && data.location.length > 100) {
        throw new ValidationError('Location must be 100 characters or less', 'location');
    }
}

/**
 * Validate roll update data
 */
export function validateRollUpdate(data: UpdateRollDTO): void {
    // Color validation
    if (data.color !== undefined) {
        if (!data.color || data.color.trim().length === 0) {
            throw new ValidationError('Color cannot be empty', 'color');
        }
        if (data.color.length > 50) {
            throw new ValidationError('Color must be 50 characters or less', 'color');
        }
    }

    // Degree validation
    if (data.degree !== undefined && !['A', 'B', 'C'].includes(data.degree)) {
        throw new ValidationError('Degree must be A, B, or C', 'degree');
    }

    // Length validation
    if (data.lengthMeters !== undefined) {
        if (typeof data.lengthMeters !== 'number' || data.lengthMeters <= 0) {
            throw new ValidationError('Length must be a positive number', 'lengthMeters');
        }
        if (data.lengthMeters > 10000) {
            throw new ValidationError('Length cannot exceed 10,000 meters', 'lengthMeters');
        }
    }

    // Location validation
    if (data.location !== undefined && data.location && data.location.length > 100) {
        throw new ValidationError('Location must be 100 characters or less', 'location');
    }

    // Status validation
    if (data.status !== undefined && !['in_stock', 'reserved', 'sold'].includes(data.status)) {
        throw new ValidationError('Invalid status', 'status');
    }
}

/**
 * Validate barcode is available for use
 * Barcode Reuse Policy: A barcode can only be reused if ALL previous rolls with that barcode are sold
 */
export function validateBarcodeAvailable(barcode: string, hasActiveRolls: boolean): void {
    if (hasActiveRolls) {
        throw new ConflictError(
            `Barcode "${barcode}" is already in use by an active roll. Barcodes can only be reused after the previous roll is sold.`,
            'barcode'
        );
    }
}

/**
 * Validate status transition is allowed
 * @param currentStatus - Current status of the roll
 * @param newStatus - Desired new status
 * @param rollId - Roll ID for error message
 */
export function validateStatusTransition(currentStatus: string, newStatus: string, rollId?: string): void {
    if (currentStatus === newStatus) {
        return; // No transition needed
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw new BusinessError(
            `Cannot transition roll from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedTransitions.join(', ') || 'none (final state)'}`,
            'INVALID_STATUS_TRANSITION',
            { rollId, currentStatus, newStatus, allowedTransitions }
        );
    }
}

/**
 * Validate roll can be deleted
 * Business rule: Can delete any roll except those with critical references
 */
export function validateRollDelete(rollId: string, status: string): void {
    // Allow deletion of any status - soft delete handles this
    // Could add additional business logic here if needed
}

// ============================================
// CATALOG BUSINESS RULES
// ============================================

/**
 * Validate catalog creation data
 */
export function validateCatalogCreate(data: CreateCatalogDTO): void {
    // Code validation
    if (!data.code || data.code.trim().length === 0) {
        throw new ValidationError('Catalog code is required', 'code');
    }

    if (data.code.length < 2 || data.code.length > 20) {
        throw new ValidationError('Catalog code must be between 2 and 20 characters', 'code');
    }

    // Code format: Only alphanumeric and hyphens
    if (!/^[A-Z0-9-]+$/.test(data.code)) {
        throw new ValidationError('Catalog code must contain only uppercase letters, numbers, and hyphens', 'code');
    }

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Catalog name is required', 'name');
    }

    if (data.name.length > 100) {
        throw new ValidationError('Catalog name must be 100 characters or less', 'name');
    }

    // Material validation
    if (!data.material || data.material.trim().length === 0) {
        throw new ValidationError('Material is required', 'material');
    }

    if (data.material.length > 50) {
        throw new ValidationError('Material must be 50 characters or less', 'material');
    }

    // Description validation (optional)
    if (data.description && data.description.length > 500) {
        throw new ValidationError('Description must be 500 characters or less', 'description');
    }

    // Status validation
    if (data.status && !['active', 'archived', 'draft'].includes(data.status)) {
        throw new ValidationError('Invalid status', 'status');
    }
}

/**
 * Validate catalog update data
 */
export function validateCatalogUpdate(data: UpdateCatalogDTO): void {
    // Note: Code is immutable - cannot be updated
    if ('code' in data) {
        throw new BusinessError('Catalog code cannot be changed after creation', 'IMMUTABLE_FIELD', { field: 'code' });
    }

    // Name validation
    if (data.name !== undefined) {
        if (!data.name || data.name.trim().length === 0) {
            throw new ValidationError('Catalog name cannot be empty', 'name');
        }
        if (data.name.length > 100) {
            throw new ValidationError('Catalog name must be 100 characters or less', 'name');
        }
    }

    // Material validation
    if (data.material !== undefined) {
        if (!data.material || data.material.trim().length === 0) {
            throw new ValidationError('Material cannot be empty', 'material');
        }
        if (data.material.length > 50) {
            throw new ValidationError('Material must be 50 characters or less', 'material');
        }
    }

    // Description validation
    if (data.description !== undefined && data.description && data.description.length > 500) {
        throw new ValidationError('Description must be 500 characters or less', 'description');
    }

    // Status validation
    if (data.status !== undefined && !['active', 'archived', 'draft'].includes(data.status)) {
        throw new ValidationError('Invalid status', 'status');
    }
}

/**
 * Validate catalog code is unique
 */
export function validateCatalogCodeUnique(code: string, exists: boolean): void {
    if (exists) {
        throw new ConflictError(`Catalog code "${code}" already exists`, 'code');
    }
}

/**
 * Validate catalog can be deleted
 * Business rule: Cannot delete catalog if it has active rolls
 */
export function validateCatalogDelete(catalogId: string, activeRollCount: number): void {
    if (activeRollCount > 0) {
        throw new BusinessError(
            `Cannot delete catalog with ${activeRollCount} active roll(s). Archive the catalog or delete its rolls first.`,
            'CATALOG_HAS_ROLLS',
            { catalogId, activeRollCount }
        );
    }
}

// ============================================
// USER BUSINESS RULES
// ============================================

/**
 * Validate user creation data
 */
export function validateUserCreate(data: CreateUserDTO): void {
    // Name validation
    if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Name is required', 'name');
    }

    if (data.name.length < 2 || data.name.length > 100) {
        throw new ValidationError('Name must be between 2 and 100 characters', 'name');
    }

    // Email validation
    if (!data.email || data.email.trim().length === 0) {
        throw new ValidationError('Email is required', 'email');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new ValidationError('Invalid email format', 'email');
    }

    if (data.email.length > 255) {
        throw new ValidationError('Email must be 255 characters or less', 'email');
    }

    // Password validation
    if (!data.password || data.password.length === 0) {
        throw new ValidationError('Password is required', 'password');
    }

    if (data.password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters', 'password');
    }

    if (data.password.length > 100) {
        throw new ValidationError('Password must be 100 characters or less', 'password');
    }

    // Role validation
    if (!data.role || !['admin', 'storekeeper', 'viewer'].includes(data.role)) {
        throw new ValidationError('Invalid role. Must be admin, storekeeper, or viewer', 'role');
    }

    // Status validation
    if (data.status && !['active', 'inactive'].includes(data.status)) {
        throw new ValidationError('Invalid status', 'status');
    }
}

/**
 * Validate user update data
 */
export function validateUserUpdate(data: UpdateUserDTO): void {
    // Name validation
    if (data.name !== undefined) {
        if (!data.name || data.name.trim().length === 0) {
            throw new ValidationError('Name cannot be empty', 'name');
        }
        if (data.name.length < 2 || data.name.length > 100) {
            throw new ValidationError('Name must be between 2 and 100 characters', 'name');
        }
    }

    // Email validation
    if (data.email !== undefined) {
        if (!data.email || data.email.trim().length === 0) {
            throw new ValidationError('Email cannot be empty', 'email');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new ValidationError('Invalid email format', 'email');
        }
        if (data.email.length > 255) {
            throw new ValidationError('Email must be 255 characters or less', 'email');
        }
    }

    // Password validation (if changing)
    // Note: Password updates handled separately through dedicated password change endpoint
    // if (data.password !== undefined) {
    //     if (data.password.length < 6) {
    //         throw new ValidationError('Password must be at least 6 characters', 'password');
    //     }
    //     if (data.password.length > 100) {
    //         throw new ValidationError('Password must be 100 characters or less', 'password');
    //     }
    // }

    // Role validation
    if (data.role !== undefined && !['admin', 'storekeeper', 'viewer'].includes(data.role)) {
        throw new ValidationError('Invalid role. Must be admin, storekeeper, or viewer', 'role');
    }

    // Status validation
    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
        throw new ValidationError('Invalid status', 'status');
    }
}

/**
 * Validate email is unique
 */
export function validateEmailUnique(email: string, exists: boolean): void {
    if (exists) {
        throw new ConflictError(`Email "${email}" is already in use`, 'email');
    }
}

/**
 * Validate user can be deleted
 * Business rule: Cannot delete user if they have created records (foreign key constraint)
 */
export function validateUserDelete(userId: string, hasCreatedRecords: boolean): void {
    if (hasCreatedRecords) {
        throw new BusinessError(
            'Cannot delete user who has created records. Deactivate the user instead.',
            'USER_HAS_RECORDS',
            { userId }
        );
    }
}
