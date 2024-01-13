create table pricing_items(
    id uuid primary key,
    name varchar(255) not null,
    category varchar(255) not null,
    unit varchar(255) not null,
    default_quantity numeric not null
);

create table pricing_orders(
    id uuid primary key,
    date date not null,
    item_id uuid not null,
    price_value numeric not null,
    price_currency varchar(255) not null,
    quantity numeric not null,
    rate numeric,
    price_usd_value numeric not null,
    price_usd_currency varchar(255) not null,
    country varchar(255) not null,
    store varchar(255) not null,
    comment varchar(255),
    foreign key (item_id) references pricing_items(id)
);