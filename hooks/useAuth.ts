/**
 * useAuth Hook
 * React hook for authentication state and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/services/AuthService';
import type { User } from '@/lib/electron-api.d';

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load current user
    const loadCurrentUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            setIsAuthenticated(!!user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user');
            console.error('useAuth.loadCurrentUser error:', err);
            setCurrentUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            setError(null);
            setLoading(true);
            const { user } = await authService.login(email, password);
            setCurrentUser(user);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            console.error('useAuth.login error:', err);
            setCurrentUser(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            setError(null);
            await authService.logout();
            setCurrentUser(null);
            setIsAuthenticated(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed');
            console.error('useAuth.logout error:', err);
        }
    }, []);

    // Check permission based on user role (client-side check)
    const checkPermission = useCallback((permission: string): boolean => {
        if (!currentUser) return false;

        // Admin has all permissions
        if (currentUser.role === 'admin') return true;

        // Simple permission check based on role
        // Can be expanded based on specific permission requirements
        return false;
    }, [currentUser]);

    // Get token
    const getToken = useCallback((): string | null => {
        return authService.getToken();
    }, []);

    // Load on mount
    useEffect(() => {
        loadCurrentUser();
    }, [loadCurrentUser]);

    return {
        currentUser,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        checkPermission,
        getToken,
        loadCurrentUser,
    };
}
