const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { userAuth, authorizeUser } = require("../middleware.js");

// Validating listing using listingSchema defined in joi
const validateListing = (req, res, next) => {
  // => Handling listing schema validation using joi
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((err) => err.message).join(", ");
    next(new ExpressError(400, errMsg));
  } else next();
};

// Read Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// New Route
router.get("/new", userAuth, (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
});

// Create Route
router.post(
  "/new",
  userAuth,
  validateListing,
  wrapAsync(async (req, res, next) => {
    let listing = req.body.listing;
    listing.owner = req.user._id;
    await new Listing(listing).save();
    req.flash("success", "Your listing has been created successfully!");
    res.redirect("/listings");
  })
);

// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");

    await listing.populate("reviews.owner");
    if (listing === null) {
      req.flash(
        "error",
        "The listing you are trying to access does not exist!"
      );
      res.redirect("/listings");
    } else res.render("listings/show.ejs", { listing });
  })
);

// Edit Route
router.get(
  "/:id/edit",
  userAuth,
  authorizeUser,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash(
        "error",
        "The listing you are trying to access does not exist!"
      );
      res.redirect("/listings");
    } else res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
router.patch(
  "/:id/edit",
  userAuth,
  authorizeUser,
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing)
      next(new ExpressError(400, "Bad Request, Send valid data for listing!"));
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (listing) {
      await Listing.findByIdAndUpdate(id, { $set: { ...req.body.listing } });
      req.flash("success", "Your listing has been updated successfully!");
    }
    res.redirect(`/listings/${id}`);
  })
);

// Delete (listing) Route => Deleting reviews of the listing as well using post mongoose middleware.
router.delete(
  "/:id/delete",
  userAuth,
  authorizeUser,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Your listing has been deleted successfully!");
    res.redirect("/listings");
  })
);

module.exports = router;
