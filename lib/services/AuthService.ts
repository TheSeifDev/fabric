/**
 * Authentication Service (Database-Enabled)
 * Handles login, logout, and authentication with the database
 */

import type { User } from '@/lib/electron-api.d';
import { AuthError, DatabaseError } from '@/lib/errors';
import { getUserRepository, getAuditRepository } from '@/database/repositories';
import { verifyPassword, generateToken } from '@/lib/utils';

class AuthService {
    private userRepo = getUserRepository();
    private auditRepo = getAuditRepository();

    /**
     * Login user
     */
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        try {
            // 1. Find user by email
            const dbUser = this.userRepo.findByEmail(email.toLowerCase());

            if (!dbUser) {
                throw new AuthError('Invalid email or password', 'AUTH_INVALID');
            }

            // 2. Check if user is active
            if (dbUser.status !== 'active') {
                throw new AuthError('Account is inactive', 'AUTH_INVALID');
            }

            // 3. Verify password
            const isValid = await verifyPassword(password, dbUser.passwordHash);

            if (!isValid) {
                throw new AuthError('Invalid email or password', 'AUTH_INVALID');
            }

            // 4. Generate token
            const token = generateToken(dbUser.id);

            // 5. Map user to API format
            const user: User = {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role,
                status: dbUser.status,
                createdAt: dbUser.createdAt instanceof Date ? dbUser.createdAt.getTime() : dbUser.createdAt,
                updatedAt: dbUser.updatedAt instanceof Date ? dbUser.updatedAt.getTime() : dbUser.updatedAt,
                createdBy: '',
                updatedBy: '',
                deletedAt: null,
                deletedBy: null,
            };

            // 6. Store token and user in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('current_user', JSON.stringify(user));
            }

            // 7. Audit log
            this.auditRepo.logCreate('user', dbUser.id, dbUser.id, { action: 'login' });

            return { user, token };
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            console.error('AuthService.login error:', error);
            throw new DatabaseError('Login failed');
        }
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        try {
            // Get current user before clearing storage
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('current_user') : null;
            const user = userStr ? JSON.parse(userStr) : null;

            // Clear localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('current_user');
            }

            // Audit log
            if (user?.id) {
                this.auditRepo.logCreate('user', user.id, user.id, { action: 'logout' });
            }
        } catch (error) {
            console.error('AuthService.logout error:', error);
            // Don't throw on logout errors
        }
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser(): User | null {
        try {
            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('current_user');
                if (userStr) {
                    return JSON.parse(userStr);
                }
            }
            return null;
        } catch (error) {
            console.error('AuthService.getCurrentUser error:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        try {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('auth_token');
                const user = localStorage.getItem('current_user');
                return !!(token && user);
            }
            return false;
        } catch (error) {
            console.error('AuthService.isAuthenticated error:', error);
            return false;
        }
    }

    /**
     * Get auth token
     */
    getToken(): string | null {
        try {
            if (typeof window !== 'undefined') {
                return localStorage.getItem('auth_token');
            }
            return null;
        } catch (error) {
            console.error('AuthService.getToken error:', error);
            return null;
        }
    }

    /**
     * Validate token (stub for now - in production, verify JWT)
     */
    async validateToken(token: string): Promise<boolean> {
        try {
            // For now, just check if token exists
            // In production, this would verify JWT signature and expiration
            return !!token;
        } catch (error) {
            console.error('AuthService.validateToken error:', error);
            return false;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
