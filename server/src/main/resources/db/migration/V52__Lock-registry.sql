create table if not exists int_lock (
    lock_key varchar(128) not null,
    region varchar(100) not null,
    client_id varchar(64) not null,
    created_date timestamp not null,
    primary key (lock_key, region)
);

create index if not exists idx_int_lock_created_date
    on int_lock (created_date);
