-- Phase 3: Bangla text for content (run once on a database created before Phase 3).

ALTER TABLE destinations ADD COLUMN bn JSON NULL AFTER photo_pos;
ALTER TABLE universities ADD COLUMN bn JSON NULL AFTER website_url;
ALTER TABLE intakes ADD COLUMN bn JSON NULL AFTER tba;
ALTER TABLE scholarships ADD COLUMN bn JSON NULL AFTER intake_slug;
ALTER TABLE gov_scholarships ADD COLUMN bn JSON NULL AFTER note;
ALTER TABLE programs ADD COLUMN bn JSON NULL AFTER highlights;
ALTER TABLE team ADD COLUMN bn JSON NULL AFTER on_home;
ALTER TABLE offices ADD COLUMN bn JSON NULL AFTER hours;
ALTER TABLE news ADD COLUMN bn JSON NULL AFTER status;
ALTER TABLE testimonials ADD COLUMN bn JSON NULL AFTER verified;
ALTER TABLE policies ADD COLUMN bn JSON NULL AFTER paragraphs;
