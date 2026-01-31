-- Migration: Add Soft Delete Support and Barcode Uniqueness Constraint
-- Date: 2026-01-31
-- Purpose: Add deletedAt/deletedBy columns to support soft delete, and enforce barcode uniqueness for active rolls

-- Add soft delete columns to catalogs table
ALTER TABLE catalogs ADD COLUMN deleted_at INTEGER;
ALTER TABLE catalogs ADD COLUMN deleted_by TEXT REFERENCES users(id);

-- Add soft delete columns to rolls table
ALTER TABLE rolls ADD COLUMN deleted_at INTEGER;
ALTER TABLE rolls ADD COLUMN deleted_by TEXT REFERENCES users(id);

-- Create indexes for soft delete columns (improves query performance)
CREATE INDEX IF NOT EXISTS idx_catalogs_deleted_at ON catalogs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_rolls_deleted_at ON rolls(deleted_at);

-- Create partial unique index to enforce barcode uniqueness for active rolls only
-- This allows barcode reuse ONLY when previous roll is deleted (deletedAt IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rolls_unique_active_barcode 
    ON rolls(barcode) 
    WHERE deleted_at IS NULL;

-- Note: The constraint allows the same barcode to be used multiple times,
-- but only one roll with that barcode can be active (not deleted) at any time.
-- This implements the business rule: "Barcode can be reused only after previous roll is sold/deleted"
