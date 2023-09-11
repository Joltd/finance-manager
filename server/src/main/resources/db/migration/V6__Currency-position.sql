alter table currencies add column position int not null default 0;

update currencies set position = 10;
update currencies set position = 0 where name = 'USD';
update currencies set position = 1 where name = 'GEL';
update currencies set position = 2 where name = 'USDT';
update currencies set position = 3 where name = 'EUR';
