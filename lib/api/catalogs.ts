/**
 * API Client for Catalogs
 * HTTP client to call Next.js API routes
 */

import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO, APIResponse } from '@/lib/electron-api.d';

const API_BASE = '/api';

/**
 * Get all catalogs
 */
export async function getAllCatalogs(): Promise<Catalog[]> {
    const response = await fetch(`${API_BASE}/catalogs`);
    const result: APIResponse<Catalog[]> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Get catalog by ID
 */
export async function getCatalogById(id: string): Promise<Catalog> {
    const response = await fetch(`${API_BASE}/catalogs/${id}`);
    const result: APIResponse<Catalog> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Create new catalog
 */
export async function createCatalog(data: CreateCatalogDTO): Promise<Catalog> {
    const response = await fetch(`${API_BASE}/catalogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result: APIResponse<Catalog> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Update catalog
 */
export async function updateCatalog(id: string, data: UpdateCatalogDTO): Promise<Catalog> {
    const response = await fetch(`${API_BASE}/catalogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result: APIResponse<Catalog> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Delete catalog
 */
export async function deleteCatalog(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/catalogs/${id}`, {
        method: 'DELETE',
    });

    const result: APIResponse<null> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }
}
