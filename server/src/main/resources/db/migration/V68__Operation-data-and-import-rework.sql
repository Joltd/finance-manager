delete from import_data_operations;
delete from import_data_entries;
delete from import_data_total;
delete from import_data_day;
delete from import_data;

create table operation_data(
    id uuid primary key,
    transaction_id varchar(255),
    mcc varchar(255),
    bank_type varchar(255),
    bank_category varchar(255),
    merchant varchar(255),
    counterparty varchar(255),
    purpose varchar(255),
    raw text not null,
    hint_id uuid unique,
    foreign key (hint_id) references embeddings(id) on delete set null
);

create temporary table operation_data_migration as
select
    o.id as operation_id,
    gen_random_uuid() as operation_data_id,
    o.hint_id as old_hint_id,
    case when o.hint_id is null then null else gen_random_uuid() end as new_hint_id,
    coalesce(o.raw, '') as raw
from operations o;

insert into embeddings(id, input, vector)
select odm.new_hint_id, e.input, e.vector
from operation_data_migration odm
join embeddings e on e.id = odm.old_hint_id
where odm.new_hint_id is not null;

insert into operation_data(id, raw, hint_id)
select operation_data_id, raw, new_hint_id
from operation_data_migration;

alter table operations add column operation_data_id uuid;
update operations o
set operation_data_id = odm.operation_data_id
from operation_data_migration odm
where odm.operation_id = o.id;
alter table operations add constraint uq_operations_operation_data unique (operation_data_id);
alter table operations add constraint fk_operations_operation_data
    foreign key (operation_data_id) references operation_data(id) on delete set null;

alter table operations drop constraint if exists fk_operations_hint_id;
alter table operations drop column hint_id;
alter table operations drop column raw;

alter table import_data drop column failed_entries;
alter table import_data_day alter column date drop not null;

alter table import_data_entries drop column visible;
alter table import_data_entries add column operation_data_id uuid not null;
alter table import_data_entries add column date date;
alter table import_data_entries add column type varchar(255);
alter table import_data_entries add column amount_from_value numeric;
alter table import_data_entries add column amount_from_currency varchar(255);
alter table import_data_entries add column account_from_id uuid;
alter table import_data_entries add column amount_to_value numeric;
alter table import_data_entries add column amount_to_currency varchar(255);
alter table import_data_entries add column account_to_id uuid;
alter table import_data_entries add column description varchar(255);
alter table import_data_entries add constraint uq_import_data_entries_operation_data unique (operation_data_id);
alter table import_data_entries add constraint fk_import_data_entries_operation_data
    foreign key (operation_data_id) references operation_data(id);
alter table import_data_entries add constraint fk_import_data_entries_account_from
    foreign key (account_from_id) references accounts(id);
alter table import_data_entries add constraint fk_import_data_entries_account_to
    foreign key (account_to_id) references accounts(id);

create table import_data_suggestions(
    id uuid primary key,
    import_data_entry_id uuid not null,
    account_id uuid not null,
    description varchar(255),
    foreign key (import_data_entry_id) references import_data_entries(id) on delete cascade,
    foreign key (account_id) references accounts(id)
);

drop table import_data_operations;
drop table operation_data_migration;
