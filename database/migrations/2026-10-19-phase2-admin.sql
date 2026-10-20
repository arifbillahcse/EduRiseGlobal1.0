-- Phase 2: run once on a database created from an earlier schema.sql
-- (a fresh import of schema.sql already includes this).
ALTER TABLE admin_users
  ADD COLUMN password_changed_at DATETIME NULL AFTER is_active;
