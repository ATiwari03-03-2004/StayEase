const express = require("express");
const router = express.Router({ mergeParams: true }); // Merges the parent params i.e; the :id
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
let Review = require("../models/review.js");
const { userAuth, authorizeReviewOwner, validateReview } = require("../middleware.js");
const reviewControllers = require("../controllers/reviews.js");

// Review Route
router.post(
  "/",
  userAuth,
  validateReview,
  wrapAsync(reviewControllers.createReview)
);

// Review Delete Route
router.delete(
  "/:rId",
  userAuth,
  authorizeReviewOwner,
  wrapAsync(reviewControllers.deleteReview)
);

module.exports = router;
