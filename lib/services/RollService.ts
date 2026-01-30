/**
 * Roll Service (Database-Enabled)
 * Handles all roll-related business logic with direct database access
 */

import type { Roll, CreateRollDTO, UpdateRollDTO, RollFilters } from '@/lib/electron-api.d';
import { NotFoundError, ConflictError, ValidationError, DatabaseError } from '@/lib/errors';
import {
    validateRollCreate,
    validateRollUpdate,
    validateBarcodeAvailable,
    validateStatusTransition,
} from '@/lib/business-rules';
import { getRollRepository, getAuditRepository, type RollFilters as DBRollFilters } from '@/database/repositories';
import type { NewRoll } from '@/database/schema';
import { generateUUID } from '@/lib/utils';

class RollService {
    private rollRepo = getRollRepository();
    private auditRepo = getAuditRepository();

    /**
     * Get all rolls with optional filters
     */
    async getAll(filters?: RollFilters): Promise<Roll[]> {
        try {
            // Convert API filters to DB filters
            const dbFilters: DBRollFilters = {
                catalogId: filters?.catalog,
                status: filters?.status,
                degree: filters?.degree,
                color: filters?.color,
                search: filters?.search,
            };

            const rolls = this.rollRepo.findAll(dbFilters);

            // Convert DB rolls to API format
            return rolls.map(this.mapToAPI);
        } catch (error) {
            console.error('RollService.getAll error:', error);
            throw new DatabaseError('Failed to fetch rolls');
        }
    }

    /**
     * Get a single roll by ID
     */
    async getById(id: string): Promise<Roll> {
        try {
            const roll = this.rollRepo.findById(id);

            if (!roll) {
                throw new NotFoundError('Roll', id);
            }

            return this.mapToAPI(roll);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('RollService.getById error:', error);
            throw new DatabaseError('Failed to fetch roll');
        }
    }

    /**
     * Get a roll by barcode
     */
    async getByBarcode(barcode: string): Promise<Roll | null> {
        try {
            const roll = this.rollRepo.findActiveByBarcode(barcode);
            return roll ? this.mapToAPI(roll) : null;
        } catch (error) {
            console.error('RollService.getByBarcode error:', error);
            throw new DatabaseError('Failed to fetch roll by barcode');
        }
    }

    /**
     * Create a new roll
     */
    async create(data: CreateRollDTO, userId?: string): Promise<Roll> {
        try {
            // 1. Validate roll data
            validateRollCreate(data);

            // 2. Check if barcode is available in DB
            if (!this.rollRepo.isBarcodeAvailable(data.barcode)) {
                throw new ConflictError(
                    `Barcode ${data.barcode} is already in use by an active roll`,
                    'barcode'
                );
            }

            // 4. Create roll in database
            const now = new Date();
            const newRoll: NewRoll = {
                id: generateUUID(),
                barcode: data.barcode,
                catalogId: data.catalogId,
                color: data.color,
                degree: data.degree,
                lengthMeters: data.lengthMeters,
                status: data.status || 'in_stock',
                location: data.location || null,
                createdAt: now,
                updatedAt: now,
                createdBy: userId || null,
                updatedBy: userId || null,
            };

            const created = this.rollRepo.create(newRoll);

            // 5. Audit log
            if (userId) {
                this.auditRepo.logCreate('roll', created.id, userId, data);
            }

            return this.mapToAPI(created);
        } catch (error) {
            if (error instanceof ConflictError || error instanceof ValidationError) {
                throw error;
            }
            console.error('RollService.create error:', error);
            throw new DatabaseError('Failed to create roll');
        }
    }

    /**
     * Update a roll
     */
    async update(id: string, data: UpdateRollDTO, userId?: string): Promise<Roll> {
        try {
            // 1. Get existing roll
            const existing = this.rollRepo.findById(id);
            if (!existing) {
                throw new NotFoundError('Roll', id);
            }

            // 2. Validate status transition if status is being updated
            if (data.status && data.status !== existing.status) {
                validateStatusTransition(existing.status, data.status);
            }

            // 4. Check barcode availability if barcode is being changed
            if (data.barcode && data.barcode !== existing.barcode) {
                if (!this.rollRepo.isBarcodeAvailable(data.barcode, id)) {
                    throw new ConflictError(
                        `Barcode ${data.barcode} is already in use by another active roll`,
                        'barcode'
                    );
                }
            }

            // 5. Update roll in database
            const updateData: Partial<NewRoll> = {
                ...(data.barcode && { barcode: data.barcode }),
                ...(data.catalogId && { catalogId: data.catalogId }),
                ...(data.color && { color: data.color }),
                ...(data.degree && { degree: data.degree }),
                ...(data.lengthMeters !== undefined && { lengthMeters: data.lengthMeters }),
                ...(data.status && { status: data.status }),
                ...(data.location !== undefined && { location: data.location || null }),
                updatedBy: userId || null,
            };

            const updated = this.rollRepo.update(id, updateData);

            // 6. Audit log
            if (userId) {
                this.auditRepo.logUpdate('roll', id, userId, data);
            }

            return this.mapToAPI(updated);
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof ValidationError) {
                throw error;
            }
            console.error('RollService.update error:', error);
            throw new DatabaseError('Failed to update roll');
        }
    }

    /**
     * Delete a roll
     */
    async delete(id: string, userId?: string): Promise<void> {
        try {
            // 1. Get existing roll for audit
            const existing = this.rollRepo.findById(id);
            if (!existing) {
                throw new NotFoundError('Roll', id);
            }

            // 2. Delete from database
            this.rollRepo.delete(id);

            // 3. Audit log
            if (userId) {
                this.auditRepo.logDelete('roll', id, userId, existing);
            }
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('RollService.delete error:', error);
            throw new DatabaseError('Failed to delete roll');
        }
    }

    /**
     * Get inventory summary
     */
    async getInventorySummary() {
        try {
            return this.rollRepo.getInventorySummary();
        } catch (error) {
            console.error('RollService.getInventorySummary error:', error);
            throw new DatabaseError('Failed to get inventory summary');
        }
    }

    /**
     * Get all unique colors
     */
    async getColors(): Promise<string[]> {
        try {
            return this.rollRepo.getAllColors();
        } catch (error) {
            console.error('RollService.getColors error:', error);
            throw new DatabaseError('Failed to get colors');
        }
    }

    /**
     * Map database roll to API format
     */
    private mapToAPI(roll: any): Roll {
        return {
            id: roll.id,
            barcode: roll.barcode,
            catalogId: roll.catalogId,
            color: roll.color,
            degree: roll.degree,
            lengthMeters: roll.lengthMeters,
            status: roll.status,
            location: roll.location,
            createdAt: roll.createdAt instanceof Date ? roll.createdAt.getTime() : roll.createdAt,
            updatedAt: roll.updatedAt instanceof Date ? roll.updatedAt.getTime() : roll.updatedAt,
            createdBy: roll.createdBy || '',
            updatedBy: roll.updatedBy || '',
            deletedAt: roll.deletedAt ? (roll.deletedAt instanceof Date ? roll.deletedAt.getTime() : roll.deletedAt) : null,
            deletedBy: roll.deletedBy || null,
        };
    }
}

// Export singleton instance
export const rollService = new RollService();
export default rollService;
