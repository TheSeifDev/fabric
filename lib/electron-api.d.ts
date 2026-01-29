/**
 * TypeScript type definitions for Electron IPC API
 * This file provides type safety for the window.electronAPI bridge
 */

// ============================================
// COMMON TYPES
// ============================================

export interface AuditFields {
    createdAt: number;
    createdBy: string;
    updatedAt: number;
    updatedBy: string;
    deletedAt: number | null;
    deletedBy: string | null;
}

export type UUID = string;
export type Timestamp = number;

// ============================================
// ROLL TYPES
// ============================================

export type RollStatus = 'in_stock' | 'reserved' | 'sold';
export type RollDegree = 'A' | 'B' | 'C';

export interface Roll extends AuditFields {
    id: UUID;
    barcode: string;
    catalogId: UUID;
    color: string;
    degree: RollDegree;
    lengthMeters: number;
    status: RollStatus;
    location: string | null;
}

export interface CreateRollDTO {
    barcode: string;
    catalogId: UUID;
    color: string;
    degree: RollDegree;
    lengthMeters: number;
    location?: string;
    status?: RollStatus;
}

export interface UpdateRollDTO {
    barcode?: string;
    catalogId?: UUID;
    color?: string;
    degree?: RollDegree;
    lengthMeters?: number;
    location?: string;
    status?: RollStatus;
}

export interface RollFilters {
    catalog?: UUID;
    color?: string;
    degree?: RollDegree;
    status?: RollStatus;
}

// ============================================
// CATALOG TYPES
// ============================================

export type CatalogStatus = 'active' | 'archived' | 'draft';

export interface Catalog extends AuditFields {
    id: UUID;
    code: string;
    name: string;
    material: string;
    description: string;
    status: CatalogStatus;
    image?: string;
}

export interface CreateCatalogDTO {
    code: string;
    name: string;
    material: string;
    description: string;
    status?: CatalogStatus;
    image?: string;
}

export interface UpdateCatalogDTO {
    name?: string;
    material?: string;
    description?: string;
    status?: CatalogStatus;
    image?: string;
}

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'admin' | 'storekeeper' | 'viewer';
export type UserStatus = 'active' | 'inactive';

export interface User extends AuditFields {
    id: UUID;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    lastLogin?: Timestamp;
    // passwordHash is never exposed to renderer
}

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
}

export interface UpdateUserDTO {
    name?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout';
export type EntityType = 'roll' | 'catalog' | 'user' | 'setting';

export interface AuditLog {
    id: UUID;
    userId: UUID;
    action: AuditAction;
    entityType: EntityType;
    entityId: UUID;
    oldValues: string | null; // JSON string
    newValues: string | null; // JSON string
    timestamp: Timestamp;
}

export interface AuditLogOptions {
    page?: number;
    pageSize?: number;
    entityType?: EntityType;
    userId?: UUID;
    startDate?: Timestamp;
    endDate?: Timestamp;
}

export interface PaginatedAuditLogs {
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================
// REPORT TYPES
// ============================================

export interface ReportOptions {
    startDate?: Timestamp;
    endDate?: Timestamp;
    catalogs?: UUID[];
    users?: UUID[];
}

export interface ReportData {
    id: UUID;
    type: string;
    generatedAt: Timestamp;
    data: unknown;
}

// ============================================
// SYSTEM TYPES
// ============================================

export interface SystemInfo {
    version: string;
    platform: string;
    electron: string;
    chrome: string;
    node: string;
}

export interface SystemSettings {
    companyName: string;
    currency: string;
    units: 'meters' | 'yards';
    autoBackup: boolean;
    backupPath?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface APISuccess<T> {
    success: true;
    data: T;
}

export interface APIError {
    success: false;
    error: {
        message: string;
        code: string;
        statusCode: number;
    };
}

export type APIResponse<T> = APISuccess<T> | APIError;

// ============================================
// ELECTRON API INTERFACE
// ============================================

export interface ElectronAPI {
    // Rolls API
    rolls: {
        getAll: (filters?: RollFilters) => Promise<APIResponse<Roll[]>>;
        getById: (id: UUID) => Promise<APIResponse<Roll>>;
        findByBarcode: (barcode: string) => Promise<APIResponse<Roll | null>>;
        create: (data: CreateRollDTO) => Promise<APIResponse<Roll>>;
        update: (id: UUID, data: UpdateRollDTO) => Promise<APIResponse<Roll>>;
        delete: (id: UUID) => Promise<APIResponse<null>>;
        search: (query: string) => Promise<APIResponse<Roll[]>>;
    };

    // Catalogs API
    catalogs: {
        getAll: () => Promise<APIResponse<Catalog[]>>;
        getById: (id: UUID) => Promise<APIResponse<Catalog>>;
        create: (data: CreateCatalogDTO) => Promise<APIResponse<Catalog>>;
        update: (id: UUID, data: UpdateCatalogDTO) => Promise<APIResponse<Catalog>>;
        delete: (id: UUID) => Promise<APIResponse<null>>;
        getRollsCount: (id: UUID) => Promise<APIResponse<number>>;
    };

    // Users API
    users: {
        getAll: () => Promise<APIResponse<User[]>>;
        getById: (id: UUID) => Promise<APIResponse<User>>;
        create: (data: CreateUserDTO) => Promise<APIResponse<User>>;
        update: (id: UUID, data: UpdateUserDTO) => Promise<APIResponse<User>>;
        delete: (id: UUID) => Promise<APIResponse<null>>;
        updatePassword: (
            userId: UUID,
            oldPassword: string,
            newPassword: string
        ) => Promise<APIResponse<null>>;
    };

    // Auth API
    auth: {
        login: (email: string, password: string) => Promise<APIResponse<{ user: User; token: string }>>;
        logout: () => Promise<APIResponse<null>>;
        getCurrentUser: () => Promise<APIResponse<User | null>>;
        checkPermission: (permission: string) => Promise<APIResponse<boolean>>;
    };

    // Reports API
    reports: {
        generateInventory: (options: ReportOptions) => Promise<APIResponse<ReportData>>;
        generateSales: (options: ReportOptions) => Promise<APIResponse<ReportData>>;
        generateUserActivity: (options: ReportOptions) => Promise<APIResponse<ReportData>>;
        exportToPDF: (reportId: UUID) => Promise<APIResponse<string>>;
        exportToCSV: (reportId: UUID) => Promise<APIResponse<string>>;
    };

    // System API
    system: {
        getInfo: () => Promise<APIResponse<SystemInfo>>;
        createBackup: () => Promise<APIResponse<string>>;
        restoreBackup: (backupPath: string) => Promise<APIResponse<null>>;
        getSettings: () => Promise<APIResponse<SystemSettings>>;
        updateSettings: (settings: Partial<SystemSettings>) => Promise<APIResponse<null>>;
    };

    // Audit Log API
    auditLog: {
        getLogs: (options?: AuditLogOptions) => Promise<APIResponse<PaginatedAuditLogs>>;
        getByEntity: (entityType: EntityType, entityId: UUID) => Promise<APIResponse<AuditLog[]>>;
    };
}

// ============================================
// GLOBAL TYPE DECLARATIONS
// ============================================

declare global {
    interface Window {
        electronAPI: ElectronAPI;
        process: {
            platform: string;
            versions: {
                node: string;
                chrome: string;
                electron: string;
            };
        };
    }
}

export { };
