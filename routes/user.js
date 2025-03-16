const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { userAuth, setRedirectLocals } = require("../middleware.js");
const userControllers = require("../controllers/user.js");

// Signup form
router.get("/signup", userControllers.renderSignupForm);

// Signing up user and storing in db
router.post(
  "/signup",
  setRedirectLocals,
  wrapAsync(userControllers.signup)
);

// Login form
router.get("/login", userControllers.renderLoginForm);

// Loging in user
router.post(
  "/login",
  setRedirectLocals,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  userControllers.login
);

// Logout User
router.get("/logout", userAuth, userControllers.logout);

module.exports = router;
