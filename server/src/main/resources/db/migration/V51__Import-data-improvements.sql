delete from import_data_operations;
delete from import_data_entries;
delete from import_data_total;
delete from import_data;

create table import_data_day(
    id uuid primary key,
    import_data_id uuid not null,
    date date not null,
    valid boolean not null default false,
    foreign key (import_data_id) references import_data(id)
);

alter table import_data_total add column import_data_day_id uuid;
alter table import_data_total add foreign key (import_data_day_id) references import_data_day(id);
alter table import_data_total drop column type;
alter table import_data_total drop column date;
alter table import_data_total drop column amount_value;
alter table import_data_total drop column amount_currency;
alter table import_data_total add column parsed_value numeric not null default 0;
alter table import_data_total add column parsed_currency varchar(255) not null default '';
alter table import_data_total add column operation_value numeric not null default 0;
alter table import_data_total add column operation_currency varchar(255) not null default '';
alter table import_data_total add column suggested_value numeric not null default 0;
alter table import_data_total add column suggested_currency varchar(255) not null default '';
alter table import_data_total add column actual_value numeric not null default 0;
alter table import_data_total add column actual_currency varchar(255) not null default '';
alter table import_data_total add column currency varchar(255) not null default '';
alter table import_data_total add column valid boolean not null default false;

alter table import_data_entries add column import_data_day_id uuid not null;
alter table import_data_entries add foreign key (import_data_day_id) references import_data_day(id);
alter table import_data_entries drop column import_data_id;
