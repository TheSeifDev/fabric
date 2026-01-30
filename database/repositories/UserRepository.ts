/**
 * User Repository
 * Data access layer for users table
 */

import { eq, and, or, like, desc } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { users, type User, type NewUser } from '../schema';
import type { Repository, PaginatedResult, PaginationOptions } from './base';
import type { UserRole, UserStatus } from '@/lib/electron-api';

export interface UserFilters {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
}

export class UserRepository implements Repository<User, NewUser> {
    private db = getDatabase();

    /**
     * Find all users with optional filters
     */
    findAll(filters?: UserFilters): User[] {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(users).orderBy(desc(users.createdAt)).all();
        }

        return this.db
            .select()
            .from(users)
            .where(and(...conditions))
            .orderBy(desc(users.createdAt))
            .all();
    }

    /**
     * Find users with pagination
     */
    findPaginated(filters?: UserFilters, options?: PaginationOptions): PaginatedResult<User> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        const conditions = this.buildWhereClause(filters);
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const countResult = whereClause
            ? this.db.select().from(users).where(whereClause).all()
            : this.db.select().from(users).all();
        const total = countResult.length;

        // Get paginated data
        const data = whereClause
            ? this.db
                .select()
                .from(users)
                .where(whereClause)
                .orderBy(desc(users.createdAt))
                .limit(limit)
                .offset(offset)
                .all()
            : this.db
                .select()
                .from(users)
                .orderBy(desc(users.createdAt))
                .limit(limit)
                .offset(offset)
                .all();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Find user by ID
     */
    findById(id: string): User | null {
        const result = this.db.select().from(users).where(eq(users.id, id)).get();
        return result || null;
    }

    /**
     * Find user by email
     */
    findByEmail(email: string): User | null {
        const result = this.db.select().from(users).where(eq(users.email, email)).get();
        return result || null;
    }

    /**
     * Create new user
     */
    create(data: NewUser): User {
        const result = this.db.insert(users).values(data).returning().get();
        return result;
    }

    /**
     * Update user
     */
    update(id: string, data: Partial<NewUser>): User {
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        const result = this.db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning()
            .get();

        if (!result) {
            throw new Error(`User with id ${id} not found`);
        }

        return result;
    }

    /**
     * Delete user
     */
    delete(id: string): void {
        const result = this.db.delete(users).where(eq(users.id, id)).returning().get();

        if (!result) {
            throw new Error(`User with id ${id} not found`);
        }
    }

    /**
     * Count users
     */
    count(filters?: UserFilters): number {
        const conditions = this.buildWhereClause(filters);

        if (conditions.length === 0) {
            return this.db.select().from(users).all().length;
        }

        return this.db
            .select()
            .from(users)
            .where(and(...conditions))
            .all().length;
    }

    /**
     * Check if email exists
     */
    emailExists(email: string, excludeId?: string): boolean {
        const conditions = [eq(users.email, email)];

        if (excludeId) {
            conditions.push(eq(users.id, excludeId));
        }

        const result = this.db
            .select()
            .from(users)
            .where(excludeId ? and(eq(users.email, email), eq(users.id, excludeId)) : eq(users.email, email))
            .get();

        return excludeId ? !result : !!result;
    }

    /**
     * Update user status
     */
    updateStatus(id: string, status: UserStatus): User {
        return this.update(id, { status });
    }

    /**
     * Build where clause from filters
     */
    private buildWhereClause(filters?: UserFilters) {
        const conditions = [];

        if (filters?.role) {
            conditions.push(eq(users.role, filters.role));
        }

        if (filters?.status) {
            conditions.push(eq(users.status, filters.status));
        }

        if (filters?.search) {
            conditions.push(
                or(
                    like(users.name, `%${filters.search}%`),
                    like(users.email, `%${filters.search}%`)
                )!
            );
        }

        return conditions;
    }
}

// Singleton instance
let instance: UserRepository | null = null;

export function getUserRepository(): UserRepository {
    if (!instance) {
        instance = new UserRepository();
    }
    return instance;
}
