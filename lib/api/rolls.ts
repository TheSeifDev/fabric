/**
 * API Client for Rolls
 * HTTP client to call Next.js API routes
 */

import type { Roll, CreateRollDTO, UpdateRollDTO, RollFilters, APIResponse } from '@/lib/electron-api.d';

const API_BASE = '/api';

/**
 * Get all rolls with optional filters
 */
export async function getAllRolls(filters?: RollFilters): Promise<Roll[]> {
    const params = new URLSearchParams();

    if (filters?.catalog) params.append('catalog', filters.catalog);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.degree) params.append('degree', filters.degree);
    if (filters?.color) params.append('color', filters.color);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE}/rolls?${params.toString()}`;
    const response = await fetch(url);
    const result: APIResponse<Roll[]> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Get roll by ID
 */
export async function getRollById(id: string): Promise<Roll> {
    const response = await fetch(`${API_BASE}/rolls/${id}`);
    const result: APIResponse<Roll> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Create new roll
 */
export async function createRoll(data: CreateRollDTO): Promise<Roll> {
    const response = await fetch(`${API_BASE}/rolls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result: APIResponse<Roll> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Update roll
 */
export async function updateRoll(id: string, data: UpdateRollDTO): Promise<Roll> {
    const response = await fetch(`${API_BASE}/rolls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result: APIResponse<Roll> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.data;
}

/**
 * Delete roll
 */
export async function deleteRoll(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/rolls/${id}`, {
        method: 'DELETE',
    });

    const result: APIResponse<null> = await response.json();

    if (!result.success) {
        throw new Error(result.error.message);
    }
}
