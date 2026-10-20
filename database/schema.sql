-- EduRise Global — database schema (Phase 0)
-- Target: MySQL 8.0+ or MariaDB 10.6+, InnoDB, utf8mb4 (needed for Bangla).
-- Content columns mirror public_html/js/data.js (see the note above the content tables).
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
  password_changed_at DATETIME NULL,                  -- signs out other sessions when the password changes
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
  setting_key     VARCHAR(80) NOT NULL,               -- site, rates, rates_updated, living_costs ...
  value_json      JSON NOT NULL,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Content tables (shown on the website)
-- Columns mirror the fields in public_html/js/data.js, so the pages render
-- exactly as before. Lists and nested values are JSON columns.
-- Bangla text still comes from js/i18n.js; *_bn columns arrive with the
-- admin editor, when staff start changing text.
-- ---------------------------------------------------------------------------

CREATE TABLE destinations (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,              -- korea, cyprus ... (destination.html#<slug>, /study-in-<slug>)
  name               VARCHAR(120) NOT NULL,
  code               CHAR(3) NULL,                      -- airport/city code shown on cards
  city               VARCHAR(120) NULL,
  levels             JSON NOT NULL,                     -- ["Bachelor’s", "Master’s"]
  intro              TEXT NULL,
  highlights         JSON NOT NULL,
  requirements       JSON NOT NULL,                     -- [["Academic", "HSC ..."], ...]
  extra_docs         JSON NOT NULL,
  photo_src          VARCHAR(500) NULL,
  photo_alt          VARCHAR(255) NULL,
  photo_by           VARCHAR(190) NULL,
  photo_license      VARCHAR(80) NULL,
  photo_license_url  VARCHAR(255) NULL,
  photo_page         VARCHAR(500) NULL,
  photo_pos          VARCHAR(20) NULL,
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_destination_slug (slug),
  KEY idx_destination_list (is_visible, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE universities (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,
  destination_id     INT UNSIGNED NOT NULL,
  name               VARCHAR(190) NOT NULL,
  city               VARCHAR(190) NULL,
  levels             JSON NOT NULL,
  summary            TEXT NULL,
  facts              JSON NOT NULL,                     -- [["English", "IELTS 5.5"], ...]
  website_url        VARCHAR(255) NULL,
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_uni_slug (slug),
  KEY idx_uni_dest (destination_id, is_visible, sort_order),
  CONSTRAINT fk_uni_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE intakes (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,
  destination_id     INT UNSIGNED NOT NULL,
  title              VARCHAR(255) NOT NULL,
  levels             JSON NOT NULL,
  intake             VARCHAR(60) NULL,                  -- e.g. March 2027
  round_label        VARCHAR(120) NULL,
  starts_on          DATE NULL,                         -- first day to apply (Dhaka time)
  ends_on            DATE NULL,                         -- last day to apply
  tba                TINYINT(1) NOT NULL DEFAULT 0,     -- dates not announced yet
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_intake_slug (slug),
  KEY idx_intake_dest (destination_id, is_visible, sort_order),
  CONSTRAINT fk_intake_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE scholarships (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,
  destination_id     INT UNSIGNED NOT NULL,
  university         VARCHAR(190) NOT NULL,
  levels             JSON NOT NULL,
  level_label        VARCHAR(120) NULL,                 -- e.g. Master’s (MBA)
  award              VARCHAR(190) NULL,
  condition_text     VARCHAR(255) NULL,
  intake_slug        VARCHAR(60) NULL,                  -- links to intakes.slug
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_scholar_slug (slug),
  KEY idx_scholar_dest (destination_id, is_visible, sort_order),
  CONSTRAINT fk_scholar_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gov_scholarships (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code               CHAR(2) NOT NULL,                  -- country code shown on the card
  name               VARCHAR(190) NOT NULL,
  country            VARCHAR(120) NOT NULL,
  coverage           VARCHAR(120) NULL,
  levels_text        VARCHAR(190) NULL,
  url                VARCHAR(255) NULL,
  note               VARCHAR(500) NULL,
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gov_list (is_visible, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programs (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,              -- program.html#<slug>
  destination_id     INT UNSIGNED NOT NULL,
  university         VARCHAR(190) NOT NULL,
  uni_slug           VARCHAR(60) NULL,                  -- links to universities.slug
  city               VARCHAR(190) NULL,
  title              VARCHAR(255) NOT NULL,
  levels             JSON NOT NULL,
  language           VARCHAR(120) NULL,
  duration           VARCHAR(60) NULL,
  visa               VARCHAR(60) NULL,
  english            JSON NULL,                         -- {"ielts":5.5,"text":"IELTS 5.5"} or {"none":true,...}
  cgpa               DECIMAL(3,2) NULL,
  budget             ENUM('low','mid','high') NULL,
  majors             JSON NOT NULL,
  tuition            JSON NULL,                         -- {"amount":..,"per":"semester","cur":"KRW"} or a range; NULL = ask a counsellor
  one_time           JSON NOT NULL,                     -- [["Application fee", 120000], ...]
  scholarships       JSON NOT NULL,
  intakes            JSON NOT NULL,                     -- intake slugs
  milestones         JSON NULL,
  highlights         JSON NOT NULL,
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_program_slug (slug),
  KEY idx_program_dest (destination_id, is_visible, sort_order),
  CONSTRAINT fk_program_dest FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,              -- leadership.html#leader-<slug>
  name               VARCHAR(120) NOT NULL,
  role               VARCHAR(190) NOT NULL,
  also_role          VARCHAR(190) NULL,
  location           VARCHAR(190) NULL,
  photo              VARCHAR(255) NULL,                 -- path under public_html/
  bio                TEXT NULL,
  story              JSON NULL,                         -- one string, or a list of paragraphs
  portfolio_label    VARCHAR(120) NULL,
  portfolio          JSON NULL,
  motto              VARCHAR(255) NULL,
  tags               JSON NOT NULL,
  on_home            TINYINT(1) NOT NULL DEFAULT 1,     -- 0 = only on the leadership page
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_team_slug (slug),
  KEY idx_team_list (is_visible, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE offices (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tag                VARCHAR(80) NULL,                  -- Head office, Branch ...
  country            VARCHAR(120) NOT NULL,
  name               VARCHAR(190) NOT NULL,
  address            VARCHAR(500) NULL,
  map_query          VARCHAR(255) NULL,
  phone              VARCHAR(40) NULL,
  email              VARCHAR(190) NULL,
  hours              VARCHAR(190) NULL,
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE news (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(190) NOT NULL,
  published_on       DATE NOT NULL,
  tag                VARCHAR(60) NULL,
  title              VARCHAR(255) NOT NULL,
  summary            TEXT NULL,
  body               MEDIUMTEXT NULL,
  cover_media_id     INT UNSIGNED NULL,
  status             ENUM('draft','published') NOT NULL DEFAULT 'published',
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_slug (slug),
  KEY idx_news_list (status, published_on),
  CONSTRAINT fk_news_cover FOREIGN KEY (cover_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonials (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,
  name               VARCHAR(120) NOT NULL,
  destination        VARCHAR(120) NULL,                 -- country name as shown
  university         VARCHAR(190) NULL,
  program            VARCHAR(190) NULL,
  quote              TEXT NOT NULL,
  photo_media_id     INT UNSIGNED NULL,
  consent            TINYINT(1) NOT NULL DEFAULT 0,     -- written consent from the student is on file
  verified           TINYINT(1) NOT NULL DEFAULT 0,     -- real student, checked by an admin
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 0,     -- hidden until checked
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_testi_slug (slug),
  KEY idx_testi_public (is_visible, verified, consent, sort_order),
  CONSTRAINT fk_testi_photo FOREIGN KEY (photo_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE policies (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(60) NOT NULL,              -- privacy, terms, disclaimer
  title              VARCHAR(190) NOT NULL,
  paragraphs         JSON NOT NULL,
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_visible         TINYINT(1) NOT NULL DEFAULT 1,
  tbc                TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  interest         VARCHAR(190) NULL,
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
