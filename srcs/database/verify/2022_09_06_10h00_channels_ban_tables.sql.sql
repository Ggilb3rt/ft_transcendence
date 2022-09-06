-- Verify transcendance:2022_09_06_10h00_channels_ban_tables.sql on pg

BEGIN;

SELECT * FROM channels;
SELECT * FROM ban_users;
SELECT * FROM ban_channels;

ROLLBACK;
