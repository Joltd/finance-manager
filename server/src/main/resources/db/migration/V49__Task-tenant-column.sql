truncate table tasks;

alter table tasks add column tenant uuid;
