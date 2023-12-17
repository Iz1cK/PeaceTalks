const db = require("../database");

const getAllUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

const getUserByEmail = (email) => {
  return db
    .query(`SELECT * FROM users WHERE email=$1`, [email])
    .then(({ rows }) => rows[0]);
};

const getUserByUsername = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username=$1`, [username])
    .then(({ rows }) => rows[0]);
};

const createNewUser = (email, username, password) => {
  return db
    .query(
      `INSERT INTO users (email,username,password) VALUES ($1,$2,$3) RETURNING userid`,
      [email, username, password]
    )
    .then(({ rows }) => rows[0]);
};

module.exports = {
  getAllUsers,
  getUserByEmail,
  getUserByUsername,
  createNewUser,
};
