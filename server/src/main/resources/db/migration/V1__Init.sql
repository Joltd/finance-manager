create table settings(
    id uuid primary key,
    name varchar(255) not null,
    value varchar(255) not null
);

create table currencies(
    id uuid primary key,
    name varchar(255) not null,
    crypto boolean not null
);

create table accounts(
    id uuid primary key,
    name varchar(255) not null,
    type varchar(255) not null,
    deleted boolean not null default false
);

create table exchange_rates(
    id uuid primary key,
    date date not null,
    "from" varchar(255) not null,
    "to" varchar(255) not null,
    value numeric not null
);

create table operations(
    id uuid primary key,
    date date not null,
    amount_from_value numeric not null,
    amount_from_currency varchar(255) not null,
    account_from_id uuid not null,
    amount_to_value numeric not null,
    amount_to_currency varchar(255) not null,
    account_to_id uuid not null,
    foreign key (account_from_id) references accounts(id),
    foreign key (account_to_id) references accounts(id)
);

create table transactions(
    id uuid primary key,
    type varchar(255) not null,
    date date not null,
    value numeric not null,
    currency varchar(255) not null,
    account_id uuid not null,
    operation_id uuid not null,
    foreign key (account_id) references accounts(id),
    foreign key (operation_id) references operations(id)
);
