create table operation_revises(
    id uuid primary key,
    date_from date,
    date_to date,
    currency varchar(255),
    account_id uuid not null,
    parser uuid not null,
    dates jsonb not null,
    foreign key (account_id) references accounts(id)
);

create table operation_revise_entries(
    id uuid primary key,
    operation_revise_id uuid not null,
    date date not null,
    operation_id uuid,
    parsed_entry jsonb,
    foreign key (operation_revise_id) references operation_revises(id)
);