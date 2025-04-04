const Listing = require("./models/listing.js");
let Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema, listingSchema } = require("./schema.js");

// Checks if a user has logged in before accessing certain privelaged routes
const userAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // res.locals.redirectURL = req.originalUrl;
    req.session.redirectURL = req.originalUrl;
    req.flash(
      "error",
      "Login required! Please log in to your account to proceed with this action."
    );
    return res.redirect("/user/login");
  }
  return next();
};

// Post-login page handling
const setRedirectLocals = (req, res, next) => {
  if (req.session.redirectURL) res.locals.redirectURL = req.session.redirectURL;
  return next();
};

// Authorizing user, whether they are owner of the listing to check if they have edit/delete authority
const authorizeUser = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    return res.redirect(`/listings/${id}`);
  } else if (!res.locals.currentUser._id.equals(listing.owner)) {
    req.flash(
      "error",
      "You are not the owner of this listing, so you cannot perform this action."
    );
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Authorizing user, whether they are owner of the review to check if they have delete authority
const authorizeReviewOwner = async (req, res, next) => {
  let { id, rId } = req.params;
  let review = await Review.findById(rId);
  if (!review) {
    return res.redirect(`/listings/${id}`);
  } else if (!review.owner.equals(res.locals.currentUser._id)) {
    req.flash(
      "error",
      "You are not the owner of this review, so you cannot perform this action."
    );
    return res.redirect(`/listings/${id}`);
  }
  return next();
};

// Validating listing using listingSchema defined in joi
const validateListing = (req, res, next) => {
  // => Handling listing schema validation using joi
  console.log(req.body.listing);
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((err) => err.message).join(", ");
    next(new ExpressError(400, errMsg));
  } else next();
};

// Validating review using reviewSchema defined in joi
const validateReview = (req, res, next) => {
  // => Handling review schema validation using joi
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((err) => err.message).join(", ");
    next(new ExpressError(400, errMsg));
  } else next();
};

module.exports = { userAuth, setRedirectLocals, authorizeUser, authorizeReviewOwner, validateListing, validateReview };
