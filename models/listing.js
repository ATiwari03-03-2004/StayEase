const mongoose = require("mongoose");

const listingSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "https://unsplash.com/photos/the-sun-is-setting-over-a-mountain-range-kZvrNBMh6Po",
    set: (v) => (v === "" ? "https://unsplash.com/photos/the-sun-is-setting-over-a-mountain-range-kZvrNBMh6Po" : v),
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    requied: true,
  },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
