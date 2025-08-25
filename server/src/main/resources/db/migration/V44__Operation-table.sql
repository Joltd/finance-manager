alter table operations drop constraint if exists fk_operations_full_id;

alter table operations drop column if exists full_id;