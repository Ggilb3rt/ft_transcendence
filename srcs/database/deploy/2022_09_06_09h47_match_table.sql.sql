-- Deploy transcendance:2022_09_06_09h47_match_table.sql to pg

BEGIN;

CREATE TABLE match (
    id SERIAL PRIMARY KEY,
    player_left_id INT,
    player_right_id INT,
    score_left INT,
    score_right INT,
    FOREIGN KEY (player_left_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player_right_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMIT;
