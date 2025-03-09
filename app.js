const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const mongoose = require("mongoose");
const cors = require("cors");
const listing = require("./routes/listing.js");
const review = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");

main()
  .then((res) => console.log("Connected to DB!"))
  .catch((err) =>
    next(new ExpressError(500, "Failed to connect with database!"))
  );

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/stayease");
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.engine("ejs", engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOption = {
  secret: "supersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week expiry
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOption));
app.use(flash());

// Home Route
app.get("/", (req, res) => {
  res.send("Server is on");
});

// Middleware, setting local variables for views
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("Success");
  res.locals.failureMsg = req.flash("Failure");
  next();
});

// Listing Router
app.use("/listings", listing);

// Review Router
app.use("/listings/:id/review", review);

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
