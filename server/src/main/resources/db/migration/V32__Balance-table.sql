create table balances(
    id uuid primary key,
    date date not null,
    account_id uuid not null,
    amount_value numeric not null,
    amount_currency varchar(255) not null,
    next_date date,
    progress boolean not null default false,
    foreign key (account_id) references accounts(id)
);
