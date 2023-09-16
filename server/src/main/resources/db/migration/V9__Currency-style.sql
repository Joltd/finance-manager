alter table currencies add column style varchar(255);

update currencies set style = 'fi-us' where name = 'USD';
update currencies set style = 'fi-eu' where name = 'EUR';
update currencies set style = 'fi-ru' where name = 'RUB';
update currencies set style = 'fi-ge' where name = 'GEL';
update currencies set style = 'fi-kz' where name = 'KZT';
update currencies set style = 'fi-rs' where name = 'RSD';
update currencies set style = 'fi-tr' where name = 'TRY';
update currencies set style = 'cf-usdt' where name = 'USDT';
update currencies set style = 'cf-trx' where name = 'TRX';