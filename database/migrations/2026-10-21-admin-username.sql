-- Admin sign-in with a username (run once on a database created before this change).
-- Existing accounts keep signing in with their email until a username is set in Admin → Users.
ALTER TABLE admin_users
  ADD COLUMN username VARCHAR(40) NULL AFTER name,
  ADD UNIQUE KEY uq_admin_username (username);
