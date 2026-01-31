/**
 * Roll by ID API Route
 * Server-side endpoint for single roll operations
 * Next.js 15+ compatible with async params
 */

import { NextRequest, NextResponse } from 'next/server';
import { rollService } from '@/lib/services/RollService';
import type { APIResponse, UpdateRollDTO } from '@/lib/electron-api.d';
import { setupDatabase } from '@/database/init';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/rolls/[id] - Get roll by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const roll = await rollService.getById(id);

        const response: APIResponse<typeof roll> = {
            success: true,
            data: roll,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const status = error.code === 'NOT_FOUND' ? 404 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to fetch roll',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}

/**
 * PUT /api/rolls/[id] - Update roll
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateRollDTO = await request.json();
        const userId = request.headers.get('x-user-id') || undefined;

        const roll = await rollService.update(id, body, userId);

        const response: APIResponse<typeof roll> = {
            success: true,
            data: roll,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'CONFLICT' ? 409 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Failed to update roll',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}

/**
 * DELETE /api/rolls/[id] - Delete roll
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = request.headers.get('x-user-id') || undefined;

        await rollService.delete(id, userId);

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
                message: error.message || 'Failed to delete roll',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}
