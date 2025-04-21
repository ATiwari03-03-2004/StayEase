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
    coordinates: [req.body.listing.longitude, req.body.listing.latitude],
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
  let listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "owner",
    },
  });

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
    return next(
      new ExpressError(400, "Bad Request, Send valid data for listing!")
    );
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let reqListing = req.body.listing;
  if (listing.length > 0) {
    if (
      reqListing.latitude !== listing.geometry.coordinates[1] ||
      reqListing.longitude !== listing.geometry.coordinates[0]
    ) {
      let geometry = {
        type: "Point",
        coordinates: [reqListing.longitude, reqListing.latitude],
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
  } else {
    req.flash("error", "The listing you are trying to access does not exist!");
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

module.exports.search = async (req, res, next) => {
  let { search } = req.body;
  const baseURL = "https://geocode.search.hereapi.com/v1/geocode?q=";
  const URL = `${baseURL}${encodeURIComponent(search)}&apiKey=${
    process.env.HERE_API_KEY
  }`;
  let response = await axios.get(URL);
  let listing = await Listing.find({
    geometry: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [
            response.data.items[0].position.lng,
            response.data.items[0].position.lat,
          ],
        },
        $maxDistance: 20000,
      },
    },
  });
  if (listing.length > 0) {
    res.render("listings/search.ejs", {
      allListings: listing,
      lati: response.data.items[0].position.lat,
      longi: response.data.items[0].position.lng,
    });
  } else {
    req.flash(
      "error",
      `There is no listing within the 20-kms range of the address - ${search}`
    );
    res.redirect("/listings");
  }
};
