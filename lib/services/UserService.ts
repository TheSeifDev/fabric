/**
 * User Service
 * Handles all user-related business logic and data access
 */

import type { User, CreateUserDTO, UpdateUserDTO, APIResponse } from '@/lib/electron-api.d';
import { NotFoundError, ConflictError, ValidationError, DatabaseError, AuthError, normalizeError } from '@/lib/errors';

class UserService {
    /**
     * Get all users
     */
    async getAll(): Promise<User[]> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<User[]> = await window.electronAPI.users.getAll();

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            console.warn('electronAPI not available, returning empty array');
            return [];
        } catch (error) {
            console.error('UserService.getAll error:', error);
            throw error;
        }
    }

    /**
     * Get a single user by ID
     */
    async getById(id: string): Promise<User> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<User> = await window.electronAPI.users.getById(id);

                if (!response.success) {
                    if (response.error.code === 'NOT_FOUND') {
                        throw new NotFoundError('User', id);
                    }
                    throw new DatabaseError(response.error.message, response.error.code);
                }

                return response.data;
            }

            throw new DatabaseError('electronAPI not available');
        } catch (error) {
            throw normalizeError(error);
        }
    }

    /**
     * Create a new user
     */
    async create(data: CreateUserDTO): Promise<User> {
        try {
            // Validate email uniqueness
            const isUnique = await this.isEmailUnique(data.email);
            if (!isUnique) {
                throw new ConflictError('Email already exists', 'email');
            }

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<User> = await window.electronAPI.users.create(data);

                if (!response.success) {
                    if (response.error.code === 'CONFLICT') {
                        throw new ConflictError(response.error.message, 'email');
                    }
                    if (response.error.code === 'VALIDATION_ERROR') {
                        throw new ValidationError(response.error.message);
                    }
                    throw new DatabaseError(response.error.message, response.error.code);
                }

                return response.data;
            }

            throw new DatabaseError('electronAPI not available');
        } catch (error) {
            throw normalizeError(error);
        }
    }

    /**
     * Update an existing user
     */
    async update(id: string, data: UpdateUserDTO): Promise<User> {
        try {
            // If email is being updated, check uniqueness
            if (data.email) {
                const isUnique = await this.isEmailUnique(data.email, id);
                if (!isUnique) {
                    throw new ConflictError('Email already exists', 'email');
                }
            }

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<User> = await window.electronAPI.users.update(id, data);

                if (!response.success) {
                    if (response.error.code === 'NOT_FOUND') {
                        throw new NotFoundError('User', id);
                    }
                    if (response.error.code === 'CONFLICT') {
                        throw new ConflictError(response.error.message, 'email');
                    }
                    throw new DatabaseError(response.error.message, response.error.code);
                }

                return response.data;
            }

            throw new DatabaseError('electronAPI not available');
        } catch (error) {
            throw normalizeError(error);
        }
    }

    /**
     * Delete a user (soft delete)
     */
    async delete(id: string): Promise<void> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<null> = await window.electronAPI.users.delete(id);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('UserService.delete error:', error);
            throw error;
        }
    }

    /**
     * Update password
     */
    async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<null> = await window.electronAPI.users.updatePassword(
                    userId,
                    oldPassword,
                    newPassword
                );

                if (!response.success) {
                    if (response.error.code === 'AUTH_INVALID') {
                        throw new AuthError('Current password is incorrect', 'AUTH_INVALID');
                    }
                    if (response.error.code === 'VALIDATION_ERROR') {
                        throw new ValidationError(response.error.message);
                    }
                    throw new DatabaseError(response.error.message, response.error.code);
                }

                return;
            }

            throw new DatabaseError('electronAPI not available');
        } catch (error) {
            throw normalizeError(error);
        }
    }

    /**
     * Check if email is unique
     */
    async isEmailUnique(email: string, excludeId?: string): Promise<boolean> {
        try {
            const users = await this.getAll();
            const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!existing) return true;
            if (excludeId && existing.id === excludeId) return true;

            return false;
        } catch (error) {
            console.error('UserService.isEmailUnique error:', error);
            return false;
        }
    }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
