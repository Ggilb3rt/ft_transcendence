-- Deploy transcendance:2022_09_06_15h50_create_roles.sql to pg

BEGIN;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE ROLE unlogged noinherit;

GRANT USAGE ON SCHEMA transcendance TO unlogged;
GRANT SELECT, UPDATE ON TABLE users TO unlogged;
CREATE POLICY unlogged_users_select_policy
  ON users FOR SELECT TO unlogged USING (true);
CREATE POLICY unlogged_users_update_policy
  ON users FOR UPDATE TO unlogged USING (true);

CREATE ROLE logged IN ROLE team;

COMMIT;
