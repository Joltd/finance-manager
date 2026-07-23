create table filter_presets
(
    id         uuid         not null primary key,
    tenant     uuid         not null,
    preset_key varchar(255) not null,
    name       varchar(255) not null,
    filter     jsonb        not null default '{}'
);

create index idx_filter_presets_preset_key on filter_presets (tenant, preset_key);
