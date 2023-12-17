BEGIN;

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    active BOOLEAN DEFAULT 'true'
);

INSERT INTO users (email,username,password) VALUES ('durd2001@gmail.com','Kuala','$2b$10$OjwDW7DQvNw0WXE6NHxzfup6z1EUcOj5A0ZgmRVtRt6riDeur3ByW');

COMMIT;