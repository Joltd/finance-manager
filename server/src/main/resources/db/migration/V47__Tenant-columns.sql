alter table if exists settings add column tenant uuid;
alter table if exists currencies add column tenant uuid;
alter table if exists accounts add column tenant uuid;
alter table if exists account_groups add column tenant uuid;
alter table if exists balances add column tenant uuid;
alter table if exists turnovers add column tenant uuid;
alter table if exists import_data add column tenant uuid;
alter table if exists operations add column tenant uuid;
alter table if exists transactions add column tenant uuid;

alter table users add column tenant uuid;