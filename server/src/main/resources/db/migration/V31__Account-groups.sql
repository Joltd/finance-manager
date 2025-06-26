create table account_groups(
    id uuid primary key,
    name varchar(255) not null
);

alter table accounts
add column group_id uuid,
add constraint fk_accounts_group_id foreign key (group_id) references account_groups(id);