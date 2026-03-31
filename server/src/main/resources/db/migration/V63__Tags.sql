create table tags
(
    id      uuid         not null primary key,
    tenant  uuid         not null,
    name    varchar(255) not null,
    deleted boolean      not null default false
);

create table operation_tags
(
    operation_id uuid not null references operations (id),
    tag_id       uuid not null references tags (id),
    primary key (operation_id, tag_id)
);