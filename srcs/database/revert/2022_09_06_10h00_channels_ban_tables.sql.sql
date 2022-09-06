-- Revert transcendance:2022_09_06_10h00_channels_ban_tables.sql from pg

BEGIN;

DROP TABLE channels CASCADE;
DROP TABLE ban_users CASCADE;
DROP TABLE ban_channels CASCADE;

COMMIT;
