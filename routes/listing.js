const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const {
  userAuth,
  authorizeUser,
  validateListing,
} = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");

router.get("/", wrapAsync(listingControllers.index)); // Index Route

router
  .route("/new")
  .get(userAuth, listingControllers.renderNewListingForm) // New Route
  .post(userAuth, validateListing, wrapAsync(listingControllers.createListing)); // Create Route

router.get("/:id", wrapAsync(listingControllers.showListing)); // Show Route

router
  .route("/:id/edit")
  .get(
    userAuth,
    authorizeUser,
    wrapAsync(listingControllers.renderListingEditForm)
  ) // Edit Route
  .patch(
    userAuth,
    authorizeUser,
    validateListing,
    wrapAsync(listingControllers.updateListing)
  ); // Update Route

router.delete(
  "/:id/delete",
  userAuth,
  authorizeUser,
  wrapAsync(listingControllers.deleteListing)
); // Delete (listing) Route => Deleting reviews of the listing as well using post mongoose middleware.

module.exports = router;
