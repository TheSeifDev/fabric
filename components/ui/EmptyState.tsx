/**
 * Empty State Component
 * Displays helpful messages when lists are empty
 */

import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
}

export function EmptyState({ icon = '📦', title, description, action, children }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-600 mb-6 max-w-md">{description}</p>}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                    {action.label}
                </button>
            )}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}

/**
 * Pre-built empty states for common scenarios
 */

export function EmptyRollsState({ onAddRoll }: { onAddRoll: () => void }) {
    return (
        <EmptyState
            icon="🧵"
            title="No rolls in inventory"
            description="Get started by adding your first fabric roll to track your inventory."
            action={{
                label: '+ Add First Roll',
                onClick: onAddRoll,
            }}
        >
            <div className="mt-6 text-sm text-gray-500">
                <p>💡 Tip: You can also import rolls from a CSV file</p>
            </div>
        </EmptyState>
    );
}

export function EmptyCatalogsState({ onAddCatalog }: { onAddCatalog: () => void }) {
    return (
        <EmptyState
            icon="📚"
            title="No catalogs found"
            description="Create your first catalog to organize fabric types and materials."
            action={{
                label: '+ Create Catalog',
                onClick: onAddCatalog,
            }}
        >
            <div className="mt-6 text-sm text-gray-500">
                <p>💡 Catalogs help you categorize fabrics by type, material, or supplier</p>
            </div>
        </EmptyState>
    );
}

export function EmptySearchState({ searchQuery, onClear }: { searchQuery: string; onClear: () => void }) {
    return (
        <EmptyState
            icon="🔍"
            title={`No results for "${searchQuery}"`}
            description="Try adjusting your search terms or filters."
            action={{
                label: 'Clear Search',
                onClick: onClear,
            }}
        />
    );
}

export function EmptyFilteredState({ onClearFilters }: { onClearFilters: () => void }) {
    return (
        <EmptyState
            icon="🎯"
            title="No items match your filters"
            description="Try removing some filters to see more results."
            action={{
                label: 'Clear All Filters',
                onClick: onClearFilters,
            }}
        />
    );
}

export function EmptyUsersState({ onInviteUser }: { onInviteUser: () => void }) {
    return (
        <EmptyState
            icon="👥"
            title="No users yet"
            description="Invite team members to collaborate on inventory management."
            action={{
                label: '+ Invite User',
                onClick: onInviteUser,
            }}
        />
    );
}

export function NoPermissionState() {
    return (
        <EmptyState
            icon="🔒"
            title="Access Restricted"
            description="You don't have permission to view this content. Contact your administrator if you need access."
        />
    );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <EmptyState
            icon="⚠️"
            title="Something went wrong"
            description="We couldn't load this content. Please try again."
            action={{
                label: 'Retry',
                onClick: onRetry,
            }}
        />
    );
}
