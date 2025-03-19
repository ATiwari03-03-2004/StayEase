const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { userAuth, setRedirectLocals } = require("../middleware.js");
const userControllers = require("../controllers/user.js");

router
  .route("/signup")
  .get(userControllers.renderSignupForm) // Signup form
  .post(setRedirectLocals, wrapAsync(userControllers.signup)); // Signing up user and storing in db

router
  .route("/login")
  .get(userControllers.renderLoginForm) // Login form
  .post(
    setRedirectLocals,
    passport.authenticate("local", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    userControllers.login
  ); // Loging in user

router.get("/logout", userAuth, userControllers.logout); // Logout User

module.exports = router;
