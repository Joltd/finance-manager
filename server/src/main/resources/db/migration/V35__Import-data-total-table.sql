create table import_data_total(
    id uuid primary key,
    import_data_id uuid not null,
    type varchar(255) not null,
    date date,
    amount_value numeric not null,
    amount_currency varchar(255) not null,
    foreign key (import_data_id) references import_data(id)
);
