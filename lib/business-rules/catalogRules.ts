/**
 * Business Rules - Catalog Management
 * Enforces business logic for catalog operations
 */

import type { Catalog, CreateCatalogDTO, UpdateCatalogDTO } from '@/lib/electron-api';
import { BusinessError, ConflictError } from '@/lib/errors';

/**
 * Check if a catalog can be deleted
 * @throws BusinessError if catalog has active rolls
 */
export function validateCatalogDelete(catalog: Catalog, rollCount: number): void {
    if (rollCount > 0) {
        throw new BusinessError(
            `Cannot delete catalog "${catalog.name}": ${rollCount} roll(s) still reference this catalog. Please remove or reassign all rolls before deleting the catalog.`,
            'CATALOG_HAS_ROLLS',
            {
                catalogId: catalog.id,
                catalogName: catalog.name,
                rollCount,
            }
        );
    }
}

/**
 * Validate catalog code uniqueness
 * @throws ConflictError if code is already in use
 */
export function validateCatalogCodeUnique(
    code: string,
    existingCatalogs: Catalog[],
    excludeCatalogId?: string
): void {
    const existingCatalog = existingCatalogs.find(
        c => c.code.toLowerCase() === code.toLowerCase() && c.id !== excludeCatalogId
    );

    if (existingCatalog) {
        throw new ConflictError(
            `Catalog code "${code}" is already in use by catalog "${existingCatalog.name}" (ID: ${existingCatalog.id})`
        );
    }
}

/**
 * Validate catalog creation data
 */
export function validateCatalogCreate(data: CreateCatalogDTO): void {
    // Validate code format
    if (data.code.trim().length < 2) {
        throw new BusinessError(
            'Catalog code must be at least 2 characters long',
            'INVALID_CATALOG_CODE'
        );
    }

    // Validate code contains only alphanumeric and hyphens
    const validCodePattern = /^[A-Za-z0-9-]+$/;
    if (!validCodePattern.test(data.code)) {
        throw new BusinessError(
            'Catalog code can only contain letters, numbers, and hyphens',
            'INVALID_CATALOG_CODE_FORMAT',
            { code: data.code }
        );
    }

    // Validate name
    if (data.name.trim().length < 2) {
        throw new BusinessError(
            'Catalog name must be at least 2 characters long',
            'INVALID_CATALOG_NAME'
        );
    }

    // Validate material
    if (data.material.trim().length < 2) {
        throw new BusinessError(
            'Material description must be at least 2 characters long',
            'INVALID_MATERIAL'
        );
    }
}

/**
 * Validate catalog update data
 */
export function validateCatalogUpdate(
    currentCatalog: Catalog,
    updates: UpdateCatalogDTO,
    hasRolls: boolean
): void {
    // Prevent archiving catalogs with active rolls
    if (updates.status === 'archived' && hasRolls) {
        throw new BusinessError(
            'Cannot archive catalog with active rolls. Please remove or sell all rolls first.',
            'CANNOT_ARCHIVE_WITH_ROLLS',
            { catalogId: currentCatalog.id, catalogName: currentCatalog.name }
        );
    }

    // Validate name if being updated
    if (updates.name && updates.name.trim().length < 2) {
        throw new BusinessError(
            'Catalog name must be at least 2 characters long',
            'INVALID_CATALOG_NAME'
        );
    }

    // Validate material if being updated
    if (updates.material && updates.material.trim().length < 2) {
        throw new BusinessError(
            'Material description must be at least 2 characters long',
            'INVALID_MATERIAL'
        );
    }
}

/**
 * Get catalog statistics
 */
export function calculateCatalogStats(catalogs: Catalog[]): {
    total: number;
    byStatus: Record<Catalog['status'], number>;
} {
    const byStatus: Record<Catalog['status'], number> = {
        active: 0,
        archived: 0,
        draft: 0,
    };

    for (const catalog of catalogs) {
        byStatus[catalog.status]++;
    }

    return {
        total: catalogs.length,
        byStatus,
    };
}

/**
 * Check if catalog status allows modifications
 */
export function canModifyCatalog(catalog: Catalog): boolean {
    // Archived catalogs should have limited modifications
    return catalog.status !== 'archived';
}

/**
 * Recommend catalog code based on name
 * Helper function for UI - generates suggested code from name
 */
export function suggestCatalogCode(name: string): string {
    return name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
}
