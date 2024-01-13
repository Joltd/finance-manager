create table candies(
    id uuid primary key,
    date date not null,
    direction varchar(255) not null,
    amount_value numeric not null,
    amount_currency varchar(255) not null,
    amount_usd_value numeric not null,
    amount_usd_currency varchar(255) not null,
    comment varchar(1024)
)