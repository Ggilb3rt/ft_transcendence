-- Revert transcendance:2022_09_06_15h50_create_roles.sql from pg

BEGIN;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

DROP POLICY unlogged_users_select_policy ON users;
DROP POLICY unlogged_users_update_policy ON users;
REVOKE USAGE ON SCHEMA transcendance FROM unlogged;
REVOKE SELECT, UPDATE ON TABLE users FROM unlogged;

DROP ROLE unlogged;

DROP ROLE logged;

COMMIT;
