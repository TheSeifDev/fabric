/**
 * Custom Error Classes for Fabric Inventory Management System
 * Centralized error handling with type-safe error types
 */

// ============================================
// BASE ERROR CLASSES
// ============================================

/**
 * Base application error with code and metadata support
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly metadata?: Record<string, unknown>;

    constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        metadata?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.metadata = metadata;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Serialize error for logging or transmission
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            metadata: this.metadata,
            stack: this.stack,
        };
    }
}

// ============================================
// SPECIFIC ERROR TYPES
// ============================================

/**
 * Database-related errors
 */
export class DatabaseError extends AppError {
    constructor(message: string, code: string = 'DB_ERROR', metadata?: Record<string, unknown>) {
        super(message, code, 500, true, metadata);
    }
}

/**
 * Validation errors for form inputs
 */
export class ValidationError extends AppError {
    public readonly field?: string;

    constructor(message: string, field?: string, metadata?: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', 400, true, { ...metadata, field });
        this.field = field;
    }
}

/**
 * Authentication and authorization errors
 */
export class AuthError extends AppError {
    constructor(
        message: string,
        code: 'AUTH_REQUIRED' | 'AUTH_INVALID' | 'AUTH_EXPIRED' = 'AUTH_REQUIRED',
        metadata?: Record<string, unknown>
    ) {
        super(message, code, 401, true, metadata);
    }
}

/**
 * Permission/authorization errors
 */
export class PermissionError extends AppError {
    constructor(message: string, requiredPermission?: string) {
        super(message, 'PERMISSION_DENIED', 403, true, { requiredPermission });
    }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string) {
        super(
            `${resource}${identifier ? ` with identifier '${identifier}'` : ''} not found`,
            'NOT_FOUND',
            404,
            true,
            { resource, identifier }
        );
    }
}

/**
 * Conflict errors (e.g., duplicate barcode)
 */
export class ConflictError extends AppError {
    constructor(message: string, conflictingField?: string) {
        super(message, 'CONFLICT', 409, true, { conflictingField });
    }
}

/**
 * Business logic errors
 */
export class BusinessError extends AppError {
    constructor(message: string, code: string, metadata?: Record<string, unknown>) {
        super(message, code, 422, true, metadata);
    }
}

/**
 * Network/IPC errors
 */
export class NetworkError extends AppError {
    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message, 'NETWORK_ERROR', 503, true, metadata);
    }
}

/**
 * File system errors
 */
export class FileSystemError extends AppError {
    constructor(message: string, filePath?: string) {
        super(message, 'FILE_SYSTEM_ERROR', 500, true, { filePath });
    }
}

// ============================================
// ERROR TYPE GUARDS
// ============================================

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
}

export function isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
}

export function isPermissionError(error: unknown): error is PermissionError {
    return error instanceof PermissionError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError;
}

export function isConflictError(error: unknown): error is ConflictError {
    return error instanceof ConflictError;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
    return error instanceof DatabaseError;
}

export function isBusinessError(error: unknown): error is BusinessError {
    return error instanceof BusinessError;
}

export function isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError;
}

export function isFileSystemError(error: unknown): error is FileSystemError {
    return error instanceof FileSystemError;
}

// ============================================
// ERROR UTILITIES
// ============================================

/**
 * Normalize unknown errors to AppError
 */
export function normalizeError(error: unknown): AppError {
    // Already an AppError
    if (isAppError(error)) {
        return error;
    }

    // Standard Error
    if (error instanceof Error) {
        return new AppError(error.message, 'UNKNOWN_ERROR', 500, false, {
            originalError: error.name,
            stack: error.stack,
        });
    }

    // String error
    if (typeof error === 'string') {
        return new AppError(error, 'UNKNOWN_ERROR', 500, false);
    }

    // Unknown error type
    return new AppError(
        'An unknown error occurred',
        'UNKNOWN_ERROR',
        500,
        false,
        { error: String(error) }
    );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
    const normalizedError = normalizeError(error);

    // Map specific error codes to user-friendly messages
    const userFriendlyMessages: Record<string, string> = {
        DB_ERROR: 'A database error occurred. Please try again.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        AUTH_REQUIRED: 'Please log in to continue.',
        AUTH_INVALID: 'Invalid credentials. Please try again.',
        AUTH_EXPIRED: 'Your session has expired. Please log in again.',
        PERMISSION_DENIED: 'You do not have permission to perform this action.',
        NOT_FOUND: 'The requested resource was not found.',
        CONFLICT: 'This action conflicts with existing data.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        FILE_SYSTEM_ERROR: 'File system error. Please check file permissions.',
    };

    return userFriendlyMessages[normalizedError.code] || normalizedError.message;
}

/**
 * Log error to console (development) or file (production)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
    const normalizedError = normalizeError(error);

    const errorLog = {
        timestamp: new Date().toISOString(),
        error: normalizedError.toJSON(),
        context,
    };

    if (process.env.NODE_ENV === 'development') {
        console.error('🔴 Error:', errorLog);
    } else {
        // In production, send to Electron main process for file logging
        if (typeof window !== 'undefined' && window.electronAPI) {
            // This would be implemented in the IPC handler
            // window.electronAPI.logger?.error(errorLog);
        }
        console.error('Error:', normalizedError.message);
    }
}

/**
 * Handle error with logging and user notification
 */
export function handleError(
    error: unknown,
    options?: {
        context?: Record<string, unknown>;
        showToUser?: boolean;
        rethrow?: boolean;
    }
): void {
    const { context, showToUser = true, rethrow = false } = options || {};

    logError(error, context);

    if (showToUser) {
        const message = getUserFriendlyMessage(error);
        // This could integrate with a toast notification system
        console.warn('User message:', message);
    }

    if (rethrow) {
        throw error;
    }
}

// ============================================
// ERROR RESPONSE HELPERS
// ============================================

/**
 * Create standardized error response for IPC
 */
export function createErrorResponse(error: unknown) {
    const normalizedError = normalizeError(error);

    return {
        success: false,
        error: {
            message: normalizedError.message,
            code: normalizedError.code,
            statusCode: normalizedError.statusCode,
            metadata: normalizedError.metadata,
        },
    };
}

/**
 * Check if error should trigger app crash or recovery
 */
export function isCriticalError(error: unknown): boolean {
    if (!isAppError(error)) {
        return true; // Unknown errors are critical
    }

    // Non-operational errors are critical
    if (!error.isOperational) {
        return true;
    }

    // Database errors might be critical
    if (isDatabaseError(error)) {
        return error.code === 'DB_CONNECTION_FAILED';
    }

    return false;
}
