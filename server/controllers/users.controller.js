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
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data!");
  const exists = await userModel.getUserByEmail(email);
  if (!exists)
    throw new ApiError(httpStatus.BAD_REQUEST, "User doesn't exist!");
  const match = bcrypt.compareSync(password, exists.password);
  if (!match) throw new ApiError(httpStatus.BAD_REQUEST, "Wrong password!");
  const token = jwt.sign(
    { email: exists.email, userid: exists.userid },
    SECRET
  );
  res.status(httpStatus.OK).send({
    status: "success",
    email: exists.email,
    access_token: token,
  });
});

const register = catchAsync(async (req, res) => {
  const { password, email } = req.body;
  if (!password || !email)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data!");
  const exists = await userModel.getUserByEmail(email);
  if (!!exists)
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists!");
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const result = await userModel.createNewUser(email, hash);
  if (!result) throw new ApiError(500, "There was an error!");
  res.status(httpStatus.OK).send({ result, status: "success" });
});

module.exports = {
  getUsers,
  login,
  register,
};
