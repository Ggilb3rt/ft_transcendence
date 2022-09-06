-- Deploy transcendance:2022_09_06_10h21_channels_users_relations.sql to pg

BEGIN;

CREATE TABLE admins (
    channel_id INT,
    admin_id INT,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    channel_id INT,
    sender_id INT,
    content TEXT NOT NULL,
    message_date TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id)REFERENCES users(id)
);

CREATE TABLE muted (
    channel_id INT,
    muted_id INT,
    mute_date TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (muted_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE users_list (
    channel_id INT,
    user_id INT,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMIT;
