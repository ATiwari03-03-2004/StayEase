const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudinaryConfig.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
  if (req.query._filter) {
    const filter = req.query._filter;
    let allListings = await Listing.find({ filters: { $in: filter } });
    if (!allListings)
      req.flash(
        "error",
        "The listing filter you are trying to use does not exist!"
      );
    else res.render("listings/index.ejs", { allListings, filter: filter });
  } else {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings, filter: "all_listings" });
  }
};

module.exports.renderNewListingForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  let listing = req.body.listing;
  listing.filters.push("all_listings");
  listing.owner = req.user._id;
  listing.image = { url: req.file.path, filename: req.file.filename };
  let geometry = {
    type: "Point",
    coordinates: [
      req.body.listing.longitude,
      req.body.listing.latitude,
    ],
  };
  listing.geometry = geometry;
  delete listing.latitude;
  delete listing.longitude;
  await new Listing(listing).save();
  req.flash("success", "Your listing has been created successfully!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "owner",
      },
    })
    .populate("owner");

  if (listing === null) {
    req.flash("error", "The listing you are trying to access does not exist!");
    res.redirect("/listings");
  } else res.render("listings/show.ejs", { listing });
};

module.exports.renderListingEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The listing you are trying to access does not exist!");
    res.redirect("/listings");
  } else {
    res.render("listings/edit.ejs", { listing });
  }
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing)
    return next(new ExpressError(400, "Bad Request, Send valid data for listing!"));
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let reqListing =  req.body.listing;
  if (listing) {
    if (reqListing.latitude !== listing.geometry.coordinates[1] || reqListing.longitude !== listing.geometry.coordinates[0]) {
      let geometry = {
        type: "Point",
        coordinates: [
          reqListing.longitude,
          reqListing.latitude,
        ],
      };
      listing.geometry = geometry;
    }
    delete reqListing.latitude;
    delete reqListing.longitude;
    if (req.file) {
      await cloudinary.uploader.destroy(listing.image.filename);
      listing.image = { url: req.file.path, filename: req.file.filename };
      await Listing.findByIdAndUpdate(id, {
        $set: {
          ...reqListing,
          image: { ...listing.image },
          geometry: listing.geometry,
        },
      });
    } else {
      await Listing.findByIdAndUpdate(id, {
        $set: {
          ...reqListing,
          geometry: listing.geometry,
        },
      });
    }
    req.flash("success", "Your listing has been updated successfully!");
  } else req.flash("error", "The listing you are trying to access does not exist!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndDelete(id);
  await cloudinary.uploader.destroy(listing.image.filename);
  req.flash("success", "Your listing has been deleted successfully!");
  res.redirect("/listings");
};
