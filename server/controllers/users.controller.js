const userModel = require("../models/users.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");

const SECRET = process.env.SECRET;

const getUsers = catchAsync(async (req, res) => {
  const result = await userModel.getAllUsers();
  res.status(httpStatus.OK).send(result);
});

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  if (!username || !password)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data!");
  const exists = await userModel.getUserByUsername(username);
  if (!exists)
    throw new ApiError(httpStatus.BAD_REQUEST, "User doesn't exist!");
  const match = bcrypt.compareSync(password, exists.password);
  if (!match) throw new ApiError(httpStatus.BAD_REQUEST, "Wrong password!");
  const token = jwt.sign(
    { username: exists.username, userid: exists.userid },
    SECRET
  );
  res.status(httpStatus.OK).send({
    status: "success",
    username: exists.username,
    access_token: token,
    userId: exists.userid,
  });
});

const register = catchAsync(async (req, res) => {
  const { password, email, username } = req.body;
  if (!password || !email || !username)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data!");
  const exists =
    (await userModel.getUserByEmail(email)) ||
    (await userModel.getUserByUsername(username));
  if (!!exists)
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists!");
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const result = await userModel.createNewUser(email, username, hash);
  if (!result) throw new ApiError(500, "There was an error!");
  const token = jwt.sign({ username, userid: result.userid }, SECRET);
  res
    .status(httpStatus.OK)
    .send({ result, status: "success", access_token: token });
});

module.exports = {
  getUsers,
  login,
  register,
};
