create table tasks (
    id uuid primary key,
    bean varchar(255) not null,
    method varchar(255) not null,
    key varchar(255) not null,
    version bigint not null default 0,
    progress boolean not null default false,
    payload jsonb not null default '{}',
    started_at timestamp,
    constraint uk_tasks_bean_method_key_progress unique (bean, method, key, progress)
);
