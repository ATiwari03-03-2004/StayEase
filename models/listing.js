const mongoose = require("mongoose");
const Review = require("./review.js");
const User = require("./user.js");
const { required } = require("joi");

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
    url: String,
    filename: String,
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
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  }
});

listingSchema.post("findOneAndDelete", async (listing, next) => {
  if (listing) await Review.deleteMany({ _id: { $in: listing.reviews } });
  next();
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
