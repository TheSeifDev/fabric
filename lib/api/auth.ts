/**
 * API Client for Authentication
 * HTTP client to call Next.js API routes
 */

import type { User, APIResponse } from '@/lib/electron-api.d';

const API_BASE = '/api';

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const result: APIResponse<{ user: User; token: string }> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
    });

    const result: APIResponse<null> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }
}
