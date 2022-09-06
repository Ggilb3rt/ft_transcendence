-- Verify transcendance:2022_09_06_10h21_channels_users_relations.sql on pg

BEGIN;

SELECT * FROM admins;
SELECT * FROM messages;
SELECT * FROM muted;
SELECT * FROM users_list;

ROLLBACK;
