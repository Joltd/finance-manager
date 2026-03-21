drop index if exists idx_int_lock_created_date;
drop table if exists int_lock;

create table int_lock (
    lock_key  char(36)     not null,
    region    varchar(100) not null,
    client_id char(36),
    created_date   timestamp    not null,
    expired_after  timestamp    not null,
    constraint int_lock_pk primary key (lock_key, region)
);
