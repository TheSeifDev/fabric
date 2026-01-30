-- Initial Database Setup
-- Creates all tables with proper constraints and indices
-- Migration: 001_initial_setup.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'storekeeper', 'viewer')),
  status TEXT NOT NULL CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Catalogs table
CREATE TABLE IF NOT EXISTS catalogs (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  material TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('active', 'archived', 'draft')) DEFAULT 'active',
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_catalogs_code ON catalogs(code);
CREATE INDEX IF NOT EXISTS idx_catalogs_status ON catalogs(status);
CREATE INDEX IF NOT EXISTS idx_catalogs_created_by ON catalogs(created_by);

-- Rolls table
CREATE TABLE IF NOT EXISTS rolls (
  id TEXT PRIMARY KEY,
  barcode TEXT NOT NULL,
  catalog_id TEXT NOT NULL REFERENCES catalogs(id) ON DELETE RESTRICT,
  color TEXT NOT NULL,
  degree TEXT NOT NULL CHECK(degree IN ('A', 'B', 'C')),
  length_meters REAL NOT NULL CHECK(length_meters > 0 AND length_meters <= 1000),
  status TEXT NOT NULL CHECK(status IN ('in_stock', 'reserved', 'sold')) DEFAULT 'in_stock',
  location TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_rolls_barcode ON rolls(barcode);
CREATE INDEX IF NOT EXISTS idx_rolls_catalog_id ON rolls(catalog_id);
CREATE INDEX IF NOT EXISTS idx_rolls_status ON rolls(status);
CREATE INDEX IF NOT EXISTS idx_rolls_barcode_status ON rolls(barcode, status);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('create', 'update', 'delete')),
  user_id TEXT REFERENCES users(id),
  changes TEXT,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
