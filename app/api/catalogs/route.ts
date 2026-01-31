/**
 * Catalogs API Route (Fixed)
 * Server-side endpoint for catalog operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { catalogService } from '@/lib/services/CatalogService';
import type { APIResponse, CreateCatalogDTO } from '@/lib/electron-api.d';
import { setupDatabase } from '@/database/init';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Initialize database on first API call
let dbInitialized = false;

async function ensureDatabase() {
    if (!dbInitialized) {
        await setupDatabase();
        dbInitialized = true;
    }
}

/**
 * GET /api/catalogs - Get all catalogs
 */
export async function GET() {
    try {
        await ensureDatabase();

        const catalogs = await catalogService.getAll();

        const response: APIResponse<typeof catalogs> = {
            success: true,
            data: catalogs,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to fetch catalogs',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: 500,
            },
        };

        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * POST /api/catalogs - Create a new catalog
 */
export async function POST(request: NextRequest) {
    try {
        await ensureDatabase();

        const body: CreateCatalogDTO = await request.json();
        const userId = request.headers.get('x-user-id') || undefined;

        const catalog = await catalogService.create(body, userId);

        const response: APIResponse<typeof catalog> = {
            success: true,
            data: catalog,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
        const status = error.code === 'CONFLICT' ? 409 : error.code === 'VALIDATION_ERROR' ? 400 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to create catalog',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}
