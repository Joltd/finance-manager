alter table balances add column calculation_date date;
alter table balances add column calculation_version integer;

create unique index balances_tenant_account_currency on balances(tenant, account_id, amount_currency);
