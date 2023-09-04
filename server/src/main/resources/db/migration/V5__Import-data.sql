create table import_data(
    id uuid primary key,
    parser uuid not null,
    account_id uuid not null,
    status varchar(255) not null,
    message varchar(255),
    progress numeric not null default 0,
    foreign key (account_id) references accounts(id)
);

create table import_data_entries(
    id uuid primary key,
    import_data_id uuid not null,
    parsed_entry jsonb not null,
    suggested_operation jsonb,
    similar_operations jsonb,
    matched_category_mappings jsonb,
    preparation_result boolean not null default false,
    preparation_error varchar(255),
    option varchar(255) default 'NONE',
    import_result varchar(255) default 'NOT_IMPORTED',
    import_error varchar(255),
    foreign key (import_data_id) references import_data(id)
);