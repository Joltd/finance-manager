alter table pricing_orders add city varchar(255);

update pricing_orders set city = 'Будва';