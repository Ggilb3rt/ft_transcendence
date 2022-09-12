-- Deploy transcendance:2022_09_06_10h00_channels_ban_tables.sql to pg

BEGIN;

CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    need_pass BOOLEAN,
    pass TEXT,
    is_public BOOLEAN,
    chan_owner INT,
    FOREIGN KEY (chan_owner) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ban_users (
    id SERIAL PRIMARY KEY,
    user_id INT,
    banned_id INT,
    ban_begin TIMESTAMPTZ,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (banned_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ban_channels (
    id SERIAL PRIMARY KEY,
    user_id INT,
    banned_id INT,
    ban_begin TIMESTAMPTZ,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (banned_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMIT;
