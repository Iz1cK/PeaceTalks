const ApiError = require("../utils/ApiError");

const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();
const SECRET = process.env.SECRET;

function verifyAccount(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const error = new ApiError(400, "Authroization header required");
    next(error);
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const tokenData = jwt.verify(token, SECRET);
    req.username = tokenData.username;
    req.userid = tokenData.userid;
    next();
  } catch (_error) {
    const error = new ApiError(401, "Invalid token");
    next(error);
  }
}

module.exports = verifyAccount;
