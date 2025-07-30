alter table import_data add column hidden_operations jsonb not null default '[]'::jsonb;
