alter table import_data add column parsing_status varchar(32) not null default 'CREATED';

alter table import_data drop column progress;

alter table import_data add column failed_entries jsonb not null default '[]';

