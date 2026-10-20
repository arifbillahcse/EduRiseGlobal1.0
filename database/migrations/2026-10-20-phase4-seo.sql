-- Phase 4: optional search titles and descriptions (run once on a database created before Phase 4).
ALTER TABLE destinations ADD COLUMN seo_title VARCHAR(120) NULL AFTER tbc, ADD COLUMN seo_description VARCHAR(300) NULL AFTER seo_title;
ALTER TABLE programs ADD COLUMN seo_title VARCHAR(120) NULL AFTER highlights, ADD COLUMN seo_description VARCHAR(300) NULL AFTER seo_title;
