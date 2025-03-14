const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { userAuth, setRedirectLocals } = require("../middleware.js");

// Signup form
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// Signing up user and storing in db
router.post(
  "/signup",
  setRedirectLocals,
  wrapAsync(async (req, res, next) => {
    try {
      let { username, password, email } = req.body;
      let newUser = new User({
        username: username,
        email: email,
      });
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash(
          "success",
          `${registeredUser.username}, Welcome to StayEase! 🎉`
        );
        // res.redirect(req.session.redirectURL); here, after successful login passport resets req.session resulting in a undefined value for this & thus we use res.locals.

        // res.redirect(res.locals.redirectURL); here, after userAuth middleware we redirect login page leading to completion of req-res cycle thus resulting in loss of res.locals.redirectURL value.
        // but it will work if we create a middleware "setRedirectLocals" which basically is called just before authentication when the session still has the redirectURL then it sets res.locals.redirectURL
        // to req.session.redirectURL, due to which res.locals.redirectURL becomes valid and thus then it can be used.

        if (res.locals.redirectURL) {
          const idx = res.locals.redirectURL.indexOf("/review");
          if (idx === -1) res.redirect(res.locals.redirectURL);
          else res.redirect(res.locals.redirectURL.slice(0, idx));
        } else res.redirect("/listings");
      });
    } catch (err) {
      // catches error associated with registering user say a user with same username exists
      req.flash("error", `User registration failed, ${err.message}!`);
      res.redirect("/user/signup");
    }
  })
);

// Login form
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Loging in user
router.post(
  "/login",
  setRedirectLocals,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  (req, res, next) => {
    req.flash(
      "success",
      `${req.user.username}, Welcome to StayEase! We're thrilled to have you—let’s make your stay amazing! 🎉`
    );
    // res.redirect(req.session.redirectURL); here, after successful login passport resets req.session resulting in a undefined value for this & thus we use res.locals.

    // res.redirect(res.locals.redirectURL); here, after userAuth middleware we redirect login page leading to completion of req-res cycle thus resulting in loss of res.locals.redirectURL value.
    // but it will work if we create a middleware "setRedirectLocals" which basically is called just before authentication when the session still has the redirectURL then it sets res.locals.redirectURL
    // to req.session.redirectURL, due to which res.locals.redirectURL becomes valid and thus then it can be used.

    if (res.locals.redirectURL) {
      const idx = res.locals.redirectURL.indexOf("/review");
      if (idx === -1) res.redirect(res.locals.redirectURL);
      else res.redirect(res.locals.redirectURL.slice(0, idx));
    } else res.redirect("/listings");
  }
);

// Logout User
router.get("/logout", userAuth, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Successfully Logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
