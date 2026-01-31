/**
 * Catalog by ID API Route
 * Server-side endpoint for single catalog operations
 * Next.js 15+ compatible with async params
 */

import { NextRequest, NextResponse } from 'next/server';
import { setupDatabase } from '@/database/init';
// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { catalogService } from '@/lib/services/CatalogService';
import type { APIResponse, UpdateCatalogDTO } from '@/lib/electron-api.d';

/**
 * GET /api/catalogs/[id] - Get catalog by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const catalog = await catalogService.getById(id);

        const response: APIResponse<typeof catalog> = {
            success: true,
            data: catalog,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const status = error.code === 'NOT_FOUND' ? 404 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to fetch catalog',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}

/**
 * PUT /api/catalogs/[id] - Update catalog
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateCatalogDTO = await request.json();
        const userId = request.headers.get('x-user-id') || undefined;

        const catalog = await catalogService.update(id, body, userId);

        const response: APIResponse<typeof catalog> = {
            success: true,
            data: catalog,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'CONFLICT' ? 409 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to update catalog',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}

/**
 * DELETE /api/catalogs/[id] - Delete catalog
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = request.headers.get('x-user-id') || undefined;

        await catalogService.delete(id, userId);

        const response: APIResponse<null> = {
            success: true,
            data: null,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const status = error.code === 'NOT_FOUND' ? 404 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to delete catalog',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}
