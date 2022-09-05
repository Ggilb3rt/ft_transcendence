-- Deploy transcendance:2022_09_05_17h53_user_table.sql to pg

BEGIN;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    ranking INT,
    wins INT,
    loses INT,
    two_factor_auth BOOLEAN
);

CREATE TABLE friends (
    first_user INT NOT NULL,
    second_user INT NOT NULL,
    PRIMARY KEY (first_user, second_user),
    CHECK (first_user < second_user)
);

-- CREATE INDEX friends_second_user ON friends(second_user);

COMMIT;
