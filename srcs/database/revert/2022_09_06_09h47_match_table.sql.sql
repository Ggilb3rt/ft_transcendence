-- Revert transcendance:2022_09_06_09h47_match_table.sql from pg

BEGIN;

DROP TABLE match CASCADE;

COMMIT;
