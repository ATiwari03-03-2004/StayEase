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

// Index Route
router.get("/", wrapAsync(listingControllers.index));

// New Route
router.get("/new", userAuth, listingControllers.renderNewListingForm);

// Create Route
router.post(
  "/new",
  userAuth,
  validateListing,
  wrapAsync(listingControllers.createListing)
);

// Show Route
router.get("/:id", wrapAsync(listingControllers.showListing));

// Edit Route
router.get(
  "/:id/edit",
  userAuth,
  authorizeUser,
  wrapAsync(listingControllers.renderListingEditForm)
);

// Update Route
router.patch(
  "/:id/edit",
  userAuth,
  authorizeUser,
  validateListing,
  wrapAsync(listingControllers.updateListing)
);

// Delete (listing) Route => Deleting reviews of the listing as well using post mongoose middleware.
router.delete(
  "/:id/delete",
  userAuth,
  authorizeUser,
  wrapAsync(listingControllers.deleteListing)
);

module.exports = router;
