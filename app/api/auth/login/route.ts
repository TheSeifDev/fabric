/**
 * Login API Route (Fixed)
 * Server-side authentication endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/AuthService';
import type { APIResponse } from '@/lib/electron-api.d';
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
 * POST /api/auth/login - Login user
 */
export async function POST(request: NextRequest) {
    try {
        await ensureDatabase();

        const { email, password } = await request.json();

        if (!email || !password) {
            const response: APIResponse<null> = {
                success: false,
                error: {
                    message: 'Email and password are required',
                    code: 'VALIDATION_ERROR',
                    statusCode: 400,
                },
            };
            return NextResponse.json(response, { status: 400 });
        }

        const result = await authService.login(email, password);

        const response: APIResponse<typeof result> = {
            success: true,
            data: result,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        const status = error.code === 'AUTH_INVALID' ? 401 : 500;
        const response: APIResponse<null> = {
            success: false,
            error: {
                message: error.message || 'Login failed',
                code: error.code || 'INTERNAL_ERROR',
                statusCode: status,
            },
        };

        return NextResponse.json(response, { status });
    }
}
