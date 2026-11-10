create table pricing_surveys
(
    id         uuid         not null primary key,
    country    varchar(255) not null,
    city       varchar(255) not null,
    currency   varchar(255) not null,
    created_at timestamp    not null
);

alter table pricing_orders add survey_id uuid references pricing_surveys (id);

create index idx_pricing_orders_survey_id on pricing_orders (survey_id);
