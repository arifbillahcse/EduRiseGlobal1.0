-- Phase 5: leads from the website forms (run once on a database created before Phase 5).
-- The old leads table was never written to, so it is replaced.
DROP TABLE IF EXISTS leads;
CREATE TABLE leads (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name             VARCHAR(120) NOT NULL,
  phone            VARCHAR(20) NOT NULL,                -- stored as +8801XXXXXXXXX
  email            VARCHAR(190) NULL,
  qualification    VARCHAR(60) NULL,                    -- SSC / O-levels, HSC / A-levels, Diploma ...
  country          VARCHAR(120) NULL,                   -- country chosen in the form
  interest         VARCHAR(255) NULL,                   -- what they asked about (program, university, offer)
  message          TEXT NULL,
  source           VARCHAR(40) NOT NULL,                -- Homepage form, Contact page, Enquiry form
  page             VARCHAR(255) NULL,                   -- page address the form was sent from
  status           ENUM('new','contacted','applied','converted','not_interested') NOT NULL DEFAULT 'new',
  admin_note       TEXT NULL,
  emailed_at       DATETIME NULL,                       -- when EduRise was emailed about it
  ip_hash          CHAR(64) NULL,                       -- never the raw IP
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_status (status, created_at),
  KEY idx_lead_created (created_at),
  KEY idx_lead_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE mail_queue ADD COLUMN reply_to VARCHAR(190) NULL AFTER to_email, ADD COLUMN lead_id BIGINT UNSIGNED NULL AFTER body;
