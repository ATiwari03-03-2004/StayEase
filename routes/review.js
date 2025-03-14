const express = require("express");
const router = express.Router({ mergeParams: true }); // Merges the parent params i.e; the :id
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
let Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const { userAuth, authorizeReviewOwner } = require("../middleware.js");

// Validating review using reviewSchema defined in joi
const validateReview = (req, res, next) => {
  // => Handling review schema validation using joi
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((err) => err.message).join(", ");
    next(new ExpressError(400, errMsg));
  } else next();
};

// Review Route
router.post(
  "/",
  userAuth,
  validateReview,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let { review } = req.body;
    review.owner = req.user._id;
    let data = await new Review(review).save();
    let listing = await Listing.findById(id);
    listing.reviews.push(data);
    await listing.save(); // Updates the listing review
    req.flash("success", "Your review has been successfully submitted!");
    res.redirect(`/listings/${id}`);
  })
);

// Review Delete Route
router.delete(
  "/:rId",
  userAuth,
  authorizeReviewOwner,
  wrapAsync(async (req, res, next) => {
    let { id, rId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: rId } });
    await Review.findByIdAndDelete(rId);
    req.flash("success", "Your review has been successfully deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
