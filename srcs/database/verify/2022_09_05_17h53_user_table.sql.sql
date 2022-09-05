-- Verify transcendance:2022_09_05_17h53_user_table.sql on pg

BEGIN;

SELECT * FROM users;
SELECT * FROM friends;
-- SELECT * FROM sys.indexes
-- WHERE object_id = (SELECT object_id FROM sys.objects WHERE NAME = "friends");

ROLLBACK;
