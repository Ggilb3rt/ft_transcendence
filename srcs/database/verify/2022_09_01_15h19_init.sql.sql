-- Verify transcendance:2022_09_01_15h19_init.sql on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.schemata WHERE schema_name = 'transcendance';

ROLLBACK;
