create table users (
    id uuid primary key,
    name varchar(255) not null,
    login varchar(255) not null,
    password varchar(255) not null,
    role varchar(32) not null default 'user',
    deleted boolean not null default false,
    constraint users_login_uk unique (login),
    constraint users_role_chk check (role IN ('ADMIN', 'USER'))
);

create index idx_users_login on users (login);
create index idx_users_deleted on users (deleted);
