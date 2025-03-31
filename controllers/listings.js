const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudinaryConfig.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
  if (req.query._filter) {
    const filter = req.query._filter;
    let allListings = await Listing.find({filters: { $in: filter }});
    if (!allListings) req.flash("error", "The listing filter you are trying to use does not exist!");
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
  let listing = new Listing(req.body.listing);
  listing.owner = req.user._id;
  listing.image = { url: req.file.path, filename: req.file.filename };
  let baseURL = "https://geocode.search.hereapi.com/v1/geocode?q=";
  let address = encodeURIComponent(listing.location + listing.country);
  let key = process.env.HERE_API_KEY;
  let URL = `${baseURL}${address}&apiKey=${key}`;
  let response = await axios.get(URL);
  let geometry = {
    type: "Point",
    coordinates: [
      response.data.items[0].position.lng,
      response.data.items[0].position.lat,
    ],
  };
  listing.geometry = geometry;
  await listing.save();
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
    next(new ExpressError(400, "Bad Request, Send valid data for listing!"));
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (listing) {
    let reqAddress =
      req.body.listing.location + ", " + req.body.listing.country;
    let listingAddress = listing.location + ", " + listing.country;
    if (reqAddress && reqAddress !== listingAddress) {
      listing.location = req.body.listing.location;
      listing.country = req.body.listing.country;
      let baseURL = "https://geocode.search.hereapi.com/v1/geocode?q=";
      let address = encodeURIComponent(listing.location + listing.country);
      let key = process.env.HERE_API_KEY;
      let URL = `${baseURL}${address}&apiKey=${key}`;
      let response = await axios.get(URL);
      let geometry = {
        type: "Point",
        coordinates: [
          response.data.items[0].position.lng,
          response.data.items[0].position.lat,
        ],
      };
      listing.geometry = geometry;
    }
    if (req.file) {
      await cloudinary.uploader.destroy(listing.image.filename);
      listing.image = { url: req.file.path, filename: req.file.filename };
      await Listing.findByIdAndUpdate(id, {
        $set: {
          ...req.body.listing,
          image: { ...listing.image },
          geometry: listing.geometry,
        },
      });
    } else
      await Listing.findByIdAndUpdate(id, {
        $set: {
          ...req.body.listing,
          geometry: listing.geometry,
        },
      });
    req.flash("success", "Your listing has been updated successfully!");
  }
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndDelete(id);
  await cloudinary.uploader.destroy(listing.image.filename);
  req.flash("success", "Your listing has been deleted successfully!");
  res.redirect("/listings");
};
