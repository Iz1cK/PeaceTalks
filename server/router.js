const httpStatus = require("http-status");
const checkAuth = require("./middlewares/checkAuth");
const usersController = require("./controllers/users.controller.js");
const router = require("express").Router();
const translate = require("translate-google");
const catchAsync = require("./utils/catchAsync");

router.get(
  "/hello",
  catchAsync(async (req, res) => {
    console.log("hello back");
    let result = await translate("Hello!", { to: "ar" }).then((res) => {
      console.log(res);
      return res;
    });
    res.send(result);
  })
);

router.post("/login", usersController.login);
router.post("/register", usersController.register);

module.exports = router;
