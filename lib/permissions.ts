/**
 * Permission System for Fabric Inventory Management
 * Centralized role-based access control
 */

import { UserRole } from './electron-api.d';

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export type Permission =
    // Wildcard permission (all permissions)
    | '*'

    // Roll permissions
    | 'rolls:read'
    | 'rolls:create'
    | 'rolls:update'
    | 'rolls:delete'

    // Catalog permissions
    | 'catalogs:read'
    | 'catalogs:create'
    | 'catalogs:update'
    | 'catalogs:delete'

    // User permissions
    | 'users:read'
    | 'users:create'
    | 'users:update'
    | 'users:delete'

    // Report permissions
    | 'reports:read'
    | 'reports:create'
    | 'reports:export'

    // System permissions
    | 'system:settings'
    | 'system:backup'
    | 'system:restore';

// ============================================
// ROLE PERMISSION MATRIX
// ============================================

/**
 * Defines what each role can do
 * '*' means all permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // Admin: Full access to everything
    admin: ['*'],

    // Storekeeper: Can manage inventory and catalogs, view reports
    storekeeper: [
        'rolls:read',
        'rolls:create',
        'rolls:update',
        'catalogs:read',
        'catalogs:create',
        'catalogs:update',
        'reports:read',
        'reports:export',
    ],

    // Viewer: Read-only access
    viewer: [
        'rolls:read',
        'catalogs:read',
        'reports:read',
    ],
};

// ============================================
// PERMISSION CHECKING FUNCTIONS
// ============================================

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns boolean
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role];

    // Admin has all permissions
    if (rolePermissions.includes('*')) {
        return true;
    }

    return rolePermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 * @param role - User role
 * @param permissions - Array of permissions to check
 * @returns boolean
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if user has all of the specified permissions
 * @param role - User role
 * @param permissions - Array of permissions to check
 * @returns boolean
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 * @param role - User role
 * @returns Array of permissions
 */
export function getRolePermissions(role: UserRole): Permission[] {
    const permissions = ROLE_PERMISSIONS[role];

    // If admin (has '*'), return all possible permissions
    if (permissions.includes('*')) {
        return Object.keys(ROLE_PERMISSIONS).reduce((all, r) => {
            const rolePerms = ROLE_PERMISSIONS[r as UserRole];
            if (!rolePerms.includes('*')) {
                rolePerms.forEach(p => {
                    if (!all.includes(p)) all.push(p);
                });
            }
            return all;
        }, [] as Permission[]);
    }

    return permissions;
}

// ============================================
// ROUTE PROTECTION
// ============================================

/**
 * Route access configuration
 * Maps routes to required permissions
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
    '/dashboard': [], // Everyone can access
    '/rolls': ['rolls:read'],
    '/rolls/add': ['rolls:create'],
    '/rolls/[barcode]': ['rolls:read'],
    '/catalogs': ['catalogs:read'],
    '/catalogs/add': ['catalogs:create'],
    '/catalogs/[id]': ['catalogs:read'],
    '/catalogs/[id]/edit': ['catalogs:update'],
    '/settings/users': ['users:read'],
    '/settings': ['users:read'], // Roles page
    '/reports': ['reports:read'],
    '/profile': [], // Everyone can access own profile
};

/**
 * Check if user can access a route
 * @param role - User role
 * @param route - Route path
 * @returns boolean
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
    const requiredPermissions = ROUTE_PERMISSIONS[route];

    // If route not in config or no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
    }

    // User must have at least one of the required permissions
    return hasAnyPermission(role, requiredPermissions);
}

// ============================================
// UI ELEMENT VISIBILITY
// ============================================

/**
 * Sidebar menu item visibility based on role
 */
export const SIDEBAR_MENU_ROLES: Record<string, UserRole[]> = {
    'Dashboard': ['admin', 'storekeeper', 'viewer'],
    'Rolls': ['admin', 'storekeeper', 'viewer'],
    'Add Roll': ['admin', 'storekeeper'],
    'Catalogs': ['admin', 'storekeeper'],
    'Users': ['admin'],
    'Roles': ['admin'],
    'Reports': ['admin', 'storekeeper'],
    'Settings': ['admin', 'storekeeper', 'viewer'],
};

/**
 * Check if sidebar menu item should be visible
 * @param role - User role
 * @param menuItem - Menu item name
 * @returns boolean
 */
export function isSidebarItemVisible(role: UserRole, menuItem: string): boolean {
    const allowedRoles = SIDEBAR_MENU_ROLES[menuItem];
    return allowedRoles ? allowedRoles.includes(role) : false;
}

// ============================================
// HUMAN-READABLE LABELS
// ============================================

export const PERMISSION_LABELS: Record<Permission, string> = {
    '*': 'All Permissions',
    'rolls:read': 'View Rolls',
    'rolls:create': 'Create Rolls',
    'rolls:update': 'Edit Rolls',
    'rolls:delete': 'Delete Rolls',
    'catalogs:read': 'View Catalogs',
    'catalogs:create': 'Create Catalogs',
    'catalogs:update': 'Edit Catalogs',
    'catalogs:delete': 'Delete Catalogs',
    'users:read': 'View Users',
    'users:create': 'Create Users',
    'users:update': 'Edit Users',
    'users:delete': 'Delete Users',
    'reports:read': 'View Reports',
    'reports:create': 'Create Reports',
    'reports:export': 'Export Reports',
    'system:settings': 'Manage Settings',
    'system:backup': 'Create Backups',
    'system:restore': 'Restore Backups',
};

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrator',
    storekeeper: 'Storekeeper',
    viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    admin: 'Full access to all system resources including user management and system settings',
    storekeeper: 'Can manage inventory, catalogs, and view reports. Cannot manage users or system settings',
    viewer: 'Read-only access to inventory, catalogs, and reports',
};
