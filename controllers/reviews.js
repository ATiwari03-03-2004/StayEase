const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res, next) => {
  let { id } = req.params;
  let { review } = req.body;
  review.owner = req.user._id;
  let data = await new Review(review).save();
  let listing = await Listing.findById(id);
  listing.reviews.push(data);
  await listing.save(); // Updates the listing review
  req.flash("success", "Your review has been successfully submitted!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res, next) => {
  let { id, rId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: rId } });
  await Review.findByIdAndDelete(rId);
  req.flash("success", "Your review has been successfully deleted!");
  res.redirect(`/listings/${id}`);
};
