/**
 * Rolls API Route
 * Server-side endpoint for roll operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { rollService } from '@/lib/services/RollService';
import type { APIResponse, CreateRollDTO, RollFilters } from '@/lib/electron-api.d';
import { setupDatabase } from '@/database/init';

// Initialize database on first API call
let dbInitialized = false;

async function ensureDatabase() {
    if (!dbInitialized) {
        await setupDatabase();
        dbInitialized = true;
    }
}

/**
 * GET /api/rolls - Get all rolls with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        await ensureDatabase();

        const { searchParams } = new URL(request.url);

        const filters: RollFilters = {
            catalog: searchParams.get('catalog') || undefined,
            status: searchParams.get('status') as any || undefined,
            degree: searchParams.get('degree') as any || undefined,
            color: searchParams.get('color') || undefined,
            search: searchParams.get('search') || undefined,
        };

        const rolls = await rollService.getAll(filters);

        const response: APIResponse<typeof rolls> = {
            success: true,
            data: rolls,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to fetch rolls',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: 500,
            },
        };

        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * POST /api/rolls - Create a new roll
 */
export async function POST(request: NextRequest) {
    try {
        await ensureDatabase();

        const body: CreateRollDTO = await request.json();
        const userId = request.headers.get('x-user-id') || undefined;

        const roll = await rollService.create(body, userId);

        const response: APIResponse<typeof roll> = {
            success: true,
            data: roll,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
        const status = error.code === 'CONFLICT' ? 409 : error.code === 'VALIDATION_ERROR' ? 400 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to create roll',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };
        return NextResponse.json(response, { status });
    }
}
