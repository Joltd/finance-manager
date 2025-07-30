ALTER TABLE import_data DROP COLUMN progress;
ALTER TABLE import_data ADD COLUMN progress boolean NOT NULL DEFAULT false;
