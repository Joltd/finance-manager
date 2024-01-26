create table taxes(
    id uuid primary key,
    date date not null,
    base_value numeric not null,
    base_currency varchar(255) not null,
    rate numeric not null,
    amount_value numeric not null,
    amount_currency varchar(255) not null
);