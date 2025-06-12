alter table import_data_entries add column progress boolean not null default false;
alter table import_data_entries add column approved boolean not null default false;
alter table import_data_entries add column operation_id uuid;
alter table import_data_entries add constraint fk_import_data_entries_operation foreign key (operation_id) references operations(id);