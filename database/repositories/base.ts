/**
 * Base Repository Interface
 * Generic interface for all repositories
 */

export interface Repository<T, TCreate, TUpdate = Partial<TCreate>> {
    findAll(filters?: any): T[];
    findById(id: string): T | null;
    create(data: TCreate): T;
    update(id: string, data: TUpdate): T;
    delete(id: string): void;
    count(filters?: any): number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
