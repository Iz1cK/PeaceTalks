const db = require("../database");

const getAllUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

const getUserByEmail = (email) => {
  return db
    .query(`SELECT * FROM users WHERE email=$1`, [email])
    .then(({ rows }) => rows[0]);
};

const createNewUser = (email, password) => {
  return db
    .query(
      `INSERT INTO users (email,password) VALUES ($1,$2) RETURNING userid`,
      [email, password]
    )
    .then(({ rows }) => rows[0]);
};

module.exports = { getAllUsers, getUserByEmail, createNewUser };
