/**
 * Authentication Service
 * Handles login, logout, and current user state
 */

import type { User, APIResponse } from '@/lib/electron-api.d';

class AuthService {
    /**
     * Login user
     */
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<{ user: User; token: string }> =
                    await window.electronAPI.auth.login(email, password);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                // Store token in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_token', response.data.token);
                    localStorage.setItem('current_user', JSON.stringify(response.data.user));
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('AuthService.login error:', error);
            throw error;
        }
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<null> = await window.electronAPI.auth.logout();

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                // Clear local storage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('current_user');
                }

                return;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('AuthService.logout error:', error);
            throw error;
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<User | null> = await window.electronAPI.auth.getCurrentUser();

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            // Fallback to localStorage
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('current_user');
                if (stored) {
                    return JSON.parse(stored);
                }
            }

            return null;
        } catch (error) {
            console.error('AuthService.getCurrentUser error:', error);
            return null;
        }
    }

    /**
     * Check if user has a specific permission
     */
    async checkPermission(permission: string): Promise<boolean> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<boolean> =
                    await window.electronAPI.auth.checkPermission(permission);

                if (!response.success) {
                    return false;
                }

                return response.data;
            }

            return false;
        } catch (error) {
            console.error('AuthService.checkPermission error:', error);
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('auth_token');
    }

    /**
     * Get stored token
     */
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
