-- Revert transcendance:2022_09_05_17h53_user_table.sql from pg

BEGIN;

DROP TABLE users CASCADE;
DROP TABLE friends CASCADE;
-- DROP INDEX friends_second_user CASCADE;

COMMIT;
