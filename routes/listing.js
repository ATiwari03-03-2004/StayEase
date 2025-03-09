const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

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
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create Route
router.post(
  "/new",
  validateListing,
  wrapAsync(async (req, res, next) => {
    await new Listing(req.body.listing).save();
    req.flash("Success", "Your listing has been created successfully!");
    res.redirect("/listings");
  })
);

// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if (listing === null) {
      req.flash("Failure", "The listing you are trying to access does not exist!");
      res.redirect("/listings");
    } else res.render("listings/show.ejs", { listing });
  })
);

// Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("Failure", "The listing you are trying to access does not exist!");
      res.redirect("/listings");
    } else res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
router.patch(
  "/:id/edit",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing)
      next(new ExpressError(400, "Bad Request, Send valid data for listing!"));
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { $set: { ...req.body.listing } });
    req.flash("Success", "Your listing has been updated successfully!");
    res.redirect(`/listings/${id}`);
  })
);

// Delete (listing) Route => Deleting reviews of the listing as well using post mongoose middleware.
router.delete(
  "/:id/delete",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("Success", "Your listing has been deleted successfully!");
    res.redirect("/listings");
  })
);

module.exports = router;
