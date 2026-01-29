/**
 * User Service
 * Handles all user-related business logic and data access
 */

import type { User, CreateUserDTO, UpdateUserDTO, APIResponse } from '@/lib/electron-api.d';

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
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('UserService.getById error:', error);
            throw error;
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
                throw new Error('Email already exists');
            }

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<User> = await window.electronAPI.users.create(data);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('UserService.create error:', error);
            throw error;
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
                    throw new Error('Email already exists');
                }
            }

            if (typeof window !== 'undefined' && window.electronAPI) {
                const response: APIResponse<User> = await window.electronAPI.users.update(id, data);

                if (!response.success) {
                    throw new Error(response.error.message);
                }

                return response.data;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('UserService.update error:', error);
            throw error;
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
                    throw new Error(response.error.message);
                }

                return;
            }

            throw new Error('electronAPI not available');
        } catch (error) {
            console.error('UserService.updatePassword error:', error);
            throw error;
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
