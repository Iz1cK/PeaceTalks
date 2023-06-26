BEGIN;

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    active BOOLEAN DEFAULT 'true'
);

INSERT INTO users (email,password) VALUES ('durd2001@gmail.com', '$2b$10$OjwDW7DQvNw0WXE6NHxzfup6z1EUcOj5A0ZgmRVtRt6riDeur3ByW');

COMMIT;