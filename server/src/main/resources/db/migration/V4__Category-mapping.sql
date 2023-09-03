create table category_mappings(
    id uuid primary key,
    parser uuid not null,
    pattern varchar(255) not null,
    category_id uuid not null,
    foreign key (category_id) references accounts(id)
)