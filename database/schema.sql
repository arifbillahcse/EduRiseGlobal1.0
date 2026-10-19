-- EduRise Global — database schema (Phase 0)
-- Target: MySQL 8.0+ or MariaDB 10.6+, InnoDB, utf8mb4 (needed for Bangla).
-- Bangla and English text live side by side in *_en / *_bn columns.
-- Every content table shares: id, sort_order, is_visible, tbc, created_at, updated_at.
--   is_visible = 0  hides a row instead of deleting it (admin can bring it back)
--   tbc        = 1  marks information EduRise has not confirmed yet
-- Import order matters because of foreign keys; run this file top to bottom.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- System tables
-- ---------------------------------------------------------------------------

CREATE TABLE admin_users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,              -- password_hash() output, never plain text
  role            ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE login_attempts (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(190) NOT NULL,
  ip_hash         CHAR(64) NOT NULL,                  -- sha256 of IP + secret salt
  success         TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attempt_email_time (email, attempted_at),
  KEY idx_attempt_ip_time (ip_hash, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_resets (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id   INT UNSIGNED NOT NULL,
  token_hash      CHAR(64) NOT NULL,                  -- sha256 of the emailed token
  expires_at      DATETIME NOT NULL,
  used_at         DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reset_token (token_hash),
  KEY idx_reset_user (admin_user_id),
  CONSTRAINT fk_reset_user FOREIGN KEY (admin_user_id) REFERENCES admin_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mail_queue (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  to_email        VARCHAR(190) NOT NULL,
  subject         VARCHAR(255) NOT NULL,
  body            MEDIUMTEXT NOT NULL,
  status          ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  tries           TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_error      VARCHAR(500) NULL,
  send_after      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mail_pending (status, send_after)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE media (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  path            VARCHAR(255) NOT NULL,              -- relative to public_html/uploads/
  original_name   VARCHAR(255) NOT NULL,
  mime            VARCHAR(80) NOT NULL,
  size_bytes      INT UNSIGNED NOT NULL,
  width           SMALLINT UNSIGNED NULL,
  height          SMALLINT UNSIGNED NULL,
  alt_en          VARCHAR(255) NULL,
  alt_bn          VARCHAR(255) NULL,
  credit          VARCHAR(255) NULL,                  -- author + licence for free/licensed photos
  uploaded_by     INT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_media_path (path),
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settings (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key     VARCHAR(80) NOT NULL,               -- e.g. phone, whatsapp, promo_bar, facebook_url
  value_en        TEXT NULL,
  value_bn        TEXT NULL,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Content tables (shown on the website)
-- ---------------------------------------------------------------------------

CREATE TABLE destinations (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(60) NOT NULL,              -- korea, cyprus, china ...
  name_en          VARCHAR(120) NOT NULL,
  name_bn          VARCHAR(120) NULL,
  flag_code        CHAR(2) NULL,                      -- ISO code, e.g. KR
  capital          VARCHAR(120) NULL,
  airport_code     CHAR(3) NULL,
  intro_en         TEXT NULL,
  intro_bn         TEXT NULL,
  highlights_en    JSON NULL,                         -- ["...", "..."]
  highlights_bn    JSON NULL,
  requirements_en  JSON NULL,                         -- [["Academic","HSC ..."], ...]
  requirements_bn  JSON NULL,
  photo_media_id   INT UNSIGNED NULL,
  photo_credit     VARCHAR(255) NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_destination_slug (slug),
  KEY idx_destination_list (is_visible, sort_order),
  CONSTRAINT fk_destination_photo FOREIGN KEY (photo_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programs (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  destination_id   INT UNSIGNED NOT NULL,
  level            ENUM('foundation','diploma','bachelor','master','language','other') NOT NULL,
  field_en         VARCHAR(190) NOT NULL,
  field_bn         VARCHAR(190) NULL,
  duration         VARCHAR(60) NULL,
  tuition_note     VARCHAR(255) NULL,
  intake_note      VARCHAR(255) NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_program_dest (destination_id, is_visible, sort_order),
  KEY idx_program_level (level),
  CONSTRAINT fk_program_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE universities (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  destination_id   INT UNSIGNED NOT NULL,
  name             VARCHAR(190) NOT NULL,
  city             VARCHAR(120) NULL,
  website_url      VARCHAR(255) NULL,
  logo_media_id    INT UNSIGNED NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_uni_dest (destination_id, is_visible, sort_order),
  CONSTRAINT fk_uni_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE,
  CONSTRAINT fk_uni_logo FOREIGN KEY (logo_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE intakes (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  destination_id   INT UNSIGNED NOT NULL,
  month_label      VARCHAR(60) NOT NULL,              -- e.g. March, September
  deadline_note    VARCHAR(255) NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_intake_dest (destination_id, is_visible, sort_order),
  CONSTRAINT fk_intake_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE scholarships (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  destination_id   INT UNSIGNED NOT NULL,
  title_en         VARCHAR(190) NOT NULL,
  title_bn         VARCHAR(190) NULL,
  amount_note      VARCHAR(255) NULL,
  eligibility_en   TEXT NULL,
  eligibility_bn   TEXT NULL,
  link_url         VARCHAR(255) NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_scholar_dest (destination_id, is_visible, sort_order),
  CONSTRAINT fk_scholar_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gov_scholarships (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  country_name     VARCHAR(120) NOT NULL,
  title_en         VARCHAR(190) NOT NULL,
  title_bn         VARCHAR(190) NULL,
  body_en          TEXT NULL,
  body_bn          TEXT NULL,
  link_url         VARCHAR(255) NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gov_list (is_visible, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(60) NOT NULL,              -- used for leadership.html#leader-<slug>
  name             VARCHAR(120) NOT NULL,
  role_en          VARCHAR(190) NOT NULL,
  role_bn          VARCHAR(190) NULL,
  also_role        VARCHAR(190) NULL,
  bio_en           TEXT NULL,
  bio_bn           TEXT NULL,
  story_json       JSON NULL,                         -- paragraphs
  portfolio_json   JSON NULL,                         -- list items
  portfolio_label  VARCHAR(120) NULL,
  motto            VARCHAR(255) NULL,
  location         VARCHAR(120) NULL,
  photo_media_id   INT UNSIGNED NULL,
  on_home          TINYINT(1) NOT NULL DEFAULT 1,     -- 0 = only on leadership page
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_team_slug (slug),
  KEY idx_team_list (is_visible, sort_order),
  CONSTRAINT fk_team_photo FOREIGN KEY (photo_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE offices (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name_en          VARCHAR(120) NOT NULL,
  name_bn          VARCHAR(120) NULL,
  address_en       VARCHAR(500) NULL,
  address_bn       VARCHAR(500) NULL,
  phone            VARCHAR(40) NULL,
  email            VARCHAR(190) NULL,
  hours_en         VARCHAR(190) NULL,
  hours_bn         VARCHAR(190) NULL,
  map_url          VARCHAR(500) NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE news (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(190) NOT NULL,
  title_en         VARCHAR(255) NOT NULL,
  title_bn         VARCHAR(255) NULL,
  body_en          MEDIUMTEXT NULL,
  body_bn          MEDIUMTEXT NULL,
  cover_media_id   INT UNSIGNED NULL,
  status           ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at     DATETIME NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_slug (slug),
  KEY idx_news_list (status, published_at),
  CONSTRAINT fk_news_cover FOREIGN KEY (cover_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonials (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_name     VARCHAR(120) NOT NULL,
  destination_id   INT UNSIGNED NULL,
  quote_en         TEXT NOT NULL,
  quote_bn         TEXT NULL,
  photo_media_id   INT UNSIGNED NULL,
  consent_on_file  TINYINT(1) NOT NULL DEFAULT 0,     -- written consent from the student
  verified         TINYINT(1) NOT NULL DEFAULT 0,     -- real student, checked by admin
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 0,     -- hidden until checked
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_testi_public (is_visible, verified, consent_on_file, sort_order),
  CONSTRAINT fk_testi_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE SET NULL,
  CONSTRAINT fk_testi_photo FOREIGN KEY (photo_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE policies (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(60) NOT NULL,              -- privacy, terms, refund
  title_en         VARCHAR(190) NOT NULL,
  title_bn         VARCHAR(190) NULL,
  body_en          MEDIUMTEXT NULL,
  body_bn          MEDIUMTEXT NULL,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  is_visible       TINYINT(1) NOT NULL DEFAULT 1,
  tbc              TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_policy_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Leads (contact and enquiry forms)
-- ---------------------------------------------------------------------------

CREATE TABLE leads (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name             VARCHAR(120) NOT NULL,
  phone            VARCHAR(40) NULL,
  email            VARCHAR(190) NULL,
  destination_id   INT UNSIGNED NULL,
  level            VARCHAR(40) NULL,                  -- ssc, hsc, diploma, bachelor, unsure
  message          TEXT NULL,
  source_page      VARCHAR(120) NULL,
  status           ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  ip_hash          CHAR(64) NULL,                     -- never the raw IP
  admin_note       TEXT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_status (status, created_at),
  KEY idx_lead_ip_time (ip_hash, created_at),
  CONSTRAINT fk_lead_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
