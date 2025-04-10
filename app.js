const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const mongoose = require("mongoose");
const cors = require("cors");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const mapRouter = require("./routes/map.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const passport = require("passport");

// Connecting to database
main()
  .then((res) => {
    console.log("Connected to StayEase DB!");
  })
  .catch((err) => console.log("Error: ", err));

async function main() {
  await mongoose.connect(process.env.ATLAS_DB_URL);
}

// Parsing incoming request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// method-override setup
app.use(methodOverride("_method"));

// serving static files
app.use(express.static(path.join(__dirname, "public")));

// cross-origin-resource-sharing setup
app.use(cors());

// ejs-mate setup
app.engine("ejs", engine);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Express-session middleware by use of connect-mongo
const mongoStore = MongoStore.create({
  mongoUrl: process.env.ATLAS_DB_URL,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});

mongoStore.on("error", () => {
  console.log("Error in MONGO SESSION STORE: ", err);
});

const sessionOption = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: mongoStore,
  cookie: {
    expires: Date.now() + 2 * 7 * 24 * 60 * 60 * 1000, // 2 week expiry
    maxAge: 2 * 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOption));

// connect-flash middleware
app.use(flash());

// passport-local middleware setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware, setting local variables for views
app.use((req, res, next) => {
  res.locals.route = req.path;
  res.locals.successMsg = req.flash("success");
  res.locals.failureMsg = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/user/login");
});

// Checking contents of session
// app.get("/debug-session", (req, res) => {
//   console.log("Session data:", req.session);
//   console.log("Passport user:", req.session.passport?.user);
//   res.send(req.session);
// });

// User login/signup router
app.use("/user", userRouter);

// Listing Router
app.use("/listings", listingRouter);

// Review Router
app.use("/listings/:id/review", reviewRouter);

// Map Router
app.use("/map", mapRouter);

// Invalid / Page not found route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("listings/error.ejs", { status, message, err });
});

app.listen(8080, () => {
  console.log("Server is listening to requests!");
});
