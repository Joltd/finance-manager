create table exchange_rate (
    id uuid primary key,
    currency varchar(255) not null,
    value numeric not null,
    updated_at timestamp
);

create table exchange_rate_history (
    id uuid primary key,
    date date not null,
    currency varchar(255) not null,
    value numeric not null
);
