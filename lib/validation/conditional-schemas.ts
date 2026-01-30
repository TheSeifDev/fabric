/**
 * Conditional Validation Schemas
 * Zod schemas that adapt based on context (user role, entity state, etc.)
 */

import { z } from 'zod';
import type { UserRole, RollStatus, CatalogStatus } from '@/lib/electron-api';

/**
 * Get user creation schema based on current user's role
 * Admins can create any role, non-admins cannot create admins
 */
export function getUserCreateSchema(currentUserRole: UserRole) {
    const baseSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        status: z.enum(['active', 'inactive']).default('active'),
    });

    // Role validation based on current user
    if (currentUserRole === 'admin') {
        return baseSchema.extend({
            role: z.enum(['admin', 'storekeeper', 'viewer']),
        });
    } else {
        // Non-admins can only create storekeeper or viewer
        return baseSchema.extend({
            role: z.enum(['storekeeper', 'viewer']),
        });
    }
}

/**
 * Get roll update schema based on current roll status
 * Sold rolls have restricted updates
 */
export function getRollUpdateSchema(currentStatus: RollStatus) {
    if (currentStatus === 'sold') {
        // Sold rolls can only update location
        return z.object({
            location: z.string().optional(),
        }).strict(); // Prevent any other fields
    }

    // All other statuses allow full updates
    return z.object({
        barcode: z.string().min(3).optional(),
        catalogId: z.string().uuid().optional(),
        color: z.string().min(1).optional(),
        degree: z.enum(['A', 'B', 'C']).optional(),
        lengthMeters: z.number().positive().max(1000).optional(),
        status: z.enum(['in_stock', 'reserved', 'sold']).optional(),
        location: z.string().optional(),
    });
}

/**
 * Get catalog update schema based on whether it has rolls
 */
export function getCatalogUpdateSchema(hasRolls: boolean, currentStatus: CatalogStatus) {
    const baseSchema = z.object({
        name: z.string().min(2).optional(),
        material: z.string().min(2).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
    });

    if (hasRolls) {
        // Cannot archive if has rolls
        return baseSchema.extend({
            status: z.enum(['active', 'draft']).optional(),
        });
    }

    // Can archive if no rolls
    return baseSchema.extend({
        status: z.enum(['active', 'archived', 'draft']).optional(),
    });
}

/**
 * Cross-field validation: Ensure length is within catalog constraints
 */
export function getRollCreateWithCatalogSchema() {
    return z.object({
        barcode: z.string().min(3, 'Barcode must be at least 3 characters'),
        catalogId: z.string().uuid('Invalid catalog ID'),
        color: z.string().min(1, 'Color is required'),
        degree: z.enum(['A', 'B', 'C']),
        lengthMeters: z.number()
            .positive('Length must be greater than 0')
            .max(1000, 'Length cannot exceed 1000 meters'),
        location: z.string().optional(),
        status: z.enum(['in_stock', 'reserved', 'sold']).default('in_stock'),
    });
    // Note: Cross-catalog validation (e.g., max length per catalog) would be done
    // in a separate refinement or in the service layer
}

/**
 * Date range validation schema
 * Ensures end date is after start date
 */
export function getDateRangeSchema() {
    return z.object({
        startDate: z.number().int().positive(),
        endDate: z.number().int().positive(),
    }).refine(
        (data) => data.endDate > data.startDate,
        {
            message: 'End date must be after start date',
            path: ['endDate'],
        }
    );
}

/**
 * Password change schema with confirmation
 */
export function getPasswordChangeSchema() {
    return z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain uppercase letter')
            .regex(/[a-z]/, 'Must contain lowercase letter')
            .regex(/[0-9]/, 'Must contain number'),
        confirmPassword: z.string(),
    }).refine(
        (data) => data.newPassword === data.confirmPassword,
        {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        }
    ).refine(
        (data) => data.newPassword !== data.currentPassword,
        {
            message: 'New password must be different from current password',
            path: ['newPassword'],
        }
    );
}

/**
 * Conditional required fields based on status
 * Example: Draft catalogs have optional fields, active ones require all fields
 */
export function getCatalogCreateSchema(isDraft: boolean = false) {
    if (isDraft) {
        return z.object({
            code: z.string().min(2),
            name: z.string().min(2),
            material: z.string().optional(),
            description: z.string().optional(),
            status: z.literal('draft'),
            image: z.string().optional(),
        });
    }

    return z.object({
        code: z.string().min(2).regex(/^[A-Za-z0-9-]+$/, 'Code can only contain letters, numbers, and hyphens'),
        name: z.string().min(2),
        material: z.string().min(2, 'Material is required for active catalogs'),
        description: z.string().optional(),
        status: z.enum(['active', 'draft']).default('active'),
        image: z.string().optional(),
    });
}

/**
 * Numerical range validation with conditional bounds
 */
export function getQuantitySchema(min: number = 0, max?: number) {
    let schema = z.number().int().min(min, `Must be at least ${min}`);

    if (max !== undefined) {
        schema = schema.max(max, `Cannot exceed ${max}`);
    }

    return schema;
}
