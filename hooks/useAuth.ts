/**
 * useAuth Hook
 * React hook for authentication state and operations
 * Supports both Electron (IPC) and Web (HTTP API) modes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/electron-api.d';

// Helper to check if running in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load current user (check if authenticated)
    const loadCurrentUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to get current user from local storage or session
            const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

            if (!storedToken) {
                setCurrentUser(null);
                setIsAuthenticated(false);
                return;
            }

            if (isElectron) {
                const result = await (window as any).electronAPI.auth.checkAuth(storedToken);
                if (result.success && result.data) {
                    setCurrentUser(result.data);
                    setIsAuthenticated(true);
                } else {
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                // For web mode, we'd verify the token with the API
                // For now, assume the token is valid if it exists
                setIsAuthenticated(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user');
            console.error('useAuth.loadCurrentUser error:', err);
            setCurrentUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login - Electron IPC or Web API
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            setError(null);
            setLoading(true);

            let user: User;
            let token: string;

            if (isElectron) {
                const result = await (window as any).electronAPI.auth.login(email, password);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Login failed');
                }
                user = result.data.user;
                token = result.data.token;
            } else {
                // Web mode: call auth API
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error?.message || 'Login failed');
                }
                user = data.data.user;
                token = data.data.token;
            }

            // Store token
            if (typeof window !== 'undefined') {
                localStorage.setItem('authToken', token);
                localStorage.setItem('currentUser', JSON.stringify(user));
            }

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

    // Logout - Electron IPC or Web API
    const logout = useCallback(async () => {
        try {
            setError(null);

            if (isElectron) {
                await (window as any).electronAPI.auth.logout();
            } else {
                await fetch('/api/auth/logout', { method: 'POST' });
            }

            // Clear local storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
            }

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

        // Storekeeper permissions
        if (currentUser.role === 'storekeeper') {
            return ['rolls:read', 'rolls:create', 'rolls:update',
                'catalogs:read', 'catalogs:create', 'catalogs:update',
                'reports:read'].includes(permission);
        }

        // Viewer permissions
        if (currentUser.role === 'viewer') {
            return ['rolls:read', 'catalogs:read', 'reports:read'].includes(permission);
        }

        return false;
    }, [currentUser]);

    // Load current user on mount
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
        reloadUser: loadCurrentUser,
    };
}
