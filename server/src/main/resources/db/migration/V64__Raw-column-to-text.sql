-- Migrate raw column from jsonb (array) to text in import_data_operations
alter table import_data_operations
    alter column raw type text using coalesce(raw->>0, '');

alter table import_data_operations
    alter column raw set not null,
    alter column raw set default '';

-- Migrate raw column from jsonb (array) to text in operations
alter table operations
    alter column raw type text using coalesce(raw->>0, '');

alter table operations
    alter column raw set not null,
    alter column raw set default '';
