const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewListingForm = (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  let listing = req.body.listing;
  listing.owner = req.user._id;
  await new Listing(listing).save();
  req.flash("success", "Your listing has been created successfully!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  // let listing = await Listing.findById(id)
  //   .populate("reviews")
  //   .populate("owner");
  // await listing.populate("reviews.owner");

  // or using nested populate
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
  } else res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing)
    next(new ExpressError(400, "Bad Request, Send valid data for listing!"));
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (listing) {
    await Listing.findByIdAndUpdate(id, { $set: { ...req.body.listing } });
    req.flash("success", "Your listing has been updated successfully!");
  }
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Your listing has been deleted successfully!");
  res.redirect("/listings");
};
