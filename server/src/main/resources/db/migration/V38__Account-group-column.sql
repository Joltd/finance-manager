alter table account_groups add column deleted boolean default false;
update account_groups set deleted = false;