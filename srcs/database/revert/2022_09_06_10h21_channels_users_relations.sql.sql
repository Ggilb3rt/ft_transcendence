-- Revert transcendance:2022_09_06_10h21_channels_users_relations.sql from pg

BEGIN;

DROP TABLE admins CASCADE;
DROP TABLE messages CASCADE;
DROP TABLE muted CASCADE;
DROP TABLE users_list CASCADE;

COMMIT;
