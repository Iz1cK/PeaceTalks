BEGIN;

DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS mood CASCADE;

CREATE TYPE language AS ENUM ('English', 'Hebrew', 'Arabic');

CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    language language DEFAULT 'English',
    active BOOLEAN DEFAULT 'true'
);

CREATE TABLE room(
    roomid SERIAL PRIMARY KEY
    roomuuid uuid
)

INSERT INTO users (email,username,password) VALUES ('durd2001@gmail.com','Kuala','$2b$10$OjwDW7DQvNw0WXE6NHxzfup6z1EUcOj5A0ZgmRVtRt6riDeur3ByW');

COMMIT;