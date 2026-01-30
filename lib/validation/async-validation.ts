/**
 * Advanced Validation Utilities
 * Debounced async validation, cross-field validation, and conditional schemas
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce utility - delays function execution until after wait time
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function debounced(...args: Parameters<T>) {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

/**
 * Hook for debounced async validation
 * @param validationFn - Async function that returns validation result
 * @param delay - Debounce delay in ms (default: 500)
 * @returns Object with validation state and validate function
 */
export function useAsyncValidation<T>(
    validationFn: (value: T) => Promise<{ valid: boolean; message?: string }>,
    delay: number = 500
) {
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [lastValidatedValue, setLastValidatedValue] = useState<T | null>(null);

    // Create debounced validation function
    const debouncedValidate = useCallback(
        debounce(async (value: T) => {
            setIsValidating(true);
            setValidationError(null);

            try {
                const result = await validationFn(value);

                if (!result.valid) {
                    setValidationError(result.message || 'Validation failed');
                } else {
                    setValidationError(null);
                }

                setLastValidatedValue(value);
            } catch (error) {
                setValidationError(error instanceof Error ? error.message : 'Validation error');
            } finally {
                setIsValidating(false);
            }
        }, delay),
        [validationFn, delay]
    );

    const validate = useCallback((value: T) => {
        if (value === lastValidatedValue) {
            return; // Already validated this value
        }
        debouncedValidate(value);
    }, [debouncedValidate, lastValidatedValue]);

    const reset = useCallback(() => {
        setIsValidating(false);
        setValidationError(null);
        setLastValidatedValue(null);
    }, []);

    return {
        isValidating,
        validationError,
        validate,
        reset,
        isValid: !validationError && lastValidatedValue !== null,
    };
}

/**
 * Hook for barcode uniqueness validation
 */
export function useBarcodeValidation(
    checkUnique: (barcode: string, excludeId?: string) => Promise<boolean>,
    excludeId?: string
) {
    return useAsyncValidation(async (barcode: string) => {
        if (!barcode || barcode.trim().length < 3) {
            return { valid: false, message: 'Barcode must be at least 3 characters' };
        }

        const isUnique = await checkUnique(barcode, excludeId);

        if (!isUnique) {
            return { valid: false, message: 'Barcode is already in use' };
        }

        return { valid: true };
    });
}

/**
 * Hook for email uniqueness validation
 */
export function useEmailValidation(
    checkUnique: (email: string, excludeId?: string) => Promise<boolean>,
    excludeId?: string
) {
    return useAsyncValidation(async (email: string) => {
        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'Invalid email format' };
        }

        const isUnique = await checkUnique(email, excludeId);

        if (!isUnique) {
            return { valid: false, message: 'Email is already in use' };
        }

        return { valid: true };
    });
}

/**
 * Hook for value comparison validation (e.g., end date after start date)
 */
export function useComparativeValidation<T>(
    getValue: () => T,
    compareFn: (value: T, compareValue: T) => boolean,
    errorMessage: string
) {
    const [error, setError] = useState<string | null>(null);

    const validate = useCallback((compareValue: T) => {
        const value = getValue();
        const isValid = compareFn(value, compareValue);

        if (!isValid) {
            setError(errorMessage);
        } else {
            setError(null);
        }

        return isValid;
    }, [getValue, compareFn, errorMessage]);

    return {
        error,
        validate,
        reset: () => setError(null),
    };
}

/**
 * Throttle utility - ensures function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function throttled(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Hook for form field with multiple validators
 */
export function useFieldValidation(
    validators: Array<(value: any) => Promise<{ valid: boolean; message?: string }>>
) {
    const [errors, setErrors] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(false);

    const validate = useCallback(async (value: any) => {
        setIsValidating(true);
        const validationErrors: string[] = [];

        for (const validator of validators) {
            const result = await validator(value);
            if (!result.valid && result.message) {
                validationErrors.push(result.message);
            }
        }

        setErrors(validationErrors);
        setIsValidating(false);

        return validationErrors.length === 0;
    }, [validators]);

    return {
        errors,
        isValidating,
        validate,
        isValid: errors.length === 0,
        reset: () => setErrors([]),
    };
}
