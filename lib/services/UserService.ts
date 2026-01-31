/**
 * User Service (Database-Enabled)
 * Handles all user-related business logic with direct database access
 */

import type { User, CreateUserDTO, UpdateUserDTO } from '@/lib/electron-api.d';
import { NotFoundError, ConflictError, ValidationError, DatabaseError, AuthError } from '@/lib/errors';
import { getUserRepository, getAuditRepository } from '@/database/repositories';
import type { NewUser } from '@/database/schema';
import { generateUUID, hashPassword, verifyPassword } from '@/lib/utils';

class UserService {
    private _userRepo: ReturnType<typeof getUserRepository> | null = null;
    private _auditRepo: ReturnType<typeof getAuditRepository> | null = null;

    private get userRepo() {
        if (!this._userRepo) {
            this._userRepo = getUserRepository();
        }
        return this._userRepo;
    }

    private get auditRepo() {
        if (!this._auditRepo) {
            this._auditRepo = getAuditRepository();
        }
        return this._auditRepo;
    }

    /**
     * Get all users
     */
    async getAll(): Promise<User[]> {
        try {
            const users = this.userRepo.findAll();
            return users.map(this.mapToAPI);
        } catch (error) {
            console.error('UserService.getAll error:', error);
            throw new DatabaseError('Failed to fetch users');
        }
    }

    /**
     * Get a single user by ID
     */
    async getById(id: string): Promise<User> {
        try {
            const user = this.userRepo.findById(id);

            if (!user) {
                throw new NotFoundError('User', id);
            }

            return this.mapToAPI(user);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('UserService.getById error:', error);
            throw new DatabaseError('Failed to fetch user');
        }
    }

    /**
     * Get user by email
     */
    async getByEmail(email: string): Promise<User | null> {
        try {
            const user = this.userRepo.findByEmail(email);
            return user ? this.mapToAPI(user) : null;
        } catch (error) {
            console.error('UserService.getByEmail error:', error);
            throw new DatabaseError('Failed to fetch user by email');
        }
    }

    /**
     * Create a new user
     */
    async create(data: CreateUserDTO, createdBy?: string): Promise<User> {
        try {
            // 1. Validate email uniqueness
            const isUnique = await this.isEmailUnique(data.email);
            if (!isUnique) {
                throw new ConflictError('Email already exists', 'email');
            }

            // 2. Hash password
            const passwordHash = await hashPassword(data.password);

            // 3. Create user in database
            const now = new Date();
            const newUser: NewUser = {
                id: generateUUID(),
                name: data.name,
                email: data.email.toLowerCase(),
                passwordHash,
                role: data.role || 'viewer',
                status: data.status || 'active',
                createdAt: now,
                updatedAt: now,
            };

            const created = this.userRepo.create(newUser);

            // 4. Audit log
            if (createdBy) {
                this.auditRepo.logCreate('user', created.id, createdBy, {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                });
            }

            return this.mapToAPI(created);
        } catch (error) {
            if (error instanceof ConflictError || error instanceof ValidationError) {
                throw error;
            }
            console.error('UserService.create error:', error);
            throw new DatabaseError('Failed to create user');
        }
    }

    /**
     * Update an existing user
     */
    async update(id: string, data: UpdateUserDTO, updatedBy?: string): Promise<User> {
        try {
            // 1. Get existing user
            const existing = this.userRepo.findById(id);
            if (!existing) {
                throw new NotFoundError('User', id);
            }

            // 2. If email is being updated, check uniqueness
            if (data.email && data.email !== existing.email) {
                const isUnique = await this.isEmailUnique(data.email, id);
                if (!isUnique) {
                    throw new ConflictError('Email already exists', 'email');
                }
            }

            // 3. Update user in database
            const updateData: Partial<NewUser> = {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email.toLowerCase() }),
                ...(data.role && { role: data.role }),
                ...(data.status && { status: data.status }),
            };

            const updated = this.userRepo.update(id, updateData);

            // 4. Audit log
            if (updatedBy) {
                this.auditRepo.logUpdate('user', id, updatedBy, data);
            }

            return this.mapToAPI(updated);
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ConflictError) {
                throw error;
            }
            console.error('UserService.update error:', error);
            throw new DatabaseError('Failed to update user');
        }
    }

    /**
     * Delete a user
     */
    async delete(id: string, deletedBy?: string): Promise<void> {
        try {
            // 1. Get existing user for audit
            const existing = this.userRepo.findById(id);
            if (!existing) {
                throw new NotFoundError('User', id);
            }

            // 2. Delete from database
            this.userRepo.delete(id);

            // 3. Audit log
            if (deletedBy) {
                this.auditRepo.logDelete('user', id, deletedBy, existing);
            }
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('UserService.delete error:', error);
            throw new DatabaseError('Failed to delete user');
        }
    }

    /**
     * Update password
     */
    async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        try {
            // 1. Get user
            const user = this.userRepo.findById(userId);
            if (!user) {
                throw new NotFoundError('User', userId);
            }

            // 2. Verify old password
            const isValid = await verifyPassword(oldPassword, user.passwordHash);
            if (!isValid) {
                throw new AuthError('Current password is incorrect', 'AUTH_INVALID');
            }

            // 3. Hash new password
            const newPasswordHash = await hashPassword(newPassword);

            // 4. Update password
            this.userRepo.update(userId, { passwordHash: newPasswordHash });

            // 5. Audit log
            this.auditRepo.logUpdate('user', userId, userId, { action: 'password_changed' });
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AuthError) {
                throw error;
            }
            console.error('UserService.updatePassword error:', error);
            throw new DatabaseError('Failed to update password');
        }
    }

    /**
     * Check if email is unique
     */
    async isEmailUnique(email: string, excludeId?: string): Promise<boolean> {
        try {
            const existing = this.userRepo.findByEmail(email.toLowerCase());

            if (!existing) return true;
            if (excludeId && existing.id === excludeId) return true;

            return false;
        } catch (error) {
            console.error('UserService.isEmailUnique error:', error);
            return false;
        }
    }

    /**
     * Map database user to API format (excluding password hash)
     */
    private mapToAPI(user: any): User {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt instanceof Date ? user.createdAt.getTime() : user.createdAt,
            updatedAt: user.updatedAt instanceof Date ? user.updatedAt.getTime() : user.updatedAt,
            createdBy: user.createdBy || '',
            updatedBy: user.updatedBy || '',
            deletedAt: user.deletedAt ? (user.deletedAt instanceof Date ? user.deletedAt.getTime() : user.deletedAt) : null,
            deletedBy: user.deletedBy || null,
        };
    }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
