-- add raw, hint, and full fields to operations table

-- add raw column (jsonb type for storing list of strings)
alter table operations add column if not exists raw jsonb default '[]'::jsonb;

-- add hint_id column (reference to embeddings table)
alter table operations add column if not exists hint_id uuid;
alter table operations add constraint fk_operations_hint_id foreign key (hint_id) references embeddings(id);

-- add full_id column (reference to embeddings table)
alter table operations add column if not exists full_id uuid;
alter table operations add constraint fk_operations_full_id foreign key (full_id) references embeddings(id);