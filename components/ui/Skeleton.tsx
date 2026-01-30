/**
 * Skeleton Component
 * Loading placeholders for content that's being fetched
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
    lines = 1,
}: SkeletonProps) {
    if (variant === 'text' && lines > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            'animate-pulse bg-gray-200 rounded',
                            i === lines - 1 ? 'w-3/4' : 'w-full',
                            className
                        )}
                        style={{ width: i === lines - 1 ? '75%' : width, height: height || '1rem' }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200',
                variant === 'circular' && 'rounded-full',
                variant === 'rectangular' && 'rounded',
                variant === 'text' && 'rounded h-4',
                className
            )}
            style={{ width, height }}
        />
    );
}

/**
 * Skeleton variants for common use cases
 */

export function SkeletonCard() {
    return (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <Skeleton variant="rectangular" height="1.5rem" width="60%" />
            <Skeleton variant="text" lines={3} />
            <div className="flex gap-2 mt-4">
                <Skeleton variant="rectangular" height="2rem" width="5rem" />
                <Skeleton variant="rectangular" height="2rem" width="5rem" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex gap-4 pb-2 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} variant="text" width={`${100 / columns}%`} height="1rem" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-3">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            variant="text"
                            width={`${100 / columns}%`}
                            height="0.875rem"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="40%" height="1rem" />
                        <Skeleton variant="text" width="60%" height="0.75rem" />
                    </div>
                    <Skeleton variant="rectangular" width="4rem" height="2rem" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonForm() {
    return (
        <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton variant="text" width="8rem" height="0.875rem" />
                    <Skeleton variant="rectangular" height="2.5rem" />
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <Skeleton variant="rectangular" width="6rem" height="2.5rem" />
                <Skeleton variant="rectangular" width="6rem" height="2.5rem" />
            </div>
        </div>
    );
}

/**
 * Loading Spinner Component
 */
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-10 h-10 border-4',
    };

    return (
        <div
            className={cn(
                'border-gray-300 border-t-blue-500 rounded-full animate-spin',
                sizeClasses[size],
                className
            )}
        />
    );
}

/**
 * Button Loading State
 */
export function ButtonSpinner() {
    return (
        <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span>Loading...</span>
        </div>
    );
}
