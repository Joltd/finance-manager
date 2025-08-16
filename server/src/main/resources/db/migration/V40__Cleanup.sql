alter table currencies drop column "style";

alter table transactions drop column updated_at;

alter table import_data drop column status;
alter table import_data drop column message;
alter table import_data drop column parser;

alter table import_data_entries drop column suggested_operation;
alter table import_data_entries drop column similar_operations;
alter table import_data_entries drop column matched_category_mappings;
alter table import_data_entries drop column preparation_result;
alter table import_data_entries drop column preparation_error;
alter table import_data_entries drop column "option";
alter table import_data_entries drop column import_result;
alter table import_data_entries drop column import_error;
alter table import_data_entries drop column progress;
alter table import_data_entries drop column approved;

alter table import_data_operations drop column similar_operations;
alter table import_data_operations rename column distance to score;

drop table operation_revise_entries;
drop table operation_revises;

drop table candies;

delete from settings where name in ('turnover.last.update', 'candy.income.amount', 'candy.income.frequency.value','candy.income.frequency.unit');