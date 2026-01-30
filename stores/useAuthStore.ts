/**
 * Auth Store - Zustand
 * Centralized authentication and user state with persistence
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/lib/electron-api';
import type { LoginInput } from '@/lib/validation/schemas';
import { authService } from '@/lib/services/AuthService';
import { hasPermission } from '@/lib/permissions';

interface AuthStore {
    // State
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginInput) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;

    // Selectors
    isAuthenticated: () => boolean;
    hasPermission: (permission: string) => boolean;
    getCurrentUser: () => User | null;
}

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                user: null,
                token: null,
                loading: false,
                error: null,

                // Login
                login: async (credentials: LoginInput) => {
                    set({ loading: true, error: null });

                    try {
                        const result = await authService.login(credentials.email, credentials.password);

                        set({
                            user: result.user,
                            token: result.token,
                            loading: false,
                        });
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : 'Login failed',
                            loading: false,
                        });
                        throw error;
                    }
                },

                // Logout
                logout: async () => {
                    try {
                        await authService.logout();
                    } finally {
                        set({
                            user: null,
                            token: null,
                            error: null,
                        });
                    }
                },

                // Check authentication status
                checkAuth: async () => {
                    const token = get().token;
                    if (!token) {
                        return;
                    }

                    set({ loading: true });

                    try {
                        const user = await authService.getCurrentUser();
                        set({ user, loading: false });
                    } catch (error) {
                        // Token invalid, clear state
                        set({
                            user: null,
                            token: null,
                            loading: false,
                        });
                    }
                },

                // Update profile
                updateProfile: async (data: Partial<User>) => {
                    const currentUser = get().user;
                    if (!currentUser) {
                        throw new Error('Not authenticated');
                    }

                    set({ loading: true, error: null });

                    try {
                        // TODO: Implement profile update through user service
                        // For now, just update local state
                        set({
                            user: { ...currentUser, ...data },
                            loading: false,
                        });
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : 'Failed to update profile',
                            loading: false,
                        });
                        throw error;
                    }
                },

                // Selectors
                isAuthenticated: () => {
                    return get().user !== null && get().token !== null;
                },

                hasPermission: (permissionName: string) => {
                    const user = get().user;
                    if (!user) return false;
                    return hasPermission(user.role, permissionName as any);
                },

                getCurrentUser: () => {
                    return get().user;
                },
            }),
            {
                name: 'auth-storage', // localStorage key
                partialize: (state) => ({
                    user: state.user,
                    token: state.token,
                }),
            }
        ),
        { name: 'AuthStore' }
    )
);
