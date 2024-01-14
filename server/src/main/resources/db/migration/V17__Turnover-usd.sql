drop table turnover;

delete from settings where name = 'turnover.last.update';

create table turnovers(
    id uuid primary key,
    date date not null,
    account_id uuid not null,
    amount_value numeric not null,
    amount_currency varchar(255) not null,
    amount_usd_value numeric not null,
    amount_usd_currency varchar(255) not null,
    cumulative_amount_value numeric not null,
    cumulative_amount_currency varchar(255) not null,
    cumulative_amount_usd_value numeric not null,
    cumulative_amount_usd_currency varchar(255) not null,
    foreign key (account_id) references accounts(id)
);
