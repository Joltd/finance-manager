-- V40__Cleanup.sql drops import_data_operations.similar_operations, but no migration
-- ever added that column to this table (it only ever existed on import_data_entries,
-- which V40 handles correctly a few lines above) - so V40 fails on any environment
-- that runs migrations from scratch. This runs before V40 (out-of-order is enabled)
-- to recreate the column so V40's drop succeeds, without editing the existing V40 file.
alter table import_data_operations add column if not exists similar_operations jsonb;
