/**
 * Logout API Route (Fixed)
 * Server-side logout endpoint
 */

import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/AuthService';
import type { APIResponse } from '@/lib/electron-api.d';

/**
 * POST /api/auth/logout - Logout user
 */
export async function POST() {
    try {
        await authService.logout();

        const response: APIResponse<null> = {
            success: true,
            data: null,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Logout failed',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: 500,
            },
        };

        return NextResponse.json(response, { status: 500 });
    }
}
