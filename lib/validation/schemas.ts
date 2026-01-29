/**
 * Zod Validation Schemas
 * Centralized validation for all forms in the application
 */

import { z } from 'zod';

// ==================== ROLL SCHEMAS ====================

export const createRollSchema = z.object({
    barcode: z.string()
        .min(1, 'Barcode is required')
        .max(50, 'Barcode too long')
        .regex(/^[A-Z0-9-]+$/i, 'Barcode can only contain letters, numbers, and hyphens'),

    catalogId: z.string()
        .min(1, 'Catalog is required')
        .uuid('Invalid catalog ID'),

    color: z.string()
        .min(1, 'Color is required')
        .max(50, 'Color name too long'),

    degree: z.enum(['A', 'B', 'C'], {
        errorMap: () => ({ message: 'Degree must be A, B, or C' }),
    }),

    lengthMeters: z.coerce.number()
        .positive('Length must be positive')
        .max(10000, 'Length too large'),

    location: z.string()
        .max(20, 'Location too long')
        .optional()
        .nullable(),
});

export const updateRollSchema = createRollSchema.partial();

// ==================== CATALOG SCHEMAS ====================

export const createCatalogSchema = z.object({
    code: z.string()
        .min(1, 'Catalog code is required')
        .max(20, 'Code too long')
        .regex(/^[A-Z0-9-]+$/i, 'Code can only contain letters, numbers, and hyphens'),

    name: z.string()
        .min(1, 'Catalog name is required')
        .max(100, 'Name too long'),

    material: z.string()
        .min(1, 'Material is required')
        .max(50, 'Material name too long'),

    description: z.string()
        .max(500, 'Description too long')
        .optional()
        .nullable(),

    status: z.enum(['active', 'archived', 'draft'], {
        errorMap: () => ({ message: 'Invalid status' }),
    }).default('active'),
});

export const updateCatalogSchema = createCatalogSchema.partial();

// ==================== USER SCHEMAS ====================

export const createUserSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(255, 'Email too long')
        .toLowerCase(),

    role: z.enum(['admin', 'storekeeper', 'viewer'], {
        errorMap: () => ({ message: 'Invalid role' }),
    }),

    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),

    status: z.enum(['active', 'inactive'], {
        errorMap: () => ({ message: 'Invalid status' }),
    }).default('active'),
});

export const updateUserSchema = createUserSchema
    .omit({ password: true })
    .partial();

export const updatePasswordSchema = z.object({
    oldPassword: z.string()
        .min(1, 'Current password is required'),

    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z.string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format'),

    password: z.string()
        .min(1, 'Password is required'),
});

// ==================== PROFILE SCHEMAS ====================

export const updateProfileSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name too long'),

    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(255, 'Email too long'),
});

// ==================== TYPE EXPORTS ====================

export type CreateRollInput = z.infer<typeof createRollSchema>;
export type UpdateRollInput = z.infer<typeof updateRollSchema>;
export type CreateCatalogInput = z.infer<typeof createCatalogSchema>;
export type UpdateCatalogInput = z.infer<typeof updateCatalogSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
